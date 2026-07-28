import getpass

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from employees.models import Employee


class Command(BaseCommand):
    help = (
        "Gắn (hoặc tạo mới) một tài khoản đăng nhập (auth_user) cho một Employee "
        "đã tồn tại, dựa theo email. Mật khẩu được nhập tương tác (getpass), "
        "không bao giờ được lưu vào code/commit."
    )

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help='Email của Employee cần gắn tài khoản đăng nhập')

    def handle(self, *args, **options):
        email = options['email']

        try:
            employee = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            raise CommandError(f'Không tìm thấy Employee với email "{email}"')

        User = get_user_model()
        password = getpass.getpass(f'Mật khẩu đăng nhập cho "{employee.full_name}" ({email}): ')
        if not password:
            raise CommandError('Mật khẩu không được để trống')

        if employee.user_id:
            user = employee.user
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Đã cập nhật mật khẩu cho tài khoản hiện có của "{email}"'))
        else:
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            user.set_password(password)
            user.save()
            employee.user = user
            employee.save(update_fields=['user'])
            self.stdout.write(self.style.SUCCESS(f'Đã tạo và gắn tài khoản đăng nhập mới cho "{email}"'))
