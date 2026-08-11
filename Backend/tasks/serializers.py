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


def serialize_pic(task):
    if not task.pic_id:
        return None
    return {'id': task.pic_id, 'full_name': task.pic.full_name, 'avatar_url': task.pic.avatar_url}


def task_department_name(task):
    """Bộ phận của công việc = phòng ban (ưu tiên phòng chính) của người phụ trách đầu tiên."""
    assignment = task.assignments.select_related('employee').first()
    if not assignment:
        return None
    dept_link = assignment.employee.employee_departments.filter(is_primary=True).select_related('department').first()
    if not dept_link:
        dept_link = assignment.employee.employee_departments.select_related('department').first()
    return dept_link.department.name if dept_link else None


def leaf_progress(task):
    """(số leaf đã xong, tổng số leaf) — đệ quy tới task không còn con. 1 task
    không có con tự nó là 1 leaf, tính Hoàn thành theo is_completed."""
    children = list(task.children.all())
    if not children:
        return (1, 1) if task.is_completed else (0, 1)
    done = total = 0
    for child in children:
        d, t = leaf_progress(child)
        done += d
        total += t
    return done, total


def progress_percent_of(task):
    done, total = leaf_progress(task)
    return round(done / total * 100) if total else 0


def progress_percent_of_tasks(tasks):
    """Tổng hợp % từ danh sách task gốc (dùng ở cấp Project) — vẫn theo leaf."""
    done = total = 0
    for t in tasks:
        d, tt = leaf_progress(t)
        done += d
        total += tt
    return round(done / total * 100) if total else 0


class TaskTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='task', read_only=True)
    completed = serializers.BooleanField(source='is_completed')
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    pic = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    childCount = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'type', 'name', 'status', 'completed', 'completed_at', 'due_date',
            'order_index', 'assignees', 'department', 'pic', 'is_milestone',
            'effort_points', 'notes', 'parent', 'children', 'childCount', 'progress_percent',
            'created_at',
        ]

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_department(self, obj):
        return task_department_name(obj)

    def get_pic(self, obj):
        return serialize_pic(obj)

    def get_children(self, obj):
        children = obj.children.all().order_by('order_index')
        return TaskTreeSerializer(children, many=True).data

    def get_childCount(self, obj):
        n = obj.children.count()
        return f"{n} việc con" if n > 0 else None

    def get_progress_percent(self, obj):
        return progress_percent_of(obj)


class TaskFlatSerializer(serializers.ModelSerializer):
    """Danh sách task phẳng kèm dự án cha — dùng cho /api/tasks/mine/ và /api/tasks/department/
    (khác TaskTreeSerializer vốn được lồng bên trong cây company → project)."""
    completed = serializers.BooleanField(source='is_completed')
    project = serializers.SerializerMethodField()
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    pic = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'name', 'status', 'completed', 'completed_at', 'due_date', 'project',
            'assignees', 'department', 'pic', 'is_milestone', 'effort_points', 'notes', 'parent',
        ]

    def get_project(self, obj):
        return {'id': obj.project_id, 'name': obj.project.name}

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_department(self, obj):
        return task_department_name(obj)

    def get_pic(self, obj):
        return serialize_pic(obj)


class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = ['id', 'task', 'employee', 'role', 'assigned_at', 'assigned_by']
