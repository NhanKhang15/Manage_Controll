from django.db.models import F, Case, When, Value, IntegerField
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task, TaskAssignment
from .serializers import TaskFlatSerializer, TaskTreeSerializer
from projects.models import Project
from employees.models import Employee
from companies.models import Department

VALID_STATUSES = {choice[0] for choice in Task.STATUS_CHOICES}


def _descendant_ids(task):
    ids = set()
    stack = list(task.children.all())
    while stack:
        node = stack.pop()
        ids.add(node.id)
        stack.extend(node.children.all())
    return ids


def _build_paginated_task_response(qs, request):
    status_param = request.query_params.get('status')
    if status_param and status_param.strip() and status_param.lower() != 'all':
        qs = qs.filter(status=status_param.strip())

    search_param = request.query_params.get('search', '').strip()
    if search_param:
        qs = qs.filter(name__icontains=search_param)

    project_id = request.query_params.get('project_id')
    if project_id:
        qs = qs.filter(project_id=project_id)

    department_id = request.query_params.get('department_id')
    if department_id:
        # department giờ là FK trực tiếp trên Task (không còn suy ra qua
        # assignments), nên lọc thẳng, không cần join/distinct nữa.
        qs = qs.filter(department_id=department_id)

    flag_filter = request.query_params.get('flag_filter', '').strip().lower()
    if flag_filter == 'flag':
        qs = qs.filter(is_flagged=True)
    elif flag_filter == 'problem':
        qs = qs.filter(is_problem=True)
    elif flag_filter == 'overdue':
        today = timezone.now().date()
        qs = qs.filter(due_date__lt=today, is_completed=False)
    elif flag_filter == 'auto':
        qs = qs.filter(can_automate=True)

    ordering = request.query_params.get('ordering', '').strip()
    ORDER_MAP = {
        'due_date': F('due_date').asc(nulls_last=True),
        'due_date_asc': F('due_date').asc(nulls_last=True),
        '-due_date': F('due_date').desc(nulls_last=True),
        'due_date_desc': F('due_date').desc(nulls_last=True),
        'created_at': 'created_at',
        'created_at_asc': 'created_at',
        '-created_at': '-created_at',
        'created_at_desc': '-created_at',
        'name': 'name',
        'name_asc': 'name',
        '-name': '-name',
        'name_desc': '-name',
        'status': 'status',
        'status_asc': 'status',
        '-status': '-status',
        'status_desc': '-status',
        # FK trực tiếp trên Task (project, pic, department) nên order_by qua
        # quan hệ được thẳng, không cần subquery nữa.
        'project_asc': F('project__name').asc(nulls_last=True),
        'project_desc': F('project__name').desc(nulls_last=True),
        'pic_asc': F('pic__full_name').asc(nulls_last=True),
        'pic_desc': F('pic__full_name').desc(nulls_last=True),
        'department_asc': F('department__name').asc(nulls_last=True),
        'department_desc': F('department__name').desc(nulls_last=True),
        # "% hoàn thành" hiển thị trên FE chỉ có 2 mức 0%/100% theo is_completed
        # (xem TaskTable.tsx) nên dùng thẳng cờ này làm khoá sắp xếp.
        'progress_asc': F('is_completed').asc(),
        'progress_desc': F('is_completed').desc(),
    }

    if ordering in ('alert_asc', 'alert_desc'):
        # "Cảnh báo" cũng là giá trị suy ra (AlertTag ở FE): xếp hạng mức độ
        # khẩn cấp — Trễ hạn (0) → chưa có cảnh báo (1) → Hoàn tất (2).
        today = timezone.now().date()
        qs = qs.annotate(
            alert_rank=Case(
                When(is_completed=True, then=Value(2)),
                When(due_date__lt=today, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        )
        alert_order = 'alert_rank' if ordering == 'alert_asc' else '-alert_rank'
        qs = qs.order_by(alert_order, 'created_at')
    else:
        order_expr = ORDER_MAP.get(ordering, F('due_date').asc(nulls_last=True))
        if isinstance(order_expr, str):
            qs = qs.order_by(order_expr)
        else:
            qs = qs.order_by(order_expr, 'created_at')

    total_count = qs.count()

    has_limit_param = 'limit' in request.query_params
    has_offset_param = 'offset' in request.query_params
    has_page_param = 'page' in request.query_params

    try:
        limit = min(int(request.query_params.get('limit', 10)), 100)
    except ValueError:
        limit = 10

    try:
        offset = max(int(request.query_params.get('offset', 0)), 0)
    except ValueError:
        offset = 0

    page_qs = qs.select_related('project', 'pic', 'department').prefetch_related('assignments__employee')[offset:offset + limit]
    serialized_data = TaskFlatSerializer(page_qs, many=True).data

    if has_limit_param or has_offset_param or has_page_param:
        return Response({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': (offset + limit) < total_count,
            'results': serialized_data
        })

    return Response(serialized_data)


@api_view(['POST'])
def create_task(request):
    name = request.data.get('name')
    if not name or not name.strip():
        return Response({'detail': 'Tên công việc không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    parent = None
    parent_id = request.data.get('parent_id')

    department = None
    department_id = request.data.get('department_id')
    if department_id:
        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response({'detail': 'Phòng ban không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if parent_id:
        try:
            parent = Task.objects.get(id=parent_id)
        except Task.DoesNotExist:
            return Response({'detail': 'Việc cha không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        project = parent.project
        if not department and parent.department:
            department = parent.department
    else:
        project_id = request.data.get('project_id')
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                return Response({'detail': 'Dự án không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        elif department:
            # Lấy dự án đầu tiên của công ty thuộc phòng ban, hoặc tạo dự án chung
            project = department.company.projects.order_by('order_index').first()
            if not project:
                project = Project.objects.create(
                    company=department.company,
                    name=f"Dự án chung - {department.company.name}"
                )
        else:
            return Response({'detail': 'Cần chọn dự án hoặc phòng ban'}, status=status.HTTP_400_BAD_REQUEST)

    pic = None
    pic_id = request.data.get('pic_id')
    if pic_id:
        try:
            pic = Employee.objects.get(id=pic_id)
        except Employee.DoesNotExist:
            return Response({'detail': 'Người phụ trách không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    drive_file_id = None
    drive_file_url = None
    parent_drive_folder_id = None
    if project and project.drive_folder_id:
        parent_drive_folder_id = project.drive_folder_id
    elif department and department.drive_folder_id:
        parent_drive_folder_id = department.drive_folder_id
    elif project and project.company and project.company.drive_folder_id:
        parent_drive_folder_id = project.company.drive_folder_id
    elif department and department.company and department.company.drive_folder_id:
        parent_drive_folder_id = department.company.drive_folder_id
    else:
        from django.conf import settings
        parent_drive_folder_id = getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)

    if parent_drive_folder_id:
        try:
            from integrations.google_drive import create_task_google_doc
            meta = {
                'company': department.company.name if (department and department.company) else (project.company.name if (project and project.company) else ''),
                'department': department.name if department else '',
                'project': project.name if project else '',
                'pic': pic.full_name if pic else '',
                'status': 'Cần làm',
                'notes': (request.data.get('notes') or '').strip()
            }
            drive_res = create_task_google_doc(name.strip(), parent_drive_folder_id, meta)
            drive_file_id = drive_res.get('id')
            drive_file_url = drive_res.get('webViewLink')
        except Exception as e:
            print(f"Error creating Google Doc for task: {e}")

    task = Task.objects.create(
        project=project,
        parent=parent,
        name=name.strip(),
        status='Cần làm',
        is_completed=False,
        pic=pic,
        department=department,
        is_milestone=bool(request.data.get('is_milestone', False)),
        is_flagged=bool(request.data.get('is_flagged', False)),
        is_problem=bool(request.data.get('is_problem', False)),
        can_automate=bool(request.data.get('can_automate', False)),
        effort_points=request.data.get('effort_points') or None,
        notes=(request.data.get('notes') or '').strip(),
        drive_file_id=drive_file_id,
        drive_file_url=drive_file_url,
    )
    return Response(TaskTreeSerializer(task).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
def task_detail(request, pk):
    try:
        task = Task.objects.get(id=pk)
    except Task.DoesNotExist:
        return Response({'detail': 'Công việc không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if task.drive_file_id:
            from integrations.google_drive import trash_drive_item, run_async_drive_op
            run_async_drive_op(trash_drive_item, task.drive_file_id)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = request.data

    if 'name' in data:
        if not data['name'] or not str(data['name']).strip():
            return Response({'detail': 'Tên công việc không được để trống'}, status=status.HTTP_400_BAD_REQUEST)
        new_name = data['name'].strip()
        if new_name != task.name and task.drive_file_id:
            from integrations.google_drive import rename_drive_item, run_async_drive_op
            run_async_drive_op(rename_drive_item, task.drive_file_id, new_name)
        task.name = new_name

    if 'status' in data:
        if data['status'] not in VALID_STATUSES:
            return Response({'detail': f'status không hợp lệ (chỉ nhận {sorted(VALID_STATUSES)})'}, status=status.HTTP_400_BAD_REQUEST)
        task.status = data['status']

    if 'is_completed' in data:
        was_completed = task.is_completed
        task.is_completed = data['is_completed']
        if task.is_completed and not was_completed:
            task.completed_at = timezone.now()
        elif not task.is_completed and was_completed:
            task.completed_at = None
        if task.is_completed and 'status' not in data:
            task.status = 'Hoàn thành'
        elif not task.is_completed and 'status' not in data:
            task.status = 'Cần làm'

    if 'pic_id' in data:
        pic_id = data['pic_id']
        if not pic_id:
            task.pic = None
        else:
            try:
                task.pic = Employee.objects.get(id=pic_id)
            except Employee.DoesNotExist:
                return Response({'detail': 'Người phụ trách không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if 'department_id' in data:
        department_id = data['department_id']
        if not department_id:
            task.department = None
        else:
            try:
                task.department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                return Response({'detail': 'Phòng ban không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if 'is_milestone' in data:
        task.is_milestone = bool(data['is_milestone'])

    if 'is_flagged' in data:
        task.is_flagged = bool(data['is_flagged'])

    if 'is_problem' in data:
        task.is_problem = bool(data['is_problem'])

    if 'can_automate' in data:
        task.can_automate = bool(data['can_automate'])

    if 'effort_points' in data:
        task.effort_points = data['effort_points'] or None

    if 'notes' in data:
        task.notes = (data['notes'] or '').strip()

    if 'due_date' in data:
        task.due_date = data['due_date'] or None

    if 'parent_id' in data:
        new_parent_id = data['parent_id']
        if not new_parent_id:
            task.parent = None
        else:
            if new_parent_id == task.id:
                return Response({'detail': 'Việc không thể là cha của chính nó'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                new_parent = Task.objects.get(id=new_parent_id)
            except Task.DoesNotExist:
                return Response({'detail': 'Việc cha không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
            if new_parent.id in _descendant_ids(task):
                return Response({'detail': 'Không thể gán việc con làm việc cha (tạo vòng lặp)'}, status=status.HTTP_400_BAD_REQUEST)
            task.parent = new_parent
            task.project = new_parent.project

    task.save()
    return Response(TaskTreeSerializer(task).data)


@api_view(['PATCH'])
def reorder_tasks(request):
    task_ids = request.data.get('taskIds', [])
    new_parent_target = request.data.get('newProjectId')
    new_index = request.data.get('newIndex', 0)

    if not new_parent_target:
        return Response({'detail': 'Mục tiêu mới không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    project = Project.objects.filter(id=new_parent_target).first()
    department = Department.objects.filter(id=new_parent_target).first()
    parent_task = Task.objects.filter(id=new_parent_target).first()

    if not project and not department and not parent_task:
        return Response({'detail': 'Mục tiêu mới không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    for idx, tid in enumerate(task_ids):
        task = Task.objects.filter(id=tid).first()
        proj_item = Project.objects.filter(id=tid).first()

        if task:
            target_drive_folder_id = None
            if project:
                task.project = project
                task.department = project.department
                task.parent = None
                task.order_index = new_index + idx
                task.save()
                target_drive_folder_id = project.drive_folder_id
            elif department:
                task.department = department
                task.project = None
                task.parent = None
                task.order_index = new_index + idx
                task.save()
                target_drive_folder_id = department.drive_folder_id
            elif parent_task:
                if parent_task.id != task.id:
                    task.parent = parent_task
                    task.project = parent_task.project
                    task.department = parent_task.department
                    task.order_index = new_index + idx
                    task.save()
                    target_drive_folder_id = parent_task.project.drive_folder_id if parent_task.project else None

            if task.drive_file_id and target_drive_folder_id:
                from integrations.google_drive import move_drive_item, run_async_drive_op
                run_async_drive_op(move_drive_item, task.drive_file_id, target_drive_folder_id)

        elif proj_item:
            target_drive_folder_id = None
            if department:
                proj_item.department = department
                proj_item.parent = None
                proj_item.order_index = new_index + idx
                proj_item.save()
                target_drive_folder_id = department.drive_folder_id
            elif project:
                if project.id != proj_item.id:
                    proj_item.parent = project
                    proj_item.department = project.department
                    proj_item.order_index = new_index + idx
                    proj_item.save()
                    target_drive_folder_id = project.drive_folder_id

            if proj_item.drive_folder_id and target_drive_folder_id:
                from integrations.google_drive import move_drive_item, run_async_drive_op
                run_async_drive_op(move_drive_item, proj_item.drive_folder_id, target_drive_folder_id)

    return Response({'detail': 'Reordered successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def my_tasks_view(request):
    employee = getattr(request.user, 'employee', None)
    if employee is None:
        return Response({'detail': 'Tài khoản chưa được gắn với nhân viên nào'}, status=status.HTTP_404_NOT_FOUND)

    company_id = request.query_params.get('company_id')
    qs = Task.objects.filter(assignments__employee=employee).distinct()
    if company_id:
        qs = qs.filter(project__company_id=company_id)

    return _build_paginated_task_response(qs, request)


@api_view(['GET'])
def department_tasks_view(request):
    employee = getattr(request.user, 'employee', None)
    if employee is None:
        return Response({'detail': 'Tài khoản chưa được gắn với nhân viên nào'}, status=status.HTTP_404_NOT_FOUND)

    dept_ids = list(employee.employee_departments.values_list('department_id', flat=True))
    if not dept_ids:
        has_pagination = 'limit' in request.query_params or 'offset' in request.query_params or 'page' in request.query_params
        if has_pagination:
            return Response({'total': 0, 'limit': 10, 'offset': 0, 'has_more': False, 'results': []})
        return Response([])

    company_id = request.query_params.get('company_id')
    qs = Task.objects.filter(
        assignments__employee__employee_departments__department_id__in=dept_ids
    ).distinct()
    if company_id:
        qs = qs.filter(project__company_id=company_id)

    return _build_paginated_task_response(qs, request)


@api_view(['GET'])
def all_tasks_view(request):
    company_id = request.query_params.get('company_id')
    qs = Task.objects.all()
    if company_id:
        qs = qs.filter(project__company_id=company_id)

    return _build_paginated_task_response(qs, request)


@api_view(['POST'])
def create_task_assignment(request):
    task_id = request.data.get('task_id')
    employee_id = request.data.get('employee_id')
    role = request.data.get('role', 'assignee')

    try:
        task = Task.objects.get(id=task_id)
        employee = Employee.objects.get(id=employee_id)
    except (Task.DoesNotExist, Employee.DoesNotExist):
        return Response({'detail': 'Task hoặc Employee không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    assignment, created = TaskAssignment.objects.get_or_create(
        task=task,
        employee=employee,
        role=role
    )
    return Response({'id': str(assignment.id), 'role': assignment.role}, status=status.HTTP_201_CREATED)
