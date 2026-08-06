from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from employees.models import EmployeeCompany


class Command(BaseCommand):
    help = (
        'Cấp quyền Duyệt/Từ chối đề xuất chi phí (proposals) cho 1 hoặc nhiều tài khoản '
        '(theo Django User id) trong công ty của họ. An toàn chạy lại nhiều lần.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id', type=int, action='append', required=True,
            help='Django User id cần cấp quyền duyệt (lặp lại cờ này để chỉ định nhiều user)',
        )
        parser.add_argument(
            '--revoke', action='store_true',
            help='Thu hồi quyền duyệt thay vì cấp',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        grant = not options['revoke']

        for user_id in options['user_id']:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise CommandError(f'Không tìm thấy User id={user_id}')

            employee = getattr(user, 'employee', None)
            if employee is None:
                raise CommandError(f'User id={user_id} ({user.username}) chưa gắn với nhân viên nào')

            links = list(EmployeeCompany.objects.filter(employee=employee).select_related('company'))
            if not links:
                raise CommandError(f'Nhân viên "{employee.full_name}" chưa thuộc công ty nào')

            for link in links:
                link.can_approve_proposals = grant
                link.save(update_fields=['can_approve_proposals'])

            company_names = ', '.join(link.company.name for link in links)
            verb = 'Đã cấp' if grant else 'Đã thu hồi'
            self.stdout.write(self.style.SUCCESS(
                f'{verb} quyền duyệt đề xuất cho {employee.full_name} (user_id={user_id}) tại: {company_names}'
            ))
