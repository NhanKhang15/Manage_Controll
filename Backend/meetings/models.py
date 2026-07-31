import uuid
from django.db import models
from companies.models import Company
from employees.models import Employee
from events.models import Event


class MeetingTranscript(models.Model):
    """Bản ghi + tóm tắt cuộc họp (module 'Ghi âm & Tóm tắt'). Không liên
    quan tới module AI dùng chung ở integrations/ai_client.py — bảng này chỉ
    lưu dữ liệu nghiệp vụ, việc gọi Claude nằm hết trong meetings.services.
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='meeting_transcripts',
        db_column='company_id',
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='meeting_transcripts',
        db_column='event_id',
    )
    title = models.CharField(max_length=255, blank=True, default='')
    transcript_text = models.TextField(blank=True, default='')
    summary_text = models.TextField(null=True, blank=True)
    summary_generated_at = models.DateTimeField(null=True, blank=True)
    char_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='meeting_transcripts',
        db_column='created_by',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meeting_transcripts'
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Transcript {self.id}"
