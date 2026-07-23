from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project
from companies.models import Company


@api_view(['POST'])
def create_project(request):
    company_id = request.data.get('company_id')
    name = request.data.get('name')
    proj_status = request.data.get('status', 'Triển khai')

    if not name or not name.strip():
        return Response({'detail': 'Tên dự án không được để trống'}, status=status.HTTP_400_BAD_REQUEST)
    if not company_id:
        return Response({'detail': 'công ty không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    project = Project.objects.create(
        company=company,
        name=name.strip(),
        status=proj_status
    )

    res_data = {
        'id': str(project.id),
        'type': 'project',
        'name': project.name,
        'status': project.status,
        'children': []
    }
    return Response(res_data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def delete_project(request, pk):
    try:
        project = Project.objects.get(id=pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Project.DoesNotExist:
        return Response({'detail': 'Dự án không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
