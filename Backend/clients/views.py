from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Client, ClientComment
from employees.models import Employee
from employees.services import get_employee_from_request
from projects.models import Project


def _serialize_client(c, *, with_comments=False):
    data = {
        'id': c.id,
        'name': c.name,
        'contact_name': c.contact_name,
        'contact_role': c.contact_role,
        'phone': c.phone,
        'email': c.email,
        'status': c.status,
        'owner_id': c.owner_id,
        'owner_name': c.owner.full_name if c.owner_id else None,
        'contract_info': c.contract_info,
        'source': c.source,
        'notes': c.notes,
        'linked_project_id': c.linked_project_id,
        'linked_project_name': c.linked_project.name if c.linked_project_id else None,
        'stages': {
            'rnd': c.stage_rnd, 'define': c.stage_define, 'suggest': c.stage_suggest, 'solution': c.stage_solution,
        },
        'created_at': c.created_at,
    }
    if with_comments:
        data['comments'] = [_serialize_comment(cm) for cm in c.comments.select_related('author').all()]
    return data


def _serialize_comment(cm):
    return {
        'id': cm.id,
        'author_name': cm.author.full_name if cm.author_id else 'Ẩn danh',
        'content': cm.content,
        'is_internal': cm.is_internal,
        'created_at': cm.created_at,
    }


@api_view(['GET', 'POST'])
def clients_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        name = (data.get('name') or '').strip()
        if not name:
            return Response({'detail': 'Tên khách hàng không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        owner = get_employee_from_request(request)
        owner_id = data.get('owner_id')
        if owner_id:
            owner = Employee.objects.filter(id=owner_id).first() or owner

        client = Client.objects.create(
            company_id=company_id,
            name=name,
            contact_name=(data.get('contact_name') or '').strip(),
            contact_role=(data.get('contact_role') or '').strip(),
            phone=(data.get('phone') or '').strip(),
            email=data.get('email') or None,
            status=data.get('status') or 'lead',
            owner=owner,
            source=(data.get('source') or '').strip(),
        )
        return Response(_serialize_client(client), status=status.HTTP_201_CREATED)

    clients = Client.objects.filter(company_id=company_id).select_related('owner', 'linked_project')
    return Response([_serialize_client(c) for c in clients])


@api_view(['GET', 'PATCH', 'DELETE'])
def client_detail_view(request, pk):
    try:
        client = Client.objects.select_related('owner', 'linked_project').get(id=pk)
    except Client.DoesNotExist:
        return Response({'detail': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == 'GET':
        return Response(_serialize_client(client, with_comments=True))

    data = request.data
    if 'status' in data:
        client.status = data['status']
    if 'owner_id' in data:
        client.owner = Employee.objects.filter(id=data['owner_id']).first() if data['owner_id'] else None
    if 'contract_info' in data:
        client.contract_info = data['contract_info'] or ''
    if 'notes' in data:
        client.notes = data['notes'] or ''
    if 'source' in data:
        client.source = data['source'] or ''
    if 'linked_project_id' in data:
        pid = data['linked_project_id']
        client.linked_project = Project.objects.filter(id=pid).first() if pid else None
    if 'stages' in data and isinstance(data['stages'], dict):
        stages = data['stages']
        if 'rnd' in stages:
            client.stage_rnd = stages['rnd']
        if 'define' in stages:
            client.stage_define = stages['define']
        if 'suggest' in stages:
            client.stage_suggest = stages['suggest']
        if 'solution' in stages:
            client.stage_solution = stages['solution']
    client.save()
    return Response(_serialize_client(client, with_comments=True))


@api_view(['POST'])
def client_comments_view(request, pk):
    try:
        client = Client.objects.get(id=pk)
    except Client.DoesNotExist:
        return Response({'detail': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)

    content = (request.data.get('content') or '').strip()
    if not content:
        return Response({'detail': 'Nội dung không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    author = get_employee_from_request(request)
    comment = ClientComment.objects.create(
        client=client, author=author, content=content, is_internal=bool(request.data.get('is_internal', True)),
    )
    return Response(_serialize_comment(comment), status=status.HTTP_201_CREATED)
