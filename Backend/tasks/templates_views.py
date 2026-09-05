from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Task, TaskTemplate, RecurringTaskRule, TaskDependency
from employees.services import get_employee_from_request


def _task_relation_company_q(company_id, prefix):
    """Như _company_q nhưng đi qua quan hệ `prefix__` tới Task (dùng cho
    RecurringTaskRule/TaskDependency vốn không có project/department trực tiếp)."""
    return Q(**{f'{prefix}__project__company_id': company_id}) | Q(**{f'{prefix}__department__company_id': company_id})


# --- Mẫu công việc (Panel 1) ---

def _serialize_template(t):
    return {
        'id': t.id, 'name': t.name, 'title': t.title, 'description': t.description,
        'priority': t.priority, 'est_hours': t.est_hours, 'subtasks': t.subtasks,
    }


@api_view(['GET', 'POST'])
def task_templates_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        name = (data.get('name') or '').strip()
        if not name:
            return Response({'detail': 'Tên mẫu không được để trống'}, status=status.HTTP_400_BAD_REQUEST)
        subtasks = data.get('subtasks') or []
        if not isinstance(subtasks, list):
            subtasks = [s.strip() for s in str(subtasks).split('\n') if s.strip()]
        tpl = TaskTemplate.objects.create(
            company_id=company_id,
            name=name,
            title=(data.get('title') or '').strip(),
            description=(data.get('description') or '').strip(),
            priority=data.get('priority') or 'med',
            est_hours=data.get('est_hours') or 0,
            subtasks=subtasks,
            created_by=get_employee_from_request(request),
        )
        return Response(_serialize_template(tpl), status=status.HTTP_201_CREATED)

    templates = TaskTemplate.objects.filter(company_id=company_id)
    return Response([_serialize_template(t) for t in templates])


@api_view(['DELETE'])
def task_template_detail_view(request, pk):
    try:
        tpl = TaskTemplate.objects.get(id=pk)
    except TaskTemplate.DoesNotExist:
        return Response({'detail': 'Không tìm thấy mẫu'}, status=status.HTTP_404_NOT_FOUND)
    tpl.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Việc lặp định kỳ (Panel 2) ---

def _serialize_recurring(r):
    return {
        'id': r.id, 'task_id': r.task_id, 'task_title': r.task.name,
        'recurrence': r.recurrence, 'recur_until': r.recur_until,
    }


@api_view(['GET', 'POST'])
def recurring_tasks_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        task_id = data.get('task_id')
        recurrence = data.get('recurrence')
        if recurrence not in dict(RecurringTaskRule.RECURRENCE_CHOICES):
            return Response({'detail': 'Chu kỳ không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({'detail': 'Không tìm thấy việc'}, status=status.HTTP_404_NOT_FOUND)
        if hasattr(task, 'recurring_rule'):
            return Response({'detail': 'Việc này đã được đặt lặp định kỳ'}, status=status.HTTP_400_BAD_REQUEST)
        rule = RecurringTaskRule.objects.create(
            task=task, recurrence=recurrence, recur_until=data.get('recur_until') or None,
        )
        return Response(_serialize_recurring(rule), status=status.HTTP_201_CREATED)

    rules = RecurringTaskRule.objects.filter(_task_relation_company_q(company_id, 'task')).select_related('task')
    return Response([_serialize_recurring(r) for r in rules])


@api_view(['DELETE'])
def recurring_task_detail_view(request, pk):
    try:
        rule = RecurringTaskRule.objects.get(id=pk)
    except RecurringTaskRule.DoesNotExist:
        return Response({'detail': 'Không tìm thấy'}, status=status.HTTP_404_NOT_FOUND)
    rule.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Phụ thuộc giữa các việc (Panel 3) ---

def _serialize_dependency(d):
    return {
        'id': d.id, 'task_id': d.task_id, 'task_title': d.task.name,
        'depends_on_id': d.depends_on_id, 'depends_on_title': d.depends_on.name,
    }


@api_view(['GET', 'POST'])
def task_dependencies_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        task_id = data.get('task_id')
        depends_on_id = data.get('depends_on_id')
        if not task_id or not depends_on_id:
            return Response({'detail': 'Cần chọn đủ 2 việc'}, status=status.HTTP_400_BAD_REQUEST)
        if task_id == depends_on_id:
            return Response({'detail': 'Một việc không thể tự phụ thuộc vào chính nó'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = Task.objects.get(id=task_id)
            depends_on = Task.objects.get(id=depends_on_id)
        except Task.DoesNotExist:
            return Response({'detail': 'Không tìm thấy việc'}, status=status.HTTP_404_NOT_FOUND)
        dep, created = TaskDependency.objects.get_or_create(task=task, depends_on=depends_on)
        return Response(_serialize_dependency(dep), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    deps = TaskDependency.objects.filter(_task_relation_company_q(company_id, 'task')).select_related('task', 'depends_on')
    return Response([_serialize_dependency(d) for d in deps])


@api_view(['DELETE'])
def task_dependency_detail_view(request, pk):
    try:
        dep = TaskDependency.objects.get(id=pk)
    except TaskDependency.DoesNotExist:
        return Response({'detail': 'Không tìm thấy'}, status=status.HTTP_404_NOT_FOUND)
    dep.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
