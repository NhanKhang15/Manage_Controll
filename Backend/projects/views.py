from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project
from companies.models import Company, Department
from integrations.google_drive import create_drive_folder, trash_drive_item, run_async_drive_op


@api_view(['POST'])
def create_project(request):
    name = request.data.get('name')
    proj_status = request.data.get('status', 'Triển khai')
    company_id = request.data.get('company_id')
    department_id = request.data.get('department_id')
    parent_id = request.data.get('parent_id')

    if not name or not name.strip():
        return Response({'detail': 'Tên folder / dự án không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    company = None
    department = None
    parent = None

    if parent_id:
        try:
            parent = Project.objects.get(id=parent_id)
            company = parent.company
            department = parent.department
        except Project.DoesNotExist:
            return Response({'detail': 'Folder cha không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if department_id and not department:
        try:
            department = Department.objects.get(id=department_id)
            if not company:
                company = department.company
        except Department.DoesNotExist:
            return Response({'detail': 'Phòng ban không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if company_id and not company:
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if not company:
        return Response({'detail': 'Không xác định được công ty tương ứng'}, status=status.HTTP_400_BAD_REQUEST)

    # Xác định parent folder trên Google Drive
    drive_folder_id = None
    drive_folder_url = None
    parent_drive_folder_id = None
    if parent and parent.drive_folder_id:
        parent_drive_folder_id = parent.drive_folder_id
    elif department and department.drive_folder_id:
        parent_drive_folder_id = department.drive_folder_id
    elif company and company.drive_folder_id:
        parent_drive_folder_id = company.drive_folder_id
    else:
        parent_drive_folder_id = getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)

    if parent_drive_folder_id:
        try:
            drive_res = create_drive_folder(name.strip(), parent_drive_folder_id)
            drive_folder_id = drive_res.get('id')
            drive_folder_url = drive_res.get('webViewLink')
        except Exception as e:
            print(f"Error creating project Drive folder: {e}")

    project = Project.objects.create(
        company=company,
        department=department,
        parent=parent,
        name=name.strip(),
        status=proj_status,
        drive_folder_id=drive_folder_id,
        drive_folder_url=drive_folder_url,
    )

    res_data = {
        'id': str(project.id),
        'type': 'project',
        'name': project.name,
        'status': project.status,
        'company_id': str(company.id),
        'department_id': str(department.id) if department else None,
        'drive_folder_id': project.drive_folder_id,
        'drive_folder_url': project.drive_folder_url,
        'children': []
    }
    return Response(res_data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def delete_project(request, pk):
    try:
        project = Project.objects.get(id=pk)
        if project.drive_folder_id:
            run_async_drive_op(trash_drive_item, project.drive_folder_id)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Project.DoesNotExist:
        return Response({'detail': 'Dự án không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
