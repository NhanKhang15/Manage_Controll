from rest_framework import serializers
from .models import Task, TaskAssignment, TaskChecklistItem


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


def _checklist_items(task):
    """.all() (không .exists()/.count()) để tái dùng cache của prefetch_related
    thay vì bắn thêm 1 query COUNT/EXISTS riêng cho mỗi task khi duyệt danh sách."""
    return list(task.checklist_items.all())


def _children(task):
    """.all() thuần (không select_related/prefetch_related chain thêm ở đây) để
    tái dùng đúng cache của prefetch_related khai báo tại nơi build queryset
    (_top_tasks/_direct_tasks/_build_paginated_task_response) — chain thêm
    method vào 1 manager đã prefetch sẽ tạo queryset mới và bỏ qua cache đó."""
    return list(task.children.all())


def leaf_progress(task):
    """(số đơn vị đã xong, tổng số đơn vị) — đệ quy tới task không còn con.
    Ưu tiên checklist riêng của task (nếu có) làm đơn vị tính, kể cả khi task
    đó cũng có việc con — vì checklist là tiêu chí hoàn thành cụ thể hơn.
    Không có checklist thì mới xét việc con; không có gì thì task tự là 1 leaf,
    tính Hoàn thành theo is_completed."""
    items = _checklist_items(task)
    if items:
        done = sum(1 for i in items if i.is_checked)
        return done, len(items)
    children = _children(task)
    if not children:
        return (1, 1) if task.is_completed else (0, 1)
    done = total = 0
    for child in children:
        d, t = leaf_progress(child)
        done += d
        total += t
    return done, total


def has_progress_signal(task):
    """Task chỉ có % hiển thị khi có checklist riêng hoặc có việc con — task
    trơn (không checklist, không việc con) thì ẩn % (theo yêu cầu)."""
    return bool(_checklist_items(task)) or bool(_children(task))


def progress_percent_of(task):
    if not has_progress_signal(task):
        return None
    done, total = leaf_progress(task)
    return round(done / total * 100) if total else None


def progress_percent_of_tasks(tasks):
    """Tổng hợp % từ danh sách task gốc (dùng ở cấp Project) — vẫn theo leaf."""
    done = total = 0
    for t in tasks:
        d, tt = leaf_progress(t)
        done += d
        total += tt
    return round(done / total * 100) if total else 0


class TaskChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskChecklistItem
        fields = ['id', 'task', 'text', 'is_checked', 'order_index', 'created_at']
        read_only_fields = ['id', 'task', 'created_at']


class TaskTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='task', read_only=True)
    completed = serializers.BooleanField(source='is_completed')
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    pic = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    childCount = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    checklist = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'type', 'name', 'status', 'completed', 'completed_at', 'due_date',
            'order_index', 'assignees', 'department', 'department_id', 'pic', 'is_milestone',
            'is_flagged', 'is_problem', 'can_automate',
            'effort_points', 'notes', 'parent', 'children', 'childCount', 'progress_percent',
            'checklist', 'drive_file_id', 'drive_file_url', 'created_at',
        ]

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_department(self, obj):
        return obj.department.name if obj.department_id else None

    def get_department_id(self, obj):
        return obj.department_id

    def get_pic(self, obj):
        return serialize_pic(obj)

    def get_children(self, obj):
        children = sorted(_children(obj), key=lambda t: t.order_index)
        return TaskTreeSerializer(children, many=True).data

    def get_childCount(self, obj):
        n = len(_children(obj))
        return f"{n} việc con" if n > 0 else None

    def get_progress_percent(self, obj):
        return progress_percent_of(obj)

    def get_checklist(self, obj):
        items = sorted(_checklist_items(obj), key=lambda i: (i.order_index, i.created_at))
        return TaskChecklistItemSerializer(items, many=True).data


class TaskFlatSerializer(serializers.ModelSerializer):
    """Danh sách task phẳng kèm dự án cha — dùng cho /api/tasks/mine/ và /api/tasks/department/
    (khác TaskTreeSerializer vốn được lồng bên trong cây company → project)."""
    completed = serializers.BooleanField(source='is_completed')
    project = serializers.SerializerMethodField()
    assignees = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    pic = serializers.SerializerMethodField()
    checklist_percent = serializers.SerializerMethodField()
    checklist_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'name', 'status', 'completed', 'completed_at', 'due_date', 'project',
            'assignees', 'department', 'department_id', 'pic', 'is_milestone',
            'is_flagged', 'is_problem', 'can_automate',
            'effort_points', 'notes', 'parent', 'checklist_percent', 'checklist_count',
            'drive_file_id', 'drive_file_url',
        ]

    def get_project(self, obj):
        if not obj.project_id:
            return None
        return {'id': obj.project_id, 'name': obj.project.name}

    def get_assignees(self, obj):
        return serialize_assignees(obj)

    def get_checklist_percent(self, obj):
        return progress_percent_of(obj)

    def get_checklist_count(self, obj):
        return len(_checklist_items(obj))

    def get_department(self, obj):
        return obj.department.name if obj.department_id else None

    def get_department_id(self, obj):
        return obj.department_id

    def get_pic(self, obj):
        return serialize_pic(obj)


class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = ['id', 'task', 'employee', 'role', 'assigned_at', 'assigned_by']
