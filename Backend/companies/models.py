import uuid
from django.db import models


class Company(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        db_column='parent_id'
    )
    name = models.CharField(max_length=255)
    drive_folder_id = models.CharField(max_length=255, null=True, blank=True)
    drive_folder_url = models.CharField(max_length=500, null=True, blank=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    due_soon_days = models.IntegerField(
        default=2,
        help_text='Số ngày trước hạn để hiện cảnh báo "Sắp đến hạn" (màu vàng) cho việc chưa xong'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name

    @property
    def drive_account_company_id(self):
        """Công ty con dùng chung tài khoản Google Drive của công ty gốc (root)
        trong nhóm pháp nhân — mỗi tài khoản Drive (Gmail cá nhân) gắn ở cấp
        công ty mẹ cao nhất, không phải từng công ty con riêng lẻ."""
        node = self
        while node.parent_id:
            node = node.parent
        return node.id


class Department(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='departments',
        db_column='company_id'
    )
    name = models.CharField(max_length=255)
    drive_folder_id = models.CharField(max_length=255, null=True, blank=True)
    drive_folder_url = models.CharField(max_length=500, null=True, blank=True)
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departments'
        unique_together = ('company', 'name')

    def __str__(self):
        return f"{self.name} ({self.company.name})"
