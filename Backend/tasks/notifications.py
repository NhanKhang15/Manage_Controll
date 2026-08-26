from events.models import Notification


def _task_company_id(task):
    if task.project_id:
        return task.project.company_id
    if task.department_id:
        return task.department.company_id
    return None


def _task_recipients(task, exclude_employee_id=None):
    """PIC + tất cả người phối hợp (assignments) — trừ người vừa thao tác, để
    không tự thông báo cho chính mình."""
    ids = set()
    if task.pic_id:
        ids.add(task.pic_id)
    ids.update(task.assignments.values_list('employee_id', flat=True))
    ids.discard(exclude_employee_id)
    return ids


def notify_task_event(task, actor, notif_type, title, body='', recipient_ids=None, company_id=None):
    """Tạo thông báo (chuông góc trên) cho những người liên quan tới 1 công việc
    (PIC + người phối hợp). Không có ai liên quan hoặc không xác định được công
    ty thì bỏ qua — không tạo thông báo rác."""
    company_id = company_id or _task_company_id(task)
    if not company_id:
        return

    if recipient_ids is None:
        recipient_ids = _task_recipients(task, exclude_employee_id=actor.id if actor else None)
    if not recipient_ids:
        return

    Notification.objects.bulk_create([
        Notification(
            company_id=company_id,
            recipient_id=rid,
            type=notif_type,
            icon_key='task',
            title=title,
            body=body,
            link_url=f"/tasks?task_id={task.id}",
            related_table='tasks',
            related_id=str(task.id),
            triggered_by=actor,
        )
        for rid in recipient_ids
    ])
