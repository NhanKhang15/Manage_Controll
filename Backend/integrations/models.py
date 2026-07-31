import uuid
from django.db import models
from companies.models import Company
from employees.models import Employee


class CompanyAISetting(models.Model):
    """Cấu hình AI theo từng công ty — nguồn duy nhất để integrations.ai_client
    lấy API key. Mọi tính năng AI (tóm tắt cuộc họp, sau này là Trợ lý) đều
    đọc qua bảng này, không lưu key ở nơi khác.
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='ai_setting',
        db_column='company_id',
    )
    api_key_encrypted = models.TextField(null=True, blank=True)
    is_ai_enabled = models.BooleanField(default=False)
    updated_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
        db_column='updated_by',
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'company_ai_settings'

    def __str__(self):
        return f"AI settings - {self.company.name}"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    table_name = models.CharField(max_length=100)
    record_id = models.CharField(max_length=36)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    changed_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        db_column='changed_by'
    )
    changes = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action.upper()} on {self.table_name}:{self.record_id}"
