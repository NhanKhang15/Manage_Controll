import traceback
from django.conf import settings
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Company, Department
from .serializers import CompanyTreeSerializer
from integrations.google_drive import create_drive_folder


@api_view(['GET'])
def company_tree(request):
    """company_id không truyền -> trả toàn bộ cây công ty gốc trong hệ thống
    (dùng cho màn quản lý đa công ty ở trang Dự án → Phân công). Có company_id
    -> chỉ trả đúng cây của công ty đó, tránh lộ dữ liệu dự án/công việc của
    công ty khác cho các trang scope theo 1 công ty (Dashboard, Công việc)."""
    company_id = request.query_params.get('company_id')
    if company_id:
        companies = Company.objects.filter(id=company_id, is_active=True)
    else:
        companies = Company.objects.filter(parent__isnull=True, is_active=True).order_by('order_index')
    serializer = CompanyTreeSerializer(companies, many=True)
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

        department = Department.objects.create(
            company=company,
            name=name.strip(),
            drive_folder_id=drive_folder_id,
            drive_folder_url=drive_folder_url
        )
        res_data = {
            'id': str(department.id),
            'type': 'department',
            'name': department.name,
            'company_id': str(company.id),
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
