import uuid
from django.db import models
from companies.models import Company
from employees.models import Employee


class Proposal(models.Model):
    """Đề xuất chi phí/mua sắm cần quản lý duyệt (tạm ứng hợp đồng, mua gói phần
    mềm, ngân sách...). Hiện chưa phân quyền ai được duyệt — bất kỳ nhân viên
    nào đăng nhập vào công ty cũng bấm Duyệt/Từ chối được (xem proposals/views.py)."""

    STATUS_CHOICES = (
        ('pending', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Từ chối'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='proposals', db_column='company_id')
    title = models.CharField(max_length=255)
    amount = models.BigIntegerField(null=True, blank=True, help_text='Số tiền đề xuất (VNĐ)')
    note = models.TextField(blank=True, default='')
    requester = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='proposals', db_column='requester_id'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    decided_by = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='decided_proposals', db_column='decided_by',
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'proposals'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
