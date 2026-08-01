import random
from datetime import timedelta, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from companies.models import Company, Department
from employees.models import Employee, EmployeeCompany, EmployeeDepartment
from events.models import (
    Driver, Event, EventDepartmentInvite, EventEmployeeInvite, Notification,
)
from integrations.models import CompanyAISetting, AuditLog
from meetings.models import MeetingTranscript
from projects.models import Project
from tasks.models import Task, TaskAssignment

SEED_PASSWORD = 'Vela@2024'

SURNAMES = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ',
    'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý',
]
MIDDLES = [
    'Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Ngọc', 'Quang', 'Anh',
    'Thu', 'Kim', 'Xuân', 'Bảo', 'Gia', 'Hồng',
]
GIVEN_NAMES = [
    'An', 'Bình', 'Chi', 'Dũng', 'Phúc', 'Giang', 'Hà', 'Huy', 'Khoa',
    'Lan', 'Long', 'Mai', 'Nam', 'Oanh', 'Phương', 'Quân', 'Quyên', 'Sơn',
    'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Uyên', 'Việt', 'Yến', 'Đạt', 'Hiếu',
    'Trung', 'Linh', 'Hằng', 'Hoa', 'Nga', 'Nhi', 'Vy', 'Khánh', 'Tùng',
    'Đăng', 'My', 'Toàn', 'Vinh',
]

VI_MAP = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a',
    'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a',
    'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e',
    'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o',
    'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o',
    'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u',
    'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
}


def remove_accents(text):
    text = text.lower()
    return ''.join(VI_MAP.get(ch, ch) for ch in text)


def make_full_name():
    return f"{random.choice(SURNAMES)} {random.choice(MIDDLES)} {random.choice(GIVEN_NAMES)}"


DOMAIN_MAP = {
    'An Nhàn': 'annhan.vn',
    'An Tâm': 'antam.vn',
    'Đất Việt Group': 'datviet.vn',
    'Đất Việt Miền Nam': 'datvietmiennam.vn',
    'Đất Việt Miền Bắc': 'datvietmienbac.vn',
    'An Gia Land': 'angia.vn',
}

DEPT_POSITIONS = {
    'Ban Giám đốc': ['Giám đốc điều hành', 'Phó giám đốc', 'Trợ lý giám đốc'],
    'Công nghệ': ['Lập trình viên Backend', 'Lập trình viên Frontend', 'Kỹ sư DevOps', 'Chuyên viên QA/Tester', 'Trưởng nhóm kỹ thuật'],
    'Kế toán': ['Kế toán viên', 'Kế toán trưởng', 'Chuyên viên thu chi'],
    'Kinh doanh': ['Nhân viên kinh doanh', 'Trưởng nhóm kinh doanh', 'Chuyên viên chăm sóc khách hàng'],
    'Sales': ['Nhân viên Sales', 'Sales Executive', 'Trưởng phòng Sales'],
    'Marketing': ['Chuyên viên Marketing', 'Content Creator', 'Chuyên viên Truyền thông'],
    'Phòng Marketing': ['Chuyên viên Marketing', 'Content Creator'],
    'Nhân sự': ['Chuyên viên nhân sự', 'HR Manager', 'Chuyên viên tuyển dụng'],
    'Sản phẩm': ['Product Manager', 'Business Analyst', 'Chuyên viên phát triển sản phẩm'],
    'Vận hành': ['Nhân viên vận hành', 'Trưởng phòng vận hành', 'Chuyên viên hậu cần'],
    'Phòng Kinh doanh': ['Nhân viên kinh doanh', 'Trưởng nhóm kinh doanh'],
    'Phòng Pháp lý': ['Chuyên viên pháp lý', 'Trưởng phòng pháp lý'],
}
DEFAULT_POSITIONS = ['Chuyên viên', 'Nhân viên']

REAL_ESTATE_PROJECT_NAMES = [
    'Riverside Garden', 'Sunshine Valley', 'Green Park Residence',
    'Ocean Hill Villas', 'Diamond Bay Tower', 'The Pearl Complex',
    'Emerald City', 'Golden Hills', 'Lotus Residence', 'Sky Line Towers',
]
GENERIC_PROJECT_NAMES = [
    'Hệ thống quản lý nội bộ', 'Chuyển đổi số Giai đoạn 1',
    'Ứng dụng CRM nội bộ', 'Website thương mại điện tử',
    'Tối ưu quy trình vận hành', 'Xây dựng thương hiệu 2026',
]
PROJECT_STATUSES = ['Đề xuất & Chọn', 'Định nghĩa', 'R&D', 'Triển khai', 'Hoàn thành', 'Tạm dừng']

TASK_NAME_TEMPLATES = [
    'Lập kế hoạch {p}', 'Thiết kế phương án cho {p}', 'Họp review tiến độ {p}',
    'Chuẩn bị tài liệu {p}', 'Kiểm tra chất lượng {p}', 'Bàn giao hạng mục {p}',
    'Cập nhật báo cáo {p}', 'Xử lý phản hồi khách hàng {p}',
    'Rà soát ngân sách {p}', 'Đào tạo nhân sự cho {p}',
]
TASK_STATUSES = ['Cần làm', 'Đang làm', 'Hoàn thành', 'Trễ hạn']

EVENT_MEETING_TITLES = [
    'Họp giao ban tuần', 'Họp review dự án', 'Họp với đối tác',
    'Họp đào tạo nội bộ', 'Họp tổng kết tháng', 'Họp kế hoạch quý',
]
EVENT_PERSONAL_TITLES = ['Khám sức khỏe định kỳ', 'Nghỉ phép', 'Công tác cá nhân']
EVENT_REMINDER_TITLES = ['Nhắc nộp báo cáo', 'Nhắc gia hạn hợp đồng', 'Nhắc thanh toán']

LOCATIONS = ['Phòng họp A', 'Phòng họp B', 'Văn phòng công ty', 'Trực tuyến']


class Command(BaseCommand):
    help = 'Seed thêm dữ liệu mẫu (nhân viên, dự án, công việc, sự kiện, ...) cho tất cả các bảng.'

    def add_arguments(self, parser):
        parser.add_argument('--seed', type=int, default=42, help='Random seed để tái lập kết quả')

    def handle(self, *args, **options):
        random.seed(options['seed'])
        User = get_user_model()
        now = timezone.now()
        today = now.date()

        existing_emails = set(Employee.objects.values_list('email', flat=True))
        existing_usernames = set(User.objects.values_list('username', flat=True))

        companies = list(Company.objects.select_related('parent').all())
        stats = {}

        with transaction.atomic():
            # --- CompanyAISetting: 1 per company ---
            ai_created = 0
            for company in companies:
                _, created = CompanyAISetting.objects.get_or_create(
                    company=company,
                    defaults={'is_ai_enabled': False},
                )
                if created:
                    ai_created += 1
            stats['CompanyAISetting'] = ai_created

            new_employees_by_company = {c.id: [] for c in companies}
            employees_created = 0
            users_created = 0

            for company in companies:
                domain = DOMAIN_MAP.get(company.name, f"{remove_accents(slugify(company.name)).replace('-', '')}.vn")
                depts = list(company.departments.all())

                for dept in depts:
                    positions = DEPT_POSITIONS.get(dept.name, DEFAULT_POSITIONS)
                    count = random.randint(1, 2)
                    for _ in range(count):
                        full_name = make_full_name()
                        base_slug = remove_accents(full_name).replace(' ', '.')
                        email = f"{base_slug}@{domain}"
                        n = 1
                        while email in existing_emails:
                            n += 1
                            email = f"{base_slug}{n}@{domain}"
                        existing_emails.add(email)

                        username = email
                        m = 1
                        while username in existing_usernames:
                            m += 1
                            username = f"{email.split('@')[0]}{m}@{email.split('@')[1]}"
                        existing_usernames.add(username)

                        user = User.objects.create(username=username, email=email)
                        user.set_password(SEED_PASSWORD)
                        user.save()
                        users_created += 1

                        position_title = random.choice(positions)
                        phone = '0' + random.choice(['3', '5', '7', '8', '9']) + ''.join(random.choice('0123456789') for _ in range(8))

                        joined_days_ago = random.randint(30, 1200)
                        employee = Employee.objects.create(
                            user=user,
                            full_name=full_name,
                            email=email,
                            phone=phone,
                            position_title=position_title,
                            is_active=True,
                        )
                        employees_created += 1

                        role_in_company = 'manager' if ('Giám đốc' in position_title or 'Trưởng' in position_title) else 'employee'
                        EmployeeCompany.objects.create(
                            employee=employee,
                            company=company,
                            role_in_company=role_in_company,
                            joined_at=today - timedelta(days=joined_days_ago),
                        )
                        EmployeeDepartment.objects.create(
                            employee=employee,
                            department=dept,
                            is_primary=True,
                            joined_at=today - timedelta(days=joined_days_ago),
                        )

                        AuditLog.objects.create(
                            table_name='employees',
                            record_id=employee.id,
                            action='create',
                            changed_by=None,
                            changes={'full_name': full_name, 'email': email, 'position_title': position_title},
                            ip_address='127.0.0.1',
                        )

                        new_employees_by_company[company.id].append(employee)

            stats['Employee'] = employees_created
            stats['User'] = users_created

            # --- Drivers: 2 per company ---
            drivers_created = 0
            drivers_by_company = {c.id: list(Driver.objects.filter(company=c)) for c in companies}
            for company in companies:
                for _ in range(2):
                    full_name = make_full_name()
                    phone = '0' + random.choice(['3', '5', '7', '8', '9']) + ''.join(random.choice('0123456789') for _ in range(8))
                    driver = Driver.objects.create(company=company, full_name=full_name, phone=phone, is_active=True)
                    drivers_by_company[company.id].append(driver)
                    drivers_created += 1
            stats['Driver'] = drivers_created

            # --- Projects: 2 new per company ---
            projects_created = 0
            new_projects_by_company = {c.id: [] for c in companies}
            is_real_estate = {'Đất Việt Group', 'Đất Việt Miền Nam', 'Đất Việt Miền Bắc', 'An Gia Land'}
            for company in companies:
                name_pool = REAL_ESTATE_PROJECT_NAMES if company.name in is_real_estate else GENERIC_PROJECT_NAMES
                chosen_names = random.sample(name_pool, k=min(2, len(name_pool)))
                for idx, name in enumerate(chosen_names):
                    project = Project.objects.create(
                        company=company,
                        name=name,
                        status=random.choice(PROJECT_STATUSES),
                        order_index=idx,
                    )
                    new_projects_by_company[company.id].append(project)
                    projects_created += 1
            stats['Project'] = projects_created

            # --- Tasks + TaskAssignment for every project (existing + new) ---
            all_projects = list(Project.objects.select_related('company').all())
            all_employees_by_company = {c.id: list(Employee.objects.filter(employee_companies__company=c)) for c in companies}

            tasks_created = 0
            assignments_created = 0
            for project in all_projects:
                company_employees = all_employees_by_company.get(project.company_id, [])
                task_count = random.randint(5, 8)
                for i in range(task_count):
                    status = random.choice(TASK_STATUSES)
                    template = random.choice(TASK_NAME_TEMPLATES)
                    due_offset = random.randint(-30, 60)
                    task = Task.objects.create(
                        project=project,
                        name=template.format(p=project.name),
                        status=status,
                        is_completed=(status == 'Hoàn thành'),
                        due_date=today + timedelta(days=due_offset),
                        order_index=i,
                    )
                    tasks_created += 1

                    if company_employees:
                        assignees = random.sample(company_employees, k=min(random.choice([1, 1, 2]), len(company_employees)))
                        assigner = random.choice(company_employees)
                        for a_idx, emp in enumerate(assignees):
                            role = 'assignee' if a_idx == 0 else 'reviewer'
                            TaskAssignment.objects.create(
                                task=task,
                                employee=emp,
                                role=role,
                                assigned_by=assigner,
                            )
                            assignments_created += 1
            stats['Task'] = tasks_created
            stats['TaskAssignment'] = assignments_created

            # --- Events + invites + notifications + transcripts ---
            events_created = 0
            dept_invites_created = 0
            emp_invites_created = 0
            notifications_created = 0
            transcripts_created = 0

            for company in companies:
                company_employees = all_employees_by_company.get(company.id, [])
                depts = list(company.departments.all())
                company_drivers = drivers_by_company.get(company.id, [])
                if not company_employees:
                    continue

                for _ in range(4):
                    ev_type = random.choices(['meeting', 'personal', 'reminder'], weights=[0.6, 0.25, 0.15])[0]
                    creator = random.choice(company_employees)
                    day_offset = random.randint(-15, 45)
                    event_date = today + timedelta(days=day_offset)

                    if ev_type == 'meeting':
                        title = random.choice(EVENT_MEETING_TITLES)
                    elif ev_type == 'personal':
                        title = random.choice(EVENT_PERSONAL_TITLES)
                    else:
                        title = random.choice(EVENT_REMINDER_TITLES)

                    start_hour = random.randint(8, 16)
                    need_pickup = ev_type == 'meeting' and random.random() < 0.3 and bool(company_drivers)
                    invite_all = ev_type == 'meeting' and random.random() < 0.2

                    event = Event.objects.create(
                        company=company,
                        type=ev_type,
                        title=title,
                        content=f"Nội dung: {title} - {company.name}",
                        event_date=event_date,
                        start_time=time(start_hour, 0),
                        end_time=time(start_hour + 1, 0),
                        location=random.choice(LOCATIONS) if ev_type == 'meeting' else None,
                        online_meeting_link='https://meet.google.com/abc-defg-hij' if ev_type == 'meeting' and random.random() < 0.4 else None,
                        created_by=creator,
                        need_pickup_car=need_pickup,
                        driver=random.choice(company_drivers) if need_pickup else None,
                        has_gift=random.random() < 0.1,
                        gift_note='Quà tặng đối tác' if random.random() < 0.1 else None,
                        invite_all_company=invite_all,
                    )
                    events_created += 1

                    invited_employees = []
                    if ev_type == 'meeting' and not invite_all:
                        chosen_depts = random.sample(depts, k=min(random.choice([1, 2]), len(depts)))
                        for dept in chosen_depts:
                            EventDepartmentInvite.objects.create(event=event, department=dept)
                            dept_invites_created += 1

                        invited_employees = random.sample(company_employees, k=min(random.randint(2, 4), len(company_employees)))
                        for emp in invited_employees:
                            EventEmployeeInvite.objects.get_or_create(event=event, employee=emp)
                            emp_invites_created += 1
                    elif invite_all:
                        invited_employees = company_employees

                    if ev_type == 'meeting':
                        for emp in invited_employees[:5]:
                            Notification.objects.create(
                                company=company,
                                recipient=emp,
                                type='meeting_invite',
                                icon_key='calendar',
                                title=f'Bạn được mời tham gia: {title}',
                                body=f'{title} diễn ra vào {event_date.isoformat()} lúc {start_hour}:00.',
                                related_table='events',
                                related_id=event.id,
                                triggered_by=creator,
                            )
                            notifications_created += 1

                        if random.random() < 0.35:
                            MeetingTranscript.objects.create(
                                company=company,
                                event=event,
                                title=title,
                                transcript_text=f'[Bản ghi tự động] Nội dung cuộc họp "{title}" của {company.name}.',
                                summary_text=f'Tóm tắt: cuộc họp "{title}" đã thống nhất các đầu việc tiếp theo cho {company.name}.',
                                summary_generated_at=now,
                                char_count=120,
                                created_by=creator,
                            )
                            transcripts_created += 1

            stats['Event'] = events_created
            stats['EventDepartmentInvite'] = dept_invites_created
            stats['EventEmployeeInvite'] = emp_invites_created
            stats['MeetingTranscript'] = transcripts_created

            # --- Extra notifications: task_completed / overdue_task / general ---
            recent_tasks = list(Task.objects.filter(status__in=['Hoàn thành', 'Trễ hạn']).select_related('project__company').order_by('-created_at')[:80])
            for task in recent_tasks:
                assignment = TaskAssignment.objects.filter(task=task).first()
                if not assignment:
                    continue
                notif_type = 'task_completed' if task.status == 'Hoàn thành' else 'overdue_task'
                title = f'{"Hoàn thành" if notif_type == "task_completed" else "Quá hạn"}: {task.name}'
                Notification.objects.create(
                    company=task.project.company,
                    recipient=assignment.employee,
                    type=notif_type,
                    icon_key='task',
                    title=title,
                    body=f'Công việc "{task.name}" thuộc dự án {task.project.name}.',
                    related_table='tasks',
                    related_id=task.id,
                    triggered_by=assignment.assigned_by,
                )
                notifications_created += 1

            stats['Notification'] = notifications_created

        self.stdout.write(self.style.SUCCESS('Đã seed thêm dữ liệu:'))
        for k, v in stats.items():
            self.stdout.write(f'  {k}: +{v}')
        self.stdout.write(self.style.WARNING(f'Mật khẩu đăng nhập mặc định cho các tài khoản mới: {SEED_PASSWORD}'))
