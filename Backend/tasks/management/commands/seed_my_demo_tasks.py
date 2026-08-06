from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from companies.models import Department
from employees.models import Employee, EmployeeDepartment
from projects.models import Project
from tasks.models import Task, TaskAssignment

DEMO_PREFIX = '[Demo] '

# (tên việc, số ngày lệch so với hôm nay — âm = quá hạn, None = không có hạn, đã hoàn thành?)
MY_TASKS = [
    ('Review API tích hợp CRM', -3, False),
    ('Viết tài liệu hướng dẫn sử dụng CRM', 5, False),
    ('Kiểm thử luồng đăng nhập CRM', -1, True),
    ('Chuẩn hoá dữ liệu khách hàng cũ', None, False),
    ('Tổng hợp phản hồi khách hàng', 2, True),
]
TEAMMATE_TASKS = [
    ('Thiết kế bộ nhận diện thương hiệu', 10, False),
    ('Lên kế hoạch nội dung Q4', -5, False),
]
OUTSIDER_TASK = ('Setup pipeline CI/CD', -10, False)


class Command(BaseCommand):
    help = (
        'Seed dữ liệu mẫu để test "Của tôi" / "Cả phòng" ở trang Công việc: gán phòng '
        'ban + vài task [Demo] cho 1 tài khoản test, cộng vài task của đồng nghiệp cùng '
        'phòng và 1 task của người khác phòng (để kiểm tra bộ lọc không lẫn dữ liệu). '
        'An toàn chạy lại nhiều lần (idempotent).'
    )

    def add_arguments(self, parser):
        parser.add_argument('--email', default='khangnhan15@gmail.com', help='Email nhân viên test')
        parser.add_argument('--department', default='Công nghệ', help='Phòng ban gán cho nhân viên test')

    def handle(self, *args, **options):
        email = options['email']
        dept_name = options['department']

        try:
            me = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            raise CommandError(f'Không tìm thấy nhân viên với email "{email}"')

        company_link = me.employee_companies.select_related('company').first()
        if not company_link:
            raise CommandError(f'Nhân viên "{me.full_name}" chưa thuộc công ty nào')
        company = company_link.company

        department, _ = Department.objects.get_or_create(company=company, name=dept_name)
        EmployeeDepartment.objects.update_or_create(
            employee=me, department=department, defaults={'is_primary': True},
        )

        projects = list(Project.objects.filter(company=company)[:2])
        if not projects:
            raise CommandError(f'Công ty "{company.name}" chưa có dự án nào để gắn công việc mẫu')

        teammate = (
            Employee.objects.filter(employee_departments__department=department)
            .exclude(id=me.id).first()
        )
        outsider = (
            Employee.objects.filter(employee_companies__company=company)
            .exclude(employee_departments__department=department)
            .exclude(id=me.id).first()
        )

        today = timezone.localdate()
        tasks_created = 0
        assignments_created = 0

        def seed_task(name, offset, completed, project, assignee):
            nonlocal tasks_created, assignments_created
            due_date = today + timedelta(days=offset) if offset is not None else None
            task, was_created = Task.objects.get_or_create(
                project=project,
                name=DEMO_PREFIX + name,
                defaults={
                    'status': 'Hoàn thành' if completed else 'Cần làm',
                    'is_completed': completed,
                    'due_date': due_date,
                },
            )
            if was_created:
                tasks_created += 1
            _, assigned = TaskAssignment.objects.get_or_create(
                task=task, employee=assignee, role='assignee', defaults={'assigned_by': me},
            )
            if assigned:
                assignments_created += 1

        with transaction.atomic():
            for i, (name, offset, completed) in enumerate(MY_TASKS):
                seed_task(name, offset, completed, projects[i % len(projects)], me)

            if teammate:
                for i, (name, offset, completed) in enumerate(TEAMMATE_TASKS):
                    seed_task(name, offset, completed, projects[i % len(projects)], teammate)

            if outsider:
                name, offset, completed = OUTSIDER_TASK
                seed_task(name, offset, completed, projects[0], outsider)

        self.stdout.write(self.style.SUCCESS(f'{me.full_name} ({email}) -> phòng "{dept_name}" tại {company.name}'))
        self.stdout.write(f'  Task mới: +{tasks_created}, TaskAssignment mới: +{assignments_created}')
        if teammate:
            self.stdout.write(f'  Đồng nghiệp cùng phòng (test "Cả phòng"): {teammate.full_name}')
        if outsider:
            self.stdout.write(f'  Người khác phòng (không được lọt vào "Cả phòng"): {outsider.full_name}')
