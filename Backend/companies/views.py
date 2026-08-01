import traceback
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Company
from .serializers import CompanyTreeSerializer
from integrations.google_drive import create_drive_folder


@api_view(['GET'])
def company_tree(request):
    root_companies = Company.objects.filter(parent__isnull=True, is_active=True).order_by('order_index')
    serializer = CompanyTreeSerializer(root_companies, many=True)
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
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Company.DoesNotExist:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_departments(request):
    company_id = request.query_params.get('company_id')
    from .models import Department
    qs = Department.objects.all()
    if company_id:
        qs = qs.filter(company_id=company_id)
    qs = qs.order_by('order_index', 'name')

    data = [
        {
            'id': str(d.id),
            'name': d.name,
            'company_id': str(d.company_id),
            'order_index': d.order_index,
        }
        for d in qs
    ]
    return Response(data)
