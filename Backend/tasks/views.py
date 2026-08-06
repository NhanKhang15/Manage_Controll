from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task, TaskAssignment
from .serializers import TaskFlatSerializer
from projects.models import Project
from employees.models import Employee


@api_view(['POST'])
def create_task(request):
    project_id = request.data.get('project_id')
    name = request.data.get('name')

    if not name or not name.strip():
        return Response({'detail': 'Tên công việc không được để trống'}, status=status.HTTP_400_BAD_REQUEST)
    if not project_id:
        return Response({'detail': 'Dự án không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'detail': 'Dự án không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    task = Task.objects.create(
        project=project,
        name=name.strip(),
        status='Cần làm',
        is_completed=False
    )

    res_data = {
        'id': str(task.id),
        'type': 'task',
        'name': task.name,
        'status': task.status,
        'completed': task.is_completed
    }
    return Response(res_data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
def task_detail(request, pk):
    """Gộp update + delete trên cùng 1 URL /api/tasks/<pk>/ — trước đây 2 view
    riêng (update_task PATCH, delete_task DELETE) đăng ký trùng path khiến
    Django luôn khớp view đầu tiên bất kể method, làm DELETE không bao giờ
    tới được delete_task (luôn nhận 405 từ update_task)."""
    try:
        task = Task.objects.get(id=pk)
    except Task.DoesNotExist:
        return Response({'detail': 'Công việc không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if 'status' in request.data:
        task.status = request.data['status']
    if 'is_completed' in request.data:
        task.is_completed = request.data['is_completed']
        if task.is_completed and 'status' not in request.data:
            task.status = 'Hoàn thành'
        elif not task.is_completed and 'status' not in request.data:
            task.status = 'Cần làm'

    task.save()
    res_data = {
        'id': str(task.id),
        'type': 'task',
        'name': task.name,
        'status': task.status,
        'completed': task.is_completed
    }
    return Response(res_data)


@api_view(['PATCH'])
def reorder_tasks(request):
    task_ids = request.data.get('taskIds', [])
    new_project_id = request.data.get('newProjectId')
    new_index = request.data.get('newIndex', 0)

    if not new_project_id:
        return Response({'detail': 'Dự án mới không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=new_project_id)
    except Project.DoesNotExist:
        return Response({'detail': 'Dự án mới không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    for idx, tid in enumerate(task_ids):
        Task.objects.filter(id=tid).update(project=project, order_index=new_index + idx)

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

    return Response(TaskFlatSerializer(qs.select_related('project').order_by('due_date'), many=True).data)


@api_view(['GET'])
def department_tasks_view(request):
    employee = getattr(request.user, 'employee', None)
    if employee is None:
        return Response({'detail': 'Tài khoản chưa được gắn với nhân viên nào'}, status=status.HTTP_404_NOT_FOUND)

    dept_ids = list(employee.employee_departments.values_list('department_id', flat=True))
    if not dept_ids:
        return Response([])

    company_id = request.query_params.get('company_id')
    qs = Task.objects.filter(
        assignments__employee__employee_departments__department_id__in=dept_ids
    ).distinct()
    if company_id:
        qs = qs.filter(project__company_id=company_id)

    return Response(TaskFlatSerializer(qs.select_related('project').order_by('due_date'), many=True).data)


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
