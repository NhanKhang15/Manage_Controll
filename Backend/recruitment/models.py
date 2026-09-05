import uuid
from django.db import models
from companies.models import Company, Department
from employees.models import Employee


def _short_token():
    return uuid.uuid4().hex[:8]


class JobPosting(models.Model):
    """1 tin tuyển dụng — public_token dùng cho link ứng tuyển công khai
    (trang /apply/<token>, không cần đăng nhập, xem recruitment.views)."""
    STATUS_CHOICES = (('open', 'Đang tuyển'), ('closed', 'Đã đóng'))

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_postings')
    level = models.CharField(max_length=100, blank=True, default='')
    requirements_note = models.TextField(blank=True, default='')
    jd = models.TextField(blank=True, default='')
    channels = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    public_token = models.CharField(max_length=16, unique=True, default=_short_token, editable=False)
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_postings'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Candidate(models.Model):
    """1 ứng viên nộp CV cho 1 tin tuyển dụng — tạo qua recruitment.views.public_apply_view
    (không đăng nhập) hoặc thêm tay bởi HR."""
    STAGE_CHOICES = (
        ('applied', 'Mới nộp'),
        ('screening', 'Sàng lọc'),
        ('interview', 'Phỏng vấn'),
        ('offer', 'Đề nghị'),
        ('hired', 'Đã tuyển'),
        ('rejected', 'Từ chối'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidates')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True, default='')
    cv_file_url = models.CharField(max_length=500, null=True, blank=True)
    cv_file_name = models.CharField(max_length=255, null=True, blank=True)
    cover_letter = models.TextField(blank=True, default='')
    source = models.CharField(max_length=100, default='Link công khai')
    stage = models.CharField(max_length=10, choices=STAGE_CHOICES, default='applied')
    interview_at = models.DateTimeField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'candidates'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} → {self.job_posting.title}"
