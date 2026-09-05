import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from companies.models import Company
from companies.management.commands.seed_more_data import (
    DOMAIN_MAP, SEED_PASSWORD, make_full_name, remove_accents,
)
from employees.models import Employee, EmployeeCompany, EmployeeReaction

SENIOR_KEYWORDS = ['giám đốc', 'chủ tịch', 'trưởng', 'manager', 'director', 'ceo', 'cpo', 'cfo']


def is_senior_title(title):
    if not title:
        return False
    lowered = title.lower()
    return any(k in lowered for k in SENIOR_KEYWORDS)


class Command(BaseCommand):
    help = (
        'Seed dữ liệu demo cho trang Nhân sự: quan hệ cấp trên (Employee.manager, để test sơ đồ '
        'tổ chức), like/dislike thật giữa nhân viên (EmployeeReaction, để test rating/level/điểm), '
        'và vài tài khoản tự đăng ký đang chờ duyệt (Employee.is_approved=False, để test tab Chờ duyệt). '
        'An toàn chạy lại nhiều lần — không đụng tới quan hệ cấp trên đã có sẵn.'
    )

    def add_arguments(self, parser):
        parser.add_argument('--company-id', type=str, help='Chỉ seed cho 1 công ty (mặc định: tất cả công ty)')
        parser.add_argument('--pending', type=int, default=3, help='Số tài khoản chờ duyệt tạo mỗi công ty')
        parser.add_argument('--seed', type=int, default=7, help='Random seed để tái lập kết quả')

    def handle(self, *args, **options):
        random.seed(options['seed'])
        User = get_user_model()

        companies = Company.objects.all()
        if options['company_id']:
            companies = companies.filter(id=options['company_id'])
        companies = list(companies)

        managers_set = 0
        reactions_created = 0
        pending_created = 0

        with transaction.atomic():
            for company in companies:
                emp_ids = EmployeeCompany.objects.filter(company=company).values_list('employee_id', flat=True)
                employees = list(
                    Employee.objects.filter(id__in=emp_ids, is_active=True, is_approved=True, user__isnull=False)
                )
                if len(employees) < 2:
                    continue

                # --- 1) Quan hệ cấp trên: tự động chỉ cho nhân viên CHƯA có cấp trên,
                # không đụng vào quan hệ đã set thủ công trước đó. `seniors` lấy từ TOÀN BỘ
                # nhân viên (kể cả người đã có cấp trên sẵn) để làm điểm neo trưởng phòng cho
                # đồng nghiệp cùng phòng ban — chỉ giới hạn ở without_manager thì bỏ sót các
                # trưởng phòng đã được gán cấp trên từ trước.
                without_manager = [e for e in employees if e.manager_id is None]
                seniors = [e for e in employees if is_senior_title(e.position_title)]
                top_boss = next(
                    (e for e in seniors if 'giám đốc' in (e.position_title or '').lower() or 'chủ tịch' in (e.position_title or '').lower()),
                    seniors[0] if seniors else (employees[0] if employees else None),
                )

                for e in without_manager:
                    if e.id == (top_boss.id if top_boss else None):
                        continue
                    if is_senior_title(e.position_title):
                        # Trưởng phòng/nhóm báo cáo thẳng lên sếp tổng.
                        manager = top_boss
                    else:
                        # Nhân viên báo cáo lên trưởng cùng phòng ban nếu có, không thì lên sếp tổng.
                        dept_head = next(
                            (
                                s for s in seniors
                                if s.id != e.id
                                and s.employee_departments.filter(
                                    department_id__in=e.employee_departments.values_list('department_id', flat=True)
                                ).exists()
                            ),
                            None,
                        )
                        manager = dept_head or top_boss
                    if manager and manager.id != e.id:
                        e.manager = manager
                        e.save(update_fields=['manager'])
                        managers_set += 1

                # --- 2) Like/dislike thật giữa các nhân viên (rating/level/điểm tính từ đây). ---
                for from_emp in employees:
                    colleagues = [c for c in employees if c.id != from_emp.id]
                    if not colleagues:
                        continue
                    sample_size = max(1, int(len(colleagues) * random.uniform(0.3, 0.7)))
                    for to_emp in random.sample(colleagues, k=min(sample_size, len(colleagues))):
                        reaction = EmployeeReaction.LIKE if random.random() < 0.8 else EmployeeReaction.DISLIKE
                        _, created = EmployeeReaction.objects.get_or_create(
                            from_employee=from_emp, to_employee=to_emp, defaults={'reaction': reaction}
                        )
                        if created:
                            reactions_created += 1

                # --- 3) Vài tài khoản tự đăng ký đang chờ duyệt (test tab Chờ duyệt). ---
                domain = DOMAIN_MAP.get(company.name, f"{remove_accents(slugify(company.name)).replace('-', '')}.vn")
                existing_emails = set(Employee.objects.values_list('email', flat=True))
                existing_usernames = set(User.objects.values_list('username', flat=True))

                for _ in range(options['pending']):
                    full_name = make_full_name()
                    base_slug = remove_accents(full_name).replace(' ', '.')
                    email = f"pending.{base_slug}@{domain}"
                    n = 1
                    while email in existing_emails:
                        n += 1
                        email = f"pending.{base_slug}{n}@{domain}"
                    existing_emails.add(email)
                    existing_usernames.add(email)

                    user = User.objects.create(username=email, email=email)
                    user.set_password(SEED_PASSWORD)
                    user.save()

                    employee = Employee.objects.create(
                        user=user, full_name=full_name, email=email, is_active=True, is_approved=False,
                    )
                    EmployeeCompany.objects.get_or_create(employee=employee, company=company)
                    pending_created += 1

        self.stdout.write(self.style.SUCCESS('Đã seed dữ liệu demo cho trang Nhân sự:'))
        self.stdout.write(f'  Quan hệ cấp trên mới: +{managers_set}')
        self.stdout.write(f'  Like/dislike mới: +{reactions_created}')
        self.stdout.write(f'  Tài khoản chờ duyệt mới: +{pending_created}')
        if pending_created:
            self.stdout.write(self.style.WARNING(f'  Mật khẩu đăng nhập test cho các tài khoản mới: {SEED_PASSWORD}'))
