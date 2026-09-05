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


class GoogleDriveConfig(models.Model):
    """Kết nối Google Drive theo TỪNG công ty gốc (pháp nhân đầu nhóm) — mỗi
    công ty đăng nhập 1 tài khoản Gmail cá nhân riêng qua OAuth (không phải
    Service Account nữa), đổi độc lập với công ty khác. Công ty con dùng chung
    kết nối của công ty gốc — xem Company.drive_account_company_id.
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='drive_config',
        db_column='company_id',
    )
    connected_email = models.CharField(max_length=255, null=True, blank=True)
    access_token_encrypted = models.TextField(null=True, blank=True)
    refresh_token_encrypted = models.TextField(null=True, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    root_folder_id = models.CharField(max_length=255, null=True, blank=True)
    root_folder_url = models.CharField(max_length=500, null=True, blank=True)
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
        db_table = 'google_drive_config'

    def __str__(self):
        return f"Drive config - {self.company.name} ({self.connected_email or 'chưa kết nối'})"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_logs',
        db_column='company_id',
    )
    table_name = models.CharField(max_length=100)
    record_id = models.CharField(max_length=36)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    description = models.CharField(
        max_length=255, null=True, blank=True,
        help_text='Câu mô tả tiếng Việt sẵn để hiển thị (vd "tạo việc: Giao cho @lan"), tạo sẵn lúc ghi log để khỏi phải tra lại record gốc (có thể đã bị xoá).',
    )
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
