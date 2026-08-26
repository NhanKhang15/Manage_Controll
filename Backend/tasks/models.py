import uuid
from django.db import models
from projects.models import Project
from employees.models import Employee
from companies.models import Department


class Task(models.Model):
    STATUS_CHOICES = (
        ('Ý tưởng', 'Ý tưởng'),
        ('Cần làm', 'Cần làm'),
        ('Đang làm', 'Đang làm'),
        ('Hoàn thành', 'Hoàn thành'),
    )
    EFFORT_CHOICES = (
        (1, 'Nhỏ'),
        (3, 'Vừa'),
        (5, 'Lớn'),
        (8, 'Rất lớn'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='tasks',
        db_column='project_id'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        db_column='parent_id'
    )
    name = models.CharField(max_length=500)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Cần làm')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    order_index = models.IntegerField(default=0)
    pic = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pic_tasks',
        db_column='pic_id',
        help_text='Người phụ trách chính (khác task_assignments — có thể nhiều người tham gia)'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        db_column='department_id',
        help_text='Phòng ban phụ trách — gán trực tiếp, không còn suy ra qua người được gán việc'
    )
    is_milestone = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)
    is_problem = models.BooleanField(default=False)
    can_automate = models.BooleanField(default=False)
    effort_points = models.IntegerField(null=True, blank=True, choices=EFFORT_CHOICES)
    notes = models.TextField(blank=True, default='')
    drive_file_id = models.CharField(max_length=255, null=True, blank=True)
    drive_file_url = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.name


class TaskChecklistItem(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='checklist_items',
        db_column='task_id'
    )
    text = models.CharField(max_length=500)
    is_checked = models.BooleanField(default=False)
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_checklist_items'
        ordering = ['order_index', 'created_at']

    def __str__(self):
        return f"[{'x' if self.is_checked else ' '}] {self.text}"


class TaskAssignment(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='assignments',
        db_column='task_id'
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='task_assignments',
        db_column='employee_id'
    )
    role = models.CharField(max_length=50, default='assignee')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_assignments',
        db_column='assigned_by'
    )

    class Meta:
        db_table = 'task_assignments'
        unique_together = ('task', 'employee', 'role')

    def __str__(self):
        return f"{self.task.name} -> {self.employee.full_name} ({self.role})"
