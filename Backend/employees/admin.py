from django.contrib import admin
from .models import Employee, EmployeeCompany, EmployeeDepartment


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'position_title', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('full_name', 'email', 'phone', 'position_title')


@admin.register(EmployeeCompany)
class EmployeeCompanyAdmin(admin.ModelAdmin):
    list_display = ('employee', 'company', 'role_in_company', 'joined_at', 'left_at')
    list_filter = ('company', 'role_in_company')
    search_fields = ('employee__full_name', 'company__name')


@admin.register(EmployeeDepartment)
class EmployeeDepartmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'department', 'is_primary', 'joined_at', 'left_at')
    list_filter = ('department', 'is_primary')
    search_fields = ('employee__full_name', 'department__name')
