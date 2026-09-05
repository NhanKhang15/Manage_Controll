"""Tạo bản sao kế tiếp cho việc lặp định kỳ khi bản hiện tại được đánh dấu hoàn
thành (trang Mẫu việc, Panel 2) — xem tasks.views.task_detail."""
from datetime import timedelta

from dateutil.relativedelta import relativedelta

from .models import RecurringTaskRule


def _next_due_date(due_date, recurrence):
    if due_date is None:
        return None
    if recurrence == RecurringTaskRule.DAILY:
        return due_date + timedelta(days=1)
    if recurrence == RecurringTaskRule.WEEKLY:
        return due_date + timedelta(weeks=1)
    return due_date + relativedelta(months=1)


def spawn_next_occurrence(completed_task):
    """completed_task vừa được đánh dấu Hoàn thành. Nếu có recurring_rule và còn
    trong hạn lặp (recur_until), tạo Task kế tiếp + rule mới cho nó. Trả về Task
    mới hoặc None."""
    rule = getattr(completed_task, 'recurring_rule', None)
    if rule is None:
        return None

    next_due = _next_due_date(completed_task.due_date, rule.recurrence)
    if rule.recur_until and next_due and next_due > rule.recur_until:
        return None

    next_task = completed_task.__class__.objects.create(
        project=completed_task.project,
        parent=completed_task.parent,
        name=completed_task.name,
        status='Cần làm',
        is_completed=False,
        due_date=next_due,
        pic=completed_task.pic,
        department=completed_task.department,
        is_milestone=completed_task.is_milestone,
        effort_points=completed_task.effort_points,
        notes=completed_task.notes,
    )

    for assignment in completed_task.assignments.all():
        assignment.__class__.objects.get_or_create(
            task=next_task, employee=assignment.employee, role=assignment.role,
            defaults={'assigned_by': assignment.assigned_by},
        )

    RecurringTaskRule.objects.create(task=next_task, recurrence=rule.recurrence, recur_until=rule.recur_until)
    return next_task
