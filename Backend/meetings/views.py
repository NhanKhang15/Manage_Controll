from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from employees.services import get_employee_from_request
from integrations.ai_client import AIConfigError
from meetings.models import MeetingTranscript
from meetings.serializers import MeetingTranscriptSerializer
from meetings.services import create_or_update_transcript, summarize_transcript


@api_view(['GET', 'POST'])
def meeting_transcripts_view(request):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'POST':
        data = request.data
        transcript_id = data.get('id')

        if not transcript_id and not data.get('company_id'):
            return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

        if transcript_id:
            try:
                existing = MeetingTranscript.objects.get(id=transcript_id)
            except MeetingTranscript.DoesNotExist:
                return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
            if existing.created_by_id != current_emp.id:
                return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        transcript = create_or_update_transcript(data, current_emp, transcript_id=transcript_id)
        return Response(
            MeetingTranscriptSerializer(transcript).data,
            status=status.HTTP_200_OK if transcript_id else status.HTTP_201_CREATED,
        )

    event_id = request.query_params.get('event_id')
    if event_id:
        queryset = MeetingTranscript.objects.filter(event_id=event_id)
    else:
        queryset = MeetingTranscript.objects.filter(created_by=current_emp)

    return Response(MeetingTranscriptSerializer(queryset, many=True).data)


@api_view(['POST'])
def meeting_transcript_summarize_view(request, pk):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    try:
        transcript = MeetingTranscript.objects.get(id=pk)
    except MeetingTranscript.DoesNotExist:
        return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if transcript.created_by_id != current_emp.id:
        return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if not transcript.transcript_text.strip():
        return Response({'detail': 'Chưa có nội dung bản ghi để tóm tắt'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        summary = summarize_transcript(pk, current_emp)
    except AIConfigError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'summary_text': summary})


@api_view(['DELETE'])
def meeting_transcript_delete_view(request, pk):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    try:
        transcript = MeetingTranscript.objects.get(id=pk)
    except MeetingTranscript.DoesNotExist:
        return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if transcript.created_by_id != current_emp.id:
        return Response({'detail': 'Biên bản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    transcript.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
