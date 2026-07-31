from django.utils import timezone

from integrations.ai_client import call_llm
from meetings.models import MeetingTranscript


def create_or_update_transcript(data, requester_employee, transcript_id=None):
    text = data.get('transcript_text', '')

    if transcript_id:
        transcript = MeetingTranscript.objects.get(id=transcript_id)
        transcript.title = data.get('title', transcript.title)
        transcript.transcript_text = text if 'transcript_text' in data else transcript.transcript_text
        transcript.char_count = len(transcript.transcript_text)
        transcript.save(update_fields=['title', 'transcript_text', 'char_count', 'updated_at'])
        return transcript

    return MeetingTranscript.objects.create(
        company_id=data['company_id'],
        event_id=data.get('event_id'),
        title=data.get('title', ''),
        transcript_text=text,
        char_count=len(text),
        created_by=requester_employee,
    )


def summarize_transcript(transcript_id, requester_employee):
    transcript = MeetingTranscript.objects.get(id=transcript_id)
    summary = call_llm(
        messages=[{
            "role": "user",
            "content": f"Tóm tắt ngắn gọn, gạch đầu dòng, bằng tiếng Việt:\n\n{transcript.transcript_text}",
        }],
        company_id=transcript.company_id,
        max_tokens=800,
    )
    transcript.summary_text = summary
    transcript.summary_generated_at = timezone.now()
    transcript.save(update_fields=["summary_text", "summary_generated_at"])
    return summary
