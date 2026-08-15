import sys
from django.core.management.base import BaseCommand
from companies.models import Company, Department
from projects.models import Project
from tasks.models import Task
from employees.models import Employee


class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu phân cấp đầy đủ: Công ty Mẹ -> Công ty Con & Phòng ban -> Folder & Sub-folder -> Công việc & Việc con'

    def handle(self, *args, **options):
        # Lấy hoặc tạo 1 nhân viên phụ trách nếu có
        pic = Employee.objects.first()

        # 1. Công ty Mẹ
        parent_corp, _ = Company.objects.get_or_create(
            name='Tập đoàn Vela Group',
            defaults={
                'order_index': 0,
                'is_active': True
            }
        )

        # 2. Công ty Con 1: Vela Software
        sub_company1, _ = Company.objects.get_or_create(
            name='Công ty TNHH Vela Software',
            parent=parent_corp,
            defaults={
                'order_index': 1,
                'is_active': True
            }
        )

        # 3. Công ty Con 2: Vela Media
        sub_company2, _ = Company.objects.get_or_create(
            name='Công ty CP Vela Media & Marketing',
            parent=parent_corp,
            defaults={
                'order_index': 2,
                'is_active': True
            }
        )

        # 4. Phòng ban thuộc Công ty Mẹ
        dept_strategy, _ = Department.objects.get_or_create(
            company=parent_corp,
            name='Phòng Ban Giám Đốc & Chiến Lược',
            defaults={'order_index': 1}
        )
        dept_finance, _ = Department.objects.get_or_create(
            company=parent_corp,
            name='Phòng Tài chính - Kế toán',
            defaults={'order_index': 2}
        )

        # Folder & Công việc thuộc Phòng Chiến Lược (Công ty Mẹ)
        folder_expand, _ = Project.objects.get_or_create(
            company=parent_corp,
            department=dept_strategy,
            name='Kế hoạch Mở rộng Thị trường Đông Nam Á',
            defaults={'status': 'Đang làm', 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=folder_expand,
            department=dept_strategy,
            name='Phân tích đối thủ cạnh tranh thị trường Singapore',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=folder_expand,
            department=dept_strategy,
            name='Soạn thảo tờ trình HĐQT về ngân sách đầu tư',
            defaults={'status': 'Cần làm', 'pic': pic, 'order_index': 2}
        )
        # Công việc trực tiếp thuộc Phòng Chiến Lược (đồng cấp với folder)
        Task.objects.get_or_create(
            department=dept_strategy,
            project=None,
            name='Chuẩn bị báo cáo chiến lược kinh doanh quý III',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )

        # Folder & Công việc thuộc Phòng Tài chính (Công ty Mẹ)
        folder_tax, _ = Project.objects.get_or_create(
            company=parent_corp,
            department=dept_finance,
            name='Quyết toán Thuế Doanh nghiệp 2025',
            defaults={'status': 'Hoàn thành', 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=folder_tax,
            department=dept_finance,
            name='Rà soát hóa đơn chứng từ GTGT',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            department=dept_finance,
            project=None,
            name='Đối soát công nợ đối tác tháng 7/2026',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 1}
        )

        # 5. Phòng ban thuộc Công ty Con 1 (Vela Software)
        dept_tech, _ = Department.objects.get_or_create(
            company=sub_company1,
            name='Phòng Kỹ thuật & Phát triển Sản phẩm',
            defaults={'order_index': 1}
        )
        dept_hr, _ = Department.objects.get_or_create(
            company=sub_company1,
            name='Phòng Nhân sự & Đào tạo',
            defaults={'order_index': 2}
        )

        # Folder trong Phòng Kỹ thuật: App Mobile SuperApp
        folder_app, _ = Project.objects.get_or_create(
            company=sub_company1,
            department=dept_tech,
            parent=None,
            name='Dự án App Mobile SuperApp',
            defaults={'status': 'Triển khai', 'order_index': 1}
        )

        # Sub-folder 1: Giao diện UI/UX
        subfolder_ui, _ = Project.objects.get_or_create(
            company=sub_company1,
            department=dept_tech,
            parent=folder_app,
            name='Module Giao diện UI/UX',
            defaults={'status': 'Đang làm', 'order_index': 1}
        )
        t_ui_dash, _ = Task.objects.get_or_create(
            project=subfolder_ui,
            department=dept_tech,
            name='Thiết kế màn hình Dashboard Mobile',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )
        t_ui_tree, _ = Task.objects.get_or_create(
            project=subfolder_ui,
            department=dept_tech,
            name='Thiết kế màn hình Cây Phân Công Đa Cấp',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 2}
        )
        # Subtasks (Việc con)
        Task.objects.get_or_create(
            parent=t_ui_tree,
            project=subfolder_ui,
            department=dept_tech,
            name='Xuất bộ SVG icons cho các cấp độ (Công ty, Phòng ban, Folder, Việc)',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            parent=t_ui_tree,
            project=subfolder_ui,
            department=dept_tech,
            name='Kiểm thử giao diện trên màn hình Tablet & Mobile',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 2}
        )

        # Sub-folder 2: Backend API
        subfolder_api, _ = Project.objects.get_or_create(
            company=sub_company1,
            department=dept_tech,
            parent=folder_app,
            name='Module API Backend & Database',
            defaults={'status': 'Đang làm', 'order_index': 2}
        )
        Task.objects.get_or_create(
            project=subfolder_api,
            department=dept_tech,
            name='Xây dựng API phân cấp cây công ty - phòng ban - folder',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=subfolder_api,
            department=dept_tech,
            name='Tối ưu hóa tốc độ truy vấn cơ sở dữ liệu phân cấp',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 2}
        )

        # Folder khác trong Phòng Kỹ thuật: Hạ tầng Cloud
        folder_devops, _ = Project.objects.get_or_create(
            company=sub_company1,
            department=dept_tech,
            name='Hạ tầng Cloud & DevOps',
            defaults={'status': 'Triển khai', 'order_index': 2}
        )
        Task.objects.get_or_create(
            project=folder_devops,
            department=dept_tech,
            name='Cấu hình Docker & CI/CD pipeline tự động build',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 1}
        )

        # Công việc trực tiếp thuộc Phòng Kỹ thuật (đồng cấp với Folder)
        Task.objects.get_or_create(
            department=dept_tech,
            project=None,
            name='Báo cáo tổng kết hiệu năng hệ thống tháng 7/2026',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            department=dept_tech,
            project=None,
            name='Bảo trì định kỳ máy chủ văn phòng',
            defaults={'status': 'Cần làm', 'pic': pic, 'order_index': 2}
        )

        # Folder & Công việc thuộc Phòng Nhân sự (Vela Software)
        folder_recruitment, _ = Project.objects.get_or_create(
            company=sub_company1,
            department=dept_hr,
            name='Kế hoạch Tuyển dụng Q3/2026',
            defaults={'status': 'Đang làm', 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=folder_recruitment,
            department=dept_hr,
            name='Đăng tin tuyển 3 vị trí Senior Frontend Developer',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=folder_recruitment,
            department=dept_hr,
            name='Lên lịch phỏng vấn ứng viên vòng 1',
            defaults={'status': 'Cần làm', 'pic': pic, 'order_index': 2}
        )
        Task.objects.get_or_create(
            department=dept_hr,
            project=None,
            name='Cập nhật hợp đồng lao động và phụ cấp nhân sự',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )

        # 6. Phòng ban thuộc Công ty Con 2 (Vela Media)
        dept_creative, _ = Department.objects.get_or_create(
            company=sub_company2,
            name='Phòng Sáng tạo & Thiết kế Media',
            defaults={'order_index': 1}
        )
        folder_brand, _ = Project.objects.get_or_create(
            company=sub_company2,
            department=dept_creative,
            name='Bộ nhận diện thương hiệu 2026',
            defaults={'status': 'Đang làm', 'order_index': 1}
        )
        subfolder_media, _ = Project.objects.get_or_create(
            company=sub_company2,
            department=dept_creative,
            parent=folder_brand,
            name='Ấn phẩm Truyền thông & Mạng xã hội',
            defaults={'status': 'Đang làm', 'order_index': 1}
        )
        Task.objects.get_or_create(
            project=subfolder_media,
            department=dept_creative,
            name='Thiết kế Banner và Poster sự kiện Launching',
            defaults={'status': 'Đang làm', 'pic': pic, 'order_index': 1}
        )
        Task.objects.get_or_create(
            department=dept_creative,
            project=None,
            name='Bàn giao toàn bộ template slide thuyết trình',
            defaults={'status': 'Hoàn thành', 'is_completed': True, 'pic': pic, 'order_index': 1}
        )

        self.stdout.write(self.style.SUCCESS("Da tao thanh cong du lieu mau phan cap day du!"))
