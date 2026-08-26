from django.db import transaction
from employees.models import EmployeeCompany, EmployeeDepartment
from events.models import Event, Driver, EventDepartmentInvite, EventEmployeeInvite, EventAttachment, Notification


def create_event(data, creator, invited_department_ids=None, invited_employee_ids=None, attachment_urls=None):
    if invited_department_ids is None:
        invited_department_ids = []
    if invited_employee_ids is None:
        invited_employee_ids = []
    if attachment_urls is None:
        attachment_urls = []

    event_type = data.get('type', 'meeting')
    need_pickup_car = data.get('need_pickup_car', False)
    has_gift = data.get('has_gift', False)
    invite_all_company = data.get('invite_all_company', False)
    driver_id = data.get('driver_id')

    if event_type == 'personal':
        need_pickup_car = False
        has_gift = False
        invite_all_company = False
        driver_id = None
        invited_department_ids = []
        invited_employee_ids = []

    if event_type == 'meeting' and need_pickup_car:
        if not driver_id:
            raise ValueError("Cuộc họp cần xe đưa đón bắt buộc phải chọn tài xế")
        try:
            driver = Driver.objects.get(id=driver_id, is_active=True)
        except Driver.DoesNotExist:
            raise ValueError("Tài xế được chọn không tồn tại hoặc đã ngưng hoạt động")
    else:
        driver = None

    with transaction.atomic():
        event = Event.objects.create(
            company_id=data['company_id'],
            type=event_type,
            title=data['title'],
            content=data.get('content', ''),
            event_date=data['event_date'],
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            location=data.get('location'),
            online_meeting_link=data.get('online_meeting_link'),
            created_by=creator,
            need_pickup_car=need_pickup_car,
            driver=driver,
            has_gift=has_gift,
            gift_note=data.get('gift_note') if has_gift else None,
            invite_all_company=invite_all_company,
        )

        if event_type == 'meeting':
            for dept_id in invited_department_ids:
                EventDepartmentInvite.objects.create(event=event, department_id=dept_id)

            for emp_id in invited_employee_ids:
                EventEmployeeInvite.objects.create(event=event, employee_id=emp_id)

        for att in attachment_urls:
            url = att if isinstance(att, str) else att.get('url')
            name = att.get('name', url.split('/')[-1]) if isinstance(att, dict) else url.split('/')[-1]
            EventAttachment.objects.create(event=event, file_url=url, file_name=name)

        create_notifications_for_event(event)

        return event


def update_event(event, data):
    event_type = data.get('type', event.type)
    need_pickup_car = data.get('need_pickup_car', event.need_pickup_car)
    has_gift = data.get('has_gift', event.has_gift)
    driver_id = data.get('driver_id', event.driver_id)
    invite_all_company = data.get('invite_all_company', event.invite_all_company)

    if event_type == 'personal':
        need_pickup_car = False
        has_gift = False
        driver_id = None
        invite_all_company = False

    if event_type == 'meeting' and need_pickup_car:
        if not driver_id:
            raise ValueError("Cuộc họp cần xe đưa đón bắt buộc phải chọn tài xế")
        try:
            driver = Driver.objects.get(id=driver_id, is_active=True)
        except Driver.DoesNotExist:
            raise ValueError("Tài xế được chọn không tồn tại hoặc đã ngưng hoạt động")
    else:
        driver = None

    with transaction.atomic():
        event.type = event_type
        event.title = data.get('title', event.title)
        event.content = data.get('content', event.content)
        event.event_date = data.get('event_date', event.event_date)
        event.start_time = data.get('start_time', event.start_time)
        event.end_time = data.get('end_time', event.end_time)
        event.location = data.get('location', event.location)
        event.online_meeting_link = data.get('online_meeting_link', event.online_meeting_link)
        event.need_pickup_car = need_pickup_car
        event.driver = driver
        event.has_gift = has_gift
        event.gift_note = data.get('gift_note') if has_gift else None
        event.invite_all_company = invite_all_company
        event.save()

        if event_type == 'personal':
            EventDepartmentInvite.objects.filter(event=event).delete()
            EventEmployeeInvite.objects.filter(event=event).delete()
        else:
            if 'invited_department_ids' in data or 'invited_employee_ids' in data or 'invite_all_company' in data:
                EventDepartmentInvite.objects.filter(event=event).delete()
                EventEmployeeInvite.objects.filter(event=event).delete()

                if not invite_all_company:
                    invited_dept_ids = data.get('invited_department_ids', [])
                    for dept_id in invited_dept_ids:
                        EventDepartmentInvite.objects.create(event=event, department_id=dept_id)

                    invited_emp_ids = data.get('invited_employee_ids', [])
                    for emp_id in invited_emp_ids:
                        EventEmployeeInvite.objects.create(event=event, employee_id=emp_id)

        if 'attachment_urls' in data:
            EventAttachment.objects.filter(event=event).delete()
            for att in data['attachment_urls']:
                url = att if isinstance(att, str) else att.get('url')
                name = att.get('name', url.split('/')[-1]) if isinstance(att, dict) else url.split('/')[-1]
                EventAttachment.objects.create(event=event, file_url=url, file_name=name)

    return event


def create_notifications_for_event(event):
    if event.type != 'meeting':
        return

    recipient_ids = set()

    if event.invite_all_company:
        company_emp_ids = EmployeeCompany.objects.filter(
            company_id=event.company_id
        ).values_list('employee_id', flat=True)
        recipient_ids.update(company_emp_ids)
    else:
        dept_ids = EventDepartmentInvite.objects.filter(event=event).values_list('department_id', flat=True)
        if dept_ids:
            dept_emp_ids = EmployeeDepartment.objects.filter(
                department_id__in=dept_ids
            ).values_list('employee_id', flat=True)
            recipient_ids.update(dept_emp_ids)

        direct_emp_ids = EventEmployeeInvite.objects.filter(event=event).values_list('employee_id', flat=True)
        recipient_ids.update(direct_emp_ids)

    notifications = []
    for emp_id in recipient_ids:
        notifications.append(
            Notification(
                company_id=event.company_id,
                recipient_id=emp_id,
                type='meeting_invite',
                icon_key='calendar',
                title=f"Mời họp: {event.title}",
                body=f"Thời gian: {event.event_date} {event.start_time or ''}. Địa điểm: {event.location or 'Trực tuyến'}",
                link_url=f"/calendar?event_id={event.id}",
                related_table='events',
                related_id=str(event.id),
                triggered_by=event.created_by,
            )
        )

    if notifications:
        Notification.objects.bulk_create(notifications)
