from django.contrib import admin
from .models import Task, TaskAssignment, TaskTemplate, RecurringTaskRule, TaskDependency


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


@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'priority', 'est_hours', 'created_at')
    list_filter = ('company', 'priority')
    search_fields = ('name', 'title')


@admin.register(RecurringTaskRule)
class RecurringTaskRuleAdmin(admin.ModelAdmin):
    list_display = ('task', 'recurrence', 'recur_until')
    list_filter = ('recurrence',)
    search_fields = ('task__name',)


@admin.register(TaskDependency)
class TaskDependencyAdmin(admin.ModelAdmin):
    list_display = ('task', 'depends_on')
    search_fields = ('task__name', 'depends_on__name')
