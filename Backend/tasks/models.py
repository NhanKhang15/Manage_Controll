import uuid
from django.db import models
from projects.models import Project
from employees.models import Employee


class Task(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        db_column='project_id'
    )
    name = models.CharField(max_length=500)
    status = models.CharField(max_length=50, default='Cần làm')
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.name


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
