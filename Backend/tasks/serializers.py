from rest_framework import serializers
from .models import Task, TaskAssignment


def serialize_assignees(task):
    return [
        {
            'id': a.employee_id,
            'full_name': a.employee.full_name,
            'avatar_url': a.employee.avatar_url,
            'role': a.role,
        }
        for a in task.assignments.select_related('employee').all()
    ]


def task_department_name(task):
    """Bộ phận của công việc = phòng ban (ưu tiên phòng chính) của người phụ trách đầu tiên."""
    assignment = task.assignments.select_related('employee').first()
    if not assignment:
        return None
    dept_link = assignment.employee.employee_departments.filter(is_primary=True).select_related('department').first()
    if not dept_link:
        dept_link = assignment.employee.employee_departments.select_related('department').first()
    return dept_link.department.name if dept_link else None


class TaskTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='task', read_only=True)
    completed = serializers.BooleanField(source='is_completed')
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'type', 'name', 'status', 'completed', 'due_date', 'order_index', 'assignees', 'department']

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_department(self, obj):
        return task_department_name(obj)


class TaskFlatSerializer(serializers.ModelSerializer):
    """Danh sách task phẳng kèm dự án cha — dùng cho /api/tasks/mine/ và /api/tasks/department/
    (khác TaskTreeSerializer vốn được lồng bên trong cây company → project)."""
    completed = serializers.BooleanField(source='is_completed')
    project = serializers.SerializerMethodField()
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'name', 'status', 'completed', 'due_date', 'project', 'assignees', 'department']

    def get_project(self, obj):
        return {'id': obj.project_id, 'name': obj.project.name}

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_department(self, obj):
        return task_department_name(obj)


class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = ['id', 'task', 'employee', 'role', 'assigned_at', 'assigned_by']
