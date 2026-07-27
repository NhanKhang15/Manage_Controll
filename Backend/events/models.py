import uuid
from django.db import models
from companies.models import Company, Department
from employees.models import Employee
from integrations.models import AuditLog


class Driver(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='drivers', db_column='company_id')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'drivers'

    def __str__(self):
        return f"{self.full_name} ({self.company.name})"


class Event(models.Model):
    TYPE_CHOICES = (
        ('meeting', 'Cuộc họp'),
        ('personal', 'Lịch cá nhân'),
        ('reminder', 'Nhắc nhở'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='events', db_column='company_id')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='meeting')
    title = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True)
    event_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    online_meeting_link = models.CharField(max_length=500, null=True, blank=True)
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_events', db_column='created_by')

    need_pickup_car = models.BooleanField(default=False)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='events', db_column='driver_id')

    has_gift = models.BooleanField(default=False)
    gift_note = models.TextField(null=True, blank=True)

    invite_all_company = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'

    def __str__(self):
        return f"[{self.type}] {self.title} ({self.event_date})"


class EventDepartmentInvite(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='department_invites', db_column='event_id')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='event_invites', db_column='department_id')

    class Meta:
        db_table = 'event_department_invites'
        unique_together = ('event', 'department')


class EventEmployeeInvite(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='employee_invites', db_column='event_id')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='event_invites', db_column='employee_id')

    class Meta:
        db_table = 'event_employee_invites'
        unique_together = ('event', 'employee')


class EventAttachment(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attachments', db_column='event_id')
    file_url = models.CharField(max_length=500)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_attachments'


class Notification(models.Model):
    TYPE_CHOICES = (
        ('meeting_invite', 'Mời họp'),
        ('upcoming_meeting', 'Sắp diễn ra cuộc họp'),
        ('task_completed', 'Hoàn thành công việc'),
        ('work_report', 'Báo cáo công việc'),
        ('promotion', 'Thăng chức'),
        ('approval_pending', 'Chờ duyệt'),
        ('overdue_task', 'Công việc quá hạn'),
        ('general', 'Thông báo chung'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='notifications', db_column='company_id')
    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications', db_column='recipient_id')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    icon_key = models.CharField(max_length=50, null=True, blank=True)
    title = models.CharField(max_length=255)
    body = models.TextField(null=True, blank=True)
    link_url = models.CharField(max_length=500, null=True, blank=True)
    related_table = models.CharField(max_length=100, null=True, blank=True)
    related_id = models.CharField(max_length=36, null=True, blank=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    source_audit_log = models.ForeignKey(AuditLog, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications', db_column='source_audit_log_id')
    triggered_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='triggered_notifications', db_column='triggered_by')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.full_name}: {self.title}"
