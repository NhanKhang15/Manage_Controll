from django.contrib import admin
from .models import Task, TaskAssignment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'status', 'is_completed', 'due_date', 'order_index')
    list_filter = ('status', 'is_completed', 'project')
    search_fields = ('name', 'project__name')


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ('task', 'employee', 'role', 'assigned_by', 'assigned_at')
    list_filter = ('role',)
    search_fields = ('task__name', 'employee__full_name')
