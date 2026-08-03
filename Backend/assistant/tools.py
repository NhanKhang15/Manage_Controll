"""Định nghĩa function-calling tools cho Trợ lý AI: schema (OpenAI chuẩn) +
hàm thực thi tương ứng. Mỗi hàm nhận (employee, company_id, args) và trả về
dict JSON-serializable — luôn có khoá "ok"; khi ok=False, "error" giải thích
lý do (LLM đọc để hỏi lại người dùng) hoặc "candidates" khi tên bị mơ hồ.
"""
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from employees.models import Employee, EmployeeCompany
from events.models import Event
from events.services import create_event
from projects.models import Project
from tasks.models import Task, TaskAssignment


def _resolve_project(company_id, name_or_id):
    qs = Project.objects.filter(company_id=company_id)
    if not name_or_id:
        return None, []
    exact = qs.filter(id=name_or_id).first()
    if exact:
        return exact, []
    matches = list(qs.filter(name__icontains=name_or_id)[:6])
    if len(matches) == 1:
        return matches[0], []
    return None, matches


def _resolve_employees(company_id, names):
    resolved, unresolved = [], []
    emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
    for name in names or []:
        match = Employee.objects.filter(id__in=emp_ids, full_name__icontains=name).first()
        (resolved if match else unresolved).append(match or name)
    return resolved, unresolved


def tool_search_employees(employee, company_id, args):
    query = (args.get('query') or '').strip()
    if not query:
        return {"ok": False, "error": "Thiếu từ khoá tìm kiếm"}
    emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
    matches = Employee.objects.filter(id__in=emp_ids, full_name__icontains=query)[:10]
    return {"ok": True, "data": [
        {"id": e.id, "full_name": e.full_name, "position_title": e.position_title} for e in matches
    ]}


def tool_list_projects(employee, company_id, args):
    qs = Project.objects.filter(company_id=company_id)
    if args.get('status'):
        qs = qs.filter(status=args['status'])
    data = []
    for p in qs:
        total = p.tasks.count()
        done = p.tasks.filter(is_completed=True).count()
        data.append({
            "id": p.id, "name": p.name, "status": p.status,
            "total_tasks": total, "completed_tasks": done,
            "progress_percent": round(done / total * 100, 1) if total else 0,
        })
    return {"ok": True, "data": data}


def tool_project_summary(employee, company_id, args):
    project, candidates = _resolve_project(company_id, args.get('project'))
    if project is None:
        if candidates:
            return {"ok": False, "error": "Tên dự án không rõ ràng, có nhiều kết quả khớp",
                     "candidates": [c.name for c in candidates]}
        return {"ok": False, "error": "Không tìm thấy dự án phù hợp"}

    tasks = project.tasks.all()
    total = tasks.count()
    done = tasks.filter(is_completed=True).count()
    today = timezone.localdate()
    overdue = tasks.filter(is_completed=False, due_date__lt=today).count()

    # Dự báo đơn giản: ngoại suy tuyến tính theo tốc độ hoàn thành trung bình/ngày
    # kể từ ngày tạo dự án — chỉ mang tính tham khảo, bỏ qua khi chưa đủ dữ liệu.
    forecast = None
    days_elapsed = (today - project.created_at.date()).days
    if 0 < done < total and days_elapsed > 0:
        remaining_days = round((total - done) / (done / days_elapsed))
        forecast = str(today + timedelta(days=remaining_days))

    return {"ok": True, "data": {
        "project": project.name,
        "total_tasks": total,
        "completed_tasks": done,
        "overdue_tasks": overdue,
        "progress_percent": round(done / total * 100, 1) if total else 0,
        "estimated_completion_date": forecast,
    }}


def tool_list_my_tasks(employee, company_id, args):
    qs = Task.objects.filter(project__company_id=company_id, assignments__employee=employee).distinct()
    status_filter = args.get('status', 'all')
    if status_filter == 'pending':
        qs = qs.filter(is_completed=False)
    elif status_filter == 'completed':
        qs = qs.filter(is_completed=True)
    elif status_filter == 'overdue':
        qs = qs.filter(is_completed=False, due_date__lt=timezone.localdate())
    if args.get('project'):
        qs = qs.filter(project__name__icontains=args['project'])

    data = [{
        "id": t.id, "name": t.name, "project": t.project.name,
        "status": t.status, "is_completed": t.is_completed,
        "due_date": str(t.due_date) if t.due_date else None,
    } for t in qs.order_by('due_date')[:30]]
    return {"ok": True, "data": data}


def tool_list_events(employee, company_id, args):
    date_from = args.get('date_from') or str(timezone.localdate())
    date_to = args.get('date_to') or str(timezone.localdate() + timedelta(days=14))
    qs = Event.objects.filter(company_id=company_id, event_date__gte=date_from, event_date__lte=date_to)

    emp_dept_ids = employee.employee_departments.values_list('department_id', flat=True)
    visible = Q(type='meeting') & (
        Q(created_by=employee) |
        Q(invite_all_company=True) |
        Q(employee_invites__employee=employee) |
        Q(department_invites__department_id__in=emp_dept_ids)
    )
    visible |= Q(type__in=['personal', 'reminder'], created_by=employee)
    qs = qs.filter(visible).distinct().order_by('event_date', 'start_time')

    data = [{
        "id": e.id, "title": e.title, "type": e.type, "date": str(e.event_date),
        "start_time": str(e.start_time) if e.start_time else None,
        "end_time": str(e.end_time) if e.end_time else None,
        "location": e.location,
    } for e in qs[:30]]
    return {"ok": True, "data": data}


def tool_create_meeting(employee, company_id, args):
    event_type = args.get('type')
    title = args.get('title')
    event_date = args.get('event_date')
    if event_type not in ('meeting', 'personal'):
        return {"ok": False, "error": "Cần xác định loại lịch: 'meeting' (họp công ty) hay 'personal' (cá nhân)"}
    if not title or not event_date:
        return {"ok": False, "error": "Thiếu tiêu đề hoặc ngày diễn ra"}

    resolved, unresolved = _resolve_employees(company_id, args.get('invited_employee_names'))

    try:
        event = create_event(
            data={
                "company_id": company_id,
                "type": event_type,
                "title": title,
                "content": args.get('content', ''),
                "event_date": event_date,
                "start_time": args.get('start_time'),
                "end_time": args.get('end_time'),
                "location": args.get('location'),
                "online_meeting_link": args.get('online_meeting_link'),
                "invite_all_company": bool(args.get('invite_all_company', False)),
            },
            creator=employee,
            invited_employee_ids=[e.id for e in resolved],
        )
    except ValueError as exc:
        return {"ok": False, "error": str(exc)}

    result = {"ok": True, "data": {"id": event.id, "title": event.title, "type": event.type, "date": str(event.event_date)}}
    if unresolved:
        result["warning"] = f"Không tìm thấy nhân viên: {', '.join(unresolved)}"
    return result


def tool_create_task(employee, company_id, args):
    project, candidates = _resolve_project(company_id, args.get('project'))
    if project is None:
        if candidates:
            return {"ok": False, "error": "Tên dự án không rõ ràng", "candidates": [c.name for c in candidates]}
        return {"ok": False, "error": "Không tìm thấy dự án phù hợp"}

    name = (args.get('name') or '').strip()
    if not name:
        return {"ok": False, "error": "Thiếu tên công việc"}

    task = Task.objects.create(project=project, name=name, due_date=args.get('due_date'))

    resolved, unresolved = _resolve_employees(company_id, args.get('assignee_names'))
    for emp in resolved:
        TaskAssignment.objects.get_or_create(task=task, employee=emp, role='assignee', defaults={'assigned_by': employee})

    result = {"ok": True, "data": {"id": task.id, "name": task.name, "project": project.name}}
    if unresolved:
        result["warning"] = f"Không tìm thấy nhân viên: {', '.join(unresolved)}"
    return result


TOOL_DISPATCH = {
    "search_employees": tool_search_employees,
    "list_projects": tool_list_projects,
    "project_summary": tool_project_summary,
    "list_my_tasks": tool_list_my_tasks,
    "list_events": tool_list_events,
    "create_meeting": tool_create_meeting,
    "create_task": tool_create_task,
}


def dispatch_tool(name, employee, company_id, args):
    fn = TOOL_DISPATCH.get(name)
    if fn is None:
        return {"ok": False, "error": f"Công cụ không tồn tại: {name}"}
    return fn(employee, company_id, args)


TOOL_SCHEMAS = [
    {"type": "function", "function": {
        "name": "search_employees",
        "description": "Tìm nhân viên theo tên trong công ty hiện tại — dùng để xác định đúng người trước khi mời họp/giao việc.",
        "parameters": {"type": "object", "properties": {
            "query": {"type": "string", "description": "Tên hoặc một phần tên nhân viên"},
        }, "required": ["query"]},
    }},
    {"type": "function", "function": {
        "name": "list_projects",
        "description": "Liệt kê các dự án của công ty kèm tiến độ (% hoàn thành).",
        "parameters": {"type": "object", "properties": {
            "status": {"type": "string", "description": "Lọc theo trạng thái dự án (tuỳ chọn)"},
        }},
    }},
    {"type": "function", "function": {
        "name": "project_summary",
        "description": "Tóm tắt tiến độ 1 dự án: số công việc, hoàn thành, quá hạn, dự báo ngày hoàn thành.",
        "parameters": {"type": "object", "properties": {
            "project": {"type": "string", "description": "Tên (hoặc ID) dự án"},
        }, "required": ["project"]},
    }},
    {"type": "function", "function": {
        "name": "list_my_tasks",
        "description": "Liệt kê công việc được giao cho nhân viên đang hỏi.",
        "parameters": {"type": "object", "properties": {
            "status": {"type": "string", "enum": ["all", "pending", "completed", "overdue"]},
            "project": {"type": "string", "description": "Lọc theo tên dự án (tuỳ chọn)"},
        }},
    }},
    {"type": "function", "function": {
        "name": "list_events",
        "description": "Liệt kê lịch họp/lịch cá nhân trong khoảng thời gian.",
        "parameters": {"type": "object", "properties": {
            "date_from": {"type": "string", "description": "YYYY-MM-DD, mặc định hôm nay"},
            "date_to": {"type": "string", "description": "YYYY-MM-DD, mặc định +14 ngày"},
        }},
    }},
    {"type": "function", "function": {
        "name": "create_meeting",
        "description": "Tạo lịch mới. BẮT BUỘC hỏi rõ 'type' là 'meeting' (họp công ty, có thể mời người) hay 'personal' (lịch cá nhân riêng tư) nếu người dùng chưa nói rõ.",
        "parameters": {"type": "object", "properties": {
            "type": {"type": "string", "enum": ["meeting", "personal"]},
            "title": {"type": "string"},
            "event_date": {"type": "string", "description": "YYYY-MM-DD"},
            "start_time": {"type": "string", "description": "HH:MM (tuỳ chọn)"},
            "end_time": {"type": "string", "description": "HH:MM (tuỳ chọn)"},
            "location": {"type": "string"},
            "online_meeting_link": {"type": "string"},
            "content": {"type": "string", "description": "Nội dung/ghi chú (tuỳ chọn)"},
            "invite_all_company": {"type": "boolean", "description": "Mời toàn công ty (chỉ áp dụng type=meeting)"},
            "invited_employee_names": {"type": "array", "items": {"type": "string"}, "description": "Tên nhân viên muốn mời (chỉ áp dụng type=meeting)"},
        }, "required": ["type", "title", "event_date"]},
    }},
    {"type": "function", "function": {
        "name": "create_task",
        "description": "Tạo công việc mới trong 1 dự án, có thể giao ngay cho người phụ trách.",
        "parameters": {"type": "object", "properties": {
            "project": {"type": "string", "description": "Tên (hoặc ID) dự án"},
            "name": {"type": "string"},
            "due_date": {"type": "string", "description": "YYYY-MM-DD (tuỳ chọn)"},
            "assignee_names": {"type": "array", "items": {"type": "string"}, "description": "Tên người phụ trách (tuỳ chọn)"},
        }, "required": ["project", "name"]},
    }},
]
