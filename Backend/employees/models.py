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
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    position_title = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
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

    class Meta:
        db_table = 'employee_companies'
        verbose_name_plural = 'Employee Companies'
        unique_together = ('employee', 'company')

    def __str__(self):
        return f"{self.employee.full_name} - {self.company.name}"


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
