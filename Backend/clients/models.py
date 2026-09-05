import uuid
from django.db import models
from companies.models import Company
from employees.models import Employee
from projects.models import Project


class Client(models.Model):
    """1 khách hàng/lead trong CRM (trang Khách hàng)."""
    STATUS_CHOICES = (
        ('lead', 'Tiềm năng'),
        ('active', 'Đang làm việc'),
        ('closed', 'Đã chốt'),
        ('lost', 'Ngừng'),
    )
    STAGE_CHOICES = (
        ('pending', 'Chưa'),
        ('doing', 'Đang làm'),
        ('done', 'Đã chốt'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255, blank=True, default='')
    contact_role = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='lead')
    owner = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='followed_clients',
        help_text='Người follow khách hàng này'
    )
    contract_info = models.CharField(max_length=255, blank=True, default='')
    source = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    linked_project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_clients'
    )
    # Quy trình triển khai 4 bước cố định (R&D → Define → Suggest & Select → Solution) —
    # xem trang mẫu ClientDetail — không cần bảng riêng vì số bước cố định, không cấu hình được.
    stage_rnd = models.CharField(max_length=10, choices=STAGE_CHOICES, default='pending')
    stage_define = models.CharField(max_length=10, choices=STAGE_CHOICES, default='pending')
    stage_suggest = models.CharField(max_length=10, choices=STAGE_CHOICES, default='pending')
    stage_solution = models.CharField(max_length=10, choices=STAGE_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ClientComment(models.Model):
    """Trao đổi trên hồ sơ khách hàng — is_internal=True: chỉ nhân viên thấy;
    is_internal=False: dành cho cổng khách hàng (chưa xây — xem //TODO trang Khách hàng)."""
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    content = models.TextField()
    is_internal = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'client_comments'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.client.name}: {self.content[:40]}"
