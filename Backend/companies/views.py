import traceback
from django.conf import settings
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Company, Department
from .serializers import CompanyTreeSerializer
from integrations.google_drive import create_drive_folder


from employees.models import EmployeeCompany


@api_view(['GET'])
def company_options(request):
    """
    Endpoint siêu nhẹ trả danh sách phẳng công ty (id, name, parent_id, order_index)
    dùng cho dropdowns (Calendar, Projects, v.v.).
    Chỉ trả về các công ty mà user có quyền truy cập.
    """
    employee = getattr(request.user, 'employee', None)
    qs = Company.objects.filter(is_active=True)

    if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False)) and employee:
        user_comp_ids = EmployeeCompany.objects.filter(
            employee=employee, left_at__isnull=True
        ).values_list('company_id', flat=True)
        qs = qs.filter(id__in=user_comp_ids)

    qs = qs.order_by('order_index', 'name')
    data = [
        {
            'id': str(c.id),
            'name': c.name,
            'parent_id': str(c.parent_id) if c.parent_id else None,
            'order_index': c.order_index,
        }
        for c in qs
    ]
    return Response(data)


@api_view(['GET'])
def company_tree(request):
    """company_id không truyền -> trả toàn bộ cây công ty gốc trong quyền của user.
    Có company_id -> chỉ trả đúng cây của công ty đó sau khi xác thực quyền hạn."""
    employee = getattr(request.user, 'employee', None)
    company_id = request.query_params.get('company_id')

    qs = Company.objects.filter(is_active=True)

    if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False)) and employee:
        user_comp_ids = set(
            EmployeeCompany.objects.filter(employee=employee, left_at__isnull=True).values_list('company_id', flat=True)
        )
        if company_id:
            if company_id not in user_comp_ids:
                return Response({'detail': 'Bạn không có quyền truy cập công ty này'}, status=status.HTTP_403_FORBIDDEN)
            qs = qs.filter(id=company_id)
        else:
            qs = qs.filter(id__in=user_comp_ids, parent__isnull=True).order_by('order_index')
    else:
        if company_id:
            qs = qs.filter(id=company_id)
        else:
            qs = qs.filter(parent__isnull=True).order_by('order_index')

    # Không prefetch sâu ở đây nữa: mọi nhánh con trong cây đều được
    # CompanyTreeSerializer/DepartmentTreeSerializer/ProjectTreeSerializer/
    # TaskTreeSerializer tự lọc lại (.filter()/.order_by()) ở từng cấp — filter
    # lại trên 1 quan hệ đã prefetch_related() sẽ bỏ qua cache và bắn query mới,
    # nên prefetch sâu nhiều tầng như cũ chỉ tốn thêm round-trip mà không dùng
    # tới. select_related/prefetch_related quan trọng (pic, department,
    # assignees, checklist) đã được gắn thẳng vào từng hàm _top_tasks/
    # _direct_tasks/_children ở nơi query thật sự diễn ra.
    serializer = CompanyTreeSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_company_with_folder(request):
    name = request.data.get('name')
    parent_id = request.data.get('parent_id')

    if not name or not name.strip():
        return Response({'detail': 'Tên công ty không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    parent_company = None
    parent_folder_id = getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)

    if parent_id:
        try:
            parent_company = Company.objects.get(id=parent_id)
            if parent_company.drive_folder_id:
                parent_folder_id = parent_company.drive_folder_id
        except Company.DoesNotExist:
            return Response({'detail': 'Công ty cha không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    drive_folder_id = None
    drive_folder_url = None

    if parent_folder_id:
        try:
            print(f"Creating Drive folder '{name}' inside parent '{parent_folder_id}'...")
            drive_res = create_drive_folder(name.strip(), parent_folder_id)
            drive_folder_id = drive_res.get('id')
            drive_folder_url = drive_res.get('webViewLink')
            print(f"Drive folder created successfully: id={drive_folder_id}, url={drive_folder_url}")
        except Exception as e:
            print(f"Error creating Google Drive folder: {e}")
            traceback.print_exc()

    company = Company.objects.create(
        name=name.strip(),
        parent=parent_company,
        drive_folder_id=drive_folder_id,
        drive_folder_url=drive_folder_url
    )

    res_data = {
        'id': str(company.id),
        'type': 'company',
        'name': company.name,
        'drive_folder_id': company.drive_folder_id,
        'drive_folder_url': company.drive_folder_url,
        'childCount': None,
        'children': []
    }
    return Response(res_data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH'])
def company_alert_settings(request, pk):
    try:
        company = Company.objects.get(id=pk)
    except Company.DoesNotExist:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        try:
            days = int(request.data.get('due_soon_days'))
        except (TypeError, ValueError):
            return Response({'detail': 'due_soon_days phải là số nguyên'}, status=status.HTTP_400_BAD_REQUEST)
        if days < 0:
            return Response({'detail': 'due_soon_days không được âm'}, status=status.HTTP_400_BAD_REQUEST)
        company.due_soon_days = days
        company.save(update_fields=['due_soon_days'])

    return Response({'id': str(company.id), 'due_soon_days': company.due_soon_days})


@api_view(['DELETE'])
def delete_company(request, pk):
    try:
        company = Company.objects.get(id=pk)
        if company.drive_folder_id:
            from integrations.google_drive import trash_drive_item, run_async_drive_op
            run_async_drive_op(trash_drive_item, company.drive_folder_id)
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Company.DoesNotExist:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
def get_departments(request):
    if request.method == 'POST':
        name = request.data.get('name')
        company_id = request.data.get('company_id')
        if not name or not name.strip():
            return Response({'detail': 'Tên phòng ban không được để trống'}, status=status.HTTP_400_BAD_REQUEST)
        if not company_id:
            return Response({'detail': 'Công ty không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        drive_folder_id = None
        drive_folder_url = None
        parent_folder_id = company.drive_folder_id or getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)
        if parent_folder_id:
            try:
                from integrations.google_drive import create_drive_folder
                drive_res = create_drive_folder(f"Phòng {name.strip()}", parent_folder_id)
                drive_folder_id = drive_res.get('id')
                drive_folder_url = drive_res.get('webViewLink')
            except Exception as e:
                print(f"Error creating department Drive folder: {e}")

        order_index = request.data.get('order_index', 0)
        department = Department.objects.create(
            company=company,
            name=name.strip(),
            order_index=order_index if isinstance(order_index, int) else 0,
            drive_folder_id=drive_folder_id,
            drive_folder_url=drive_folder_url
        )
        res_data = {
            'id': str(department.id),
            'type': 'department',
            'name': department.name,
            'company_id': str(company.id),
            'order_index': department.order_index,
            'drive_folder_id': department.drive_folder_id,
            'drive_folder_url': department.drive_folder_url,
            'children': []
        }
        return Response(res_data, status=status.HTTP_201_CREATED)

    company_id = request.query_params.get('company_id')
    qs = Department.objects.annotate(
        employee_count=Count('department_employees', filter=Q(department_employees__left_at__isnull=True), distinct=True)
    )
    if company_id:
        qs = qs.filter(company_id=company_id)

    ordering = request.query_params.get('ordering', '').strip()
    ORDER_MAP = {
        'name_asc': 'name',
        'name_desc': '-name',
        'order_index_asc': 'order_index',
        'order_index_desc': '-order_index',
        'created_at_asc': 'created_at',
        'created_at_desc': '-created_at',
        'employee_count_asc': 'employee_count',
        'employee_count_desc': '-employee_count',
    }
    order_field = ORDER_MAP.get(ordering)
    qs = qs.order_by(order_field, 'name') if order_field else qs.order_by('order_index', 'name')

    data = [
        {
            'id': str(d.id),
            'name': d.name,
            'company_id': str(d.company_id),
            'order_index': d.order_index,
            'employee_count': d.employee_count,
            'drive_folder_id': d.drive_folder_id,
            'drive_folder_url': d.drive_folder_url,
        }
        for d in qs
    ]
    return Response(data)


@api_view(['DELETE'])
def delete_department(request, pk):
    try:
        dept = Department.objects.get(id=pk)
        if dept.drive_folder_id:
            from integrations.google_drive import trash_drive_item, run_async_drive_op
            run_async_drive_op(trash_drive_item, dept.drive_folder_id)
        dept.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Department.DoesNotExist:
        return Response({'detail': 'Phòng ban không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def sync_drive_view(request):
    company_id = request.data.get('company_id')
    from integrations.google_drive import sync_entire_tree_to_drive
    res = sync_entire_tree_to_drive(company_id=company_id)
    return Response(res, status=status.HTTP_200_OK if res.get('success') else status.HTTP_400_BAD_REQUEST)
