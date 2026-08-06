from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from companies.models import Company
from employees.models import Employee
from proposals.models import Proposal

# (tiêu đề, số tiền VNĐ, ghi chú)
DEMO_PROPOSALS = [
    ('Tạm ứng 50% hợp đồng CRM', 425_000_000, 'Nhà cung cấp yêu cầu tạm ứng trước khi triển khai'),
    ('Mua gói API Zalo OA', 15_000_000, '15tr/năm — kết nối Zalo OA vào CRM'),
    ('Ngân sách OCR FPT.AI', 12_000_000, '12tr/năm theo chốt cuộc họp OCR'),
    ('Mua laptop cho nhân viên mới', 22_000_000, '2 laptop lập trình viên, dự kiến onboard tháng sau'),
    ('Thuê ngoài thiết kế landing page', 25_000_000, 'Landing page chiến dịch ra mắt sản phẩm mới'),
    ('Chi phí quảng cáo Facebook Ads Q3', 60_000_000, 'Ngân sách chạy ads quý 3 theo kế hoạch marketing'),
    ('Mua license Figma team', 8_000_000, '5 seat/năm cho đội thiết kế'),
    ('Nâng cấp gói lưu trữ Google Drive', 3_000_000, 'Hết dung lượng lưu trữ tài liệu dự án'),
]


class Command(BaseCommand):
    help = (
        'Seed vài đề xuất chi phí mẫu (trạng thái chờ duyệt) để test tab "Chờ duyệt" ở '
        'trang Công việc và trang Đề xuất & duyệt. An toàn chạy lại nhiều lần.'
    )

    def add_arguments(self, parser):
        parser.add_argument('--company', default='An Nhàn', help='Tên công ty để gắn đề xuất mẫu')

    def handle(self, *args, **options):
        company_name = options['company']
        company = Company.objects.filter(name=company_name).first()
        if not company:
            raise CommandError(f'Không tìm thấy công ty "{company_name}"')

        employees = list(Employee.objects.filter(employee_companies__company=company).order_by('id'))
        if not employees:
            raise CommandError(f'Công ty "{company.name}" chưa có nhân viên nào')

        created = 0
        with transaction.atomic():
            for i, (title, amount, note) in enumerate(DEMO_PROPOSALS):
                requester = employees[i % len(employees)]
                _, was_created = Proposal.objects.get_or_create(
                    company=company,
                    title=title,
                    defaults={'amount': amount, 'note': note, 'requester': requester, 'status': 'pending'},
                )
                if was_created:
                    created += 1

        self.stdout.write(self.style.SUCCESS(f'{company.name}: +{created} đề xuất mẫu (chờ duyệt)'))
