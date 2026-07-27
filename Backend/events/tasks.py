from datetime import datetime, timedelta
from django.utils import timezone
from celery import shared_task
from events.models import Event, Notification
from tasks.models import Task, TaskAssignment


@shared_task
def generate_time_based_notifications():
    now = timezone.now()
    today = now.date()

    # 1. Upcoming meetings in 1-2 hours
    window_start = (now + timedelta(hours=1)).time()
    window_end = (now + timedelta(hours=2)).time()

    upcoming_events = Event.objects.filter(
        event_date=today,
        type='meeting',
        start_time__gte=window_start,
        start_time__lte=window_end
    )

    for event in upcoming_events:
        # Check if already generated
        already_exists = Notification.objects.filter(
            type='upcoming_meeting',
            related_table='events',
            related_id=str(event.id)
        ).exists()

        if not already_exists:
            # Resolve recipients
            recipients = set()
            if event.invite_all_company:
                recipients.update(event.company.company_employees.values_list('employee_id', flat=True))
            else:
                dept_ids = event.department_invites.values_list('department_id', flat=True)
                if dept_ids:
                    from employees.models import EmployeeDepartment
                    recipients.update(
                        EmployeeDepartment.objects.filter(department_id__in=dept_ids).values_list('employee_id', flat=True)
                    )
                recipients.update(event.employee_invites.values_list('employee_id', flat=True))

            notifs = [
                Notification(
                    company_id=event.company_id,
                    recipient_id=emp_id,
                    type='upcoming_meeting',
                    icon_key='clock_red',
                    title=f"Sắp diễn ra cuộc họp: {event.title}",
                    body=f"Cuộc họp sẽ bắt đầu lúc {event.start_time.strftime('%H:%M')}",
                    link_url=f"/calendar?event_id={event.id}",
                    related_table='events',
                    related_id=str(event.id),
                    triggered_by=event.created_by
                )
                for emp_id in recipients
            ]
            if notifs:
                Notification.objects.bulk_create(notifs)

    # 2. Overdue tasks
    overdue_tasks = Task.objects.filter(
        due_date__lt=today,
        is_completed=False
    )

    for task in overdue_tasks:
        already_exists = Notification.objects.filter(
            type='overdue_task',
            related_table='tasks',
            related_id=str(task.id)
        ).exists()

        if not already_exists:
            assignee_ids = TaskAssignment.objects.filter(task=task).values_list('employee_id', flat=True)
            company_id = task.project.company_id

            notifs = [
                Notification(
                    company_id=company_id,
                    recipient_id=emp_id,
                    type='overdue_task',
                    icon_key='clock_red',
                    title=f"Công việc quá hạn: {task.name}",
                    body=f"Hạn hoàn thành: {task.due_date}",
                    link_url=f"/tasks?task_id={task.id}",
                    related_table='tasks',
                    related_id=str(task.id)
                )
                for emp_id in assignee_ids
            ]
            if notifs:
                Notification.objects.bulk_create(notifs)
