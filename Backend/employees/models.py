import uuid
from datetime import date
from django.conf import settings
from django.db import models
from companies.models import Company, Department


class Employee(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='employee',
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    zalo = models.CharField(max_length=50, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    position_title = models.CharField(max_length=255, null=True, blank=True)
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='direct_reports',
        db_column='manager_id',
    )
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(
        default=True,
        help_text='Tài khoản tự đăng ký (xem employees.auth_views.register_view) tạo ra ở trạng thái '
                   'chưa duyệt (False) và không đăng nhập được cho tới khi người có quyền duyệt trong '
                   'trang Nhân sự → Chờ duyệt. Nhân viên tạo qua admin/seed mặc định coi như đã duyệt.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'

    def __str__(self):
        return self.full_name


class EmployeeCompany(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='employee_companies',
        db_column='employee_id'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='company_employees',
        db_column='company_id'
    )
    role_in_company = models.CharField(max_length=100, null=True, blank=True)
    can_approve_proposals = models.BooleanField(
        default=False, help_text='Được quyền Duyệt/Từ chối đề xuất chi phí trong công ty này'
    )
    joined_at = models.DateField(default=date.today, null=True, blank=True)
    left_at = models.DateField(null=True, blank=True)
    # Kết quả lần "Tính lại điểm & áp bậc lương" gần nhất (trang Cấp bậc) — chỉ
    # ghi khi PointsFormulaConfig.auto_apply_salary bật; điểm/level hiển thị ở
    # Xếp hạng/Bảng vàng luôn tính sống (live) từ Task, không phụ thuộc 3 cột này.
    current_level = models.IntegerField(null=True, blank=True)
    base_salary = models.IntegerField(null=True, blank=True)
    allowance = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'employee_companies'
        verbose_name_plural = 'Employee Companies'
        unique_together = ('employee', 'company')

    def __str__(self):
        return f"{self.employee.full_name} - {self.company.name}"


class PointsFormulaConfig(models.Model):
    """Công thức tính điểm dùng chung cho Xếp hạng/Bảng vàng/Cấp bậc (trang Cấp bậc
    → 'CEO cấu hình'). 1 công ty 1 công thức."""
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='points_formula')
    points_per_effort_unit = models.IntegerField(default=3, help_text='Điểm cho mỗi đơn vị độ khó (Task.effort_points)')
    on_time_bonus = models.IntegerField(default=5, help_text='Thưởng điểm mỗi việc hoàn thành đúng hạn')
    auto_apply_salary = models.BooleanField(default=True, help_text='Lên Level tự động áp lương cứng + phụ cấp của bậc mới')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'points_formula_configs'

    def __str__(self):
        return f"Công thức điểm - {self.company.name}"


class LevelTier(models.Model):
    """1 bậc trong thang cấp bậc của công ty (trang Cấp bậc, Panel 2)."""
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='level_tiers')
    level = models.IntegerField()
    name = models.CharField(max_length=100)
    min_points = models.IntegerField(default=0)
    base_salary = models.IntegerField(default=0)
    allowance = models.IntegerField(default=0)
    benefits = models.CharField(max_length=255, blank=True, default='')
    order_index = models.IntegerField(default=0)

    class Meta:
        db_table = 'level_tiers'
        unique_together = ('company', 'level')
        ordering = ['order_index', 'level']

    def __str__(self):
        return f"Lv{self.level} {self.name} - {self.company.name}"


class EmployeeReaction(models.Model):
    """Like/dislike thật giữa 2 nhân viên (trang Nhân sự) — mỗi cặp (from, to) chỉ giữ
    1 bản ghi, đổi loại hoặc xoá khi người dùng bấm lại (xem employees.views.react_to_employee).
    Rating/level/điểm hiển thị trên trang Nhân sự tính trực tiếp từ bảng này, không hardcode."""
    LIKE = 'like'
    DISLIKE = 'dislike'
    REACTION_CHOICES = [(LIKE, 'Like'), (DISLIKE, 'Dislike')]

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    from_employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='reactions_given', db_column='from_employee_id'
    )
    to_employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='reactions_received', db_column='to_employee_id'
    )
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_reactions'
        unique_together = ('from_employee', 'to_employee')

    def __str__(self):
        return f"{self.from_employee.full_name} {self.reaction} {self.to_employee.full_name}"


class EmployeeDepartment(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='employee_departments',
        db_column='employee_id'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='department_employees',
        db_column='department_id'
    )
    is_primary = models.BooleanField(default=False)
    joined_at = models.DateField(default=date.today, null=True, blank=True)
    left_at = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'employee_departments'
        verbose_name_plural = 'Employee Departments'
        unique_together = ('employee', 'department')

    def __str__(self):
        return f"{self.employee.full_name} - {self.department.name}"
