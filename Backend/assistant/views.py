from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from employees.services import get_employee_from_request
from integrations.ai_client import AIConfigError
from .models import Conversation
from .serializers import ConversationSerializer, MessageSerializer
from .services import send_message


@api_view(['GET', 'POST'])
def conversations_view(request):
    employee = get_employee_from_request(request)
    if employee is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = Conversation.objects.filter(employee=employee)
        company_id = request.query_params.get('company_id')
        if company_id:
            qs = qs.filter(company_id=company_id)
        return Response(ConversationSerializer(qs, many=True).data)

    company_id = request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)
    conversation = Conversation.objects.create(company_id=company_id, employee=employee)
    return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def conversation_delete_view(request, pk):
    employee = get_employee_from_request(request)
    try:
        conversation = Conversation.objects.get(id=pk, employee=employee)
    except Conversation.DoesNotExist:
        return Response({'detail': 'Không tìm thấy cuộc trò chuyện'}, status=status.HTTP_404_NOT_FOUND)
    conversation.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def conversation_messages_view(request, pk):
    employee = get_employee_from_request(request)
    if employee is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    try:
        conversation = Conversation.objects.get(id=pk, employee=employee)
    except Conversation.DoesNotExist:
        return Response({'detail': 'Không tìm thấy cuộc trò chuyện'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(MessageSerializer(conversation.messages.all(), many=True).data)

    content = (request.data.get('content') or '').strip()
    attachment_url = request.data.get('attachment_url') or None
    attachment_name = request.data.get('attachment_name') or None
    if not content and not attachment_name:
        return Response({'detail': 'Nội dung không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        assistant_msg = send_message(conversation, employee, content, attachment_url, attachment_name)
    except AIConfigError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'conversation': ConversationSerializer(conversation).data,
        'message': MessageSerializer(assistant_msg).data,
    }, status=status.HTTP_201_CREATED)
