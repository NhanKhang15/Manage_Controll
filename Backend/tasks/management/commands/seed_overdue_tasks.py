from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from projects.models import Project
from tasks.models import Task, TaskAssignment

DEMO_PREFIX = '[Demo] '

# (tên việc, số ngày lệch so với hôm nay — âm = quá hạn, None = không có hạn). Tất cả đều
# is_completed=False để phục vụ test tính năng liệt kê việc trễ/chưa xong của Trợ lý AI.
TASK_TEMPLATES = [
    ('Xử lý khiếu nại khách hàng', -6),
    ('Cập nhật báo giá quý mới', -2),
    ('Rà soát hợp đồng chưa ký', -12),
    ('Chuẩn bị slide báo cáo tuần', 3),
    ('Theo dõi phản hồi sau demo sản phẩm', None),
]


class Command(BaseCommand):
    help = (
        'Seed thêm việc quá hạn / chưa hoàn thành cho 1 hoặc nhiều tài khoản (theo Django '
        'User id) để test tính năng liệt kê công việc của Trợ lý AI. An toàn chạy lại nhiều lần.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id', type=int, action='append', required=True,
            help='Django User id cần thêm việc (lặp lại cờ này để chỉ định nhiều user)',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        today = timezone.localdate()
        tasks_created = 0
        assignments_created = 0

        with transaction.atomic():
            for user_id in options['user_id']:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    raise CommandError(f'Không tìm thấy User id={user_id}')

                employee = getattr(user, 'employee', None)
                if employee is None:
                    raise CommandError(f'User id={user_id} ({user.username}) chưa gắn với nhân viên nào')

                company_link = employee.employee_companies.select_related('company').first()
                if not company_link:
                    raise CommandError(f'Nhân viên "{employee.full_name}" chưa thuộc công ty nào')
                company = company_link.company

                projects = list(Project.objects.filter(company=company)[:2])
                if not projects:
                    raise CommandError(f'Công ty "{company.name}" chưa có dự án nào để gắn công việc mẫu')

                # Hậu tố ngắn từ UUID nhân viên để tên việc không đụng nhau giữa các user
                # (vd 2 tài khoản trùng tên "Nguyễn Nhân").
                tag = employee.id.split('-')[0]

                for i, (name, offset) in enumerate(TASK_TEMPLATES):
                    project = projects[i % len(projects)]
                    due_date = today + timedelta(days=offset) if offset is not None else None
                    task, was_created = Task.objects.get_or_create(
                        project=project,
                        name=f'{DEMO_PREFIX}{name} [{tag}]',
                        defaults={'status': 'Cần làm', 'is_completed': False, 'due_date': due_date},
                    )
                    if was_created:
                        tasks_created += 1
                    _, assigned = TaskAssignment.objects.get_or_create(
                        task=task, employee=employee, role='assignee', defaults={'assigned_by': employee},
                    )
                    if assigned:
                        assignments_created += 1

                self.stdout.write(self.style.SUCCESS(
                    f'{employee.full_name} (user_id={user_id}, {user.username}) tại {company.name}: '
                    f'+{len(TASK_TEMPLATES)} việc trễ/chưa hoàn thành'
                ))

        self.stdout.write(f'Tổng: Task mới +{tasks_created}, TaskAssignment mới +{assignments_created}')
