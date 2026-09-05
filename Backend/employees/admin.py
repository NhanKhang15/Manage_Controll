from django.contrib import admin
from .models import Employee, EmployeeCompany, EmployeeDepartment, EmployeeReaction, PointsFormulaConfig, LevelTier


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'position_title', 'manager', 'is_active', 'is_approved')
    list_filter = ('is_active', 'is_approved')
    search_fields = ('full_name', 'email', 'phone', 'position_title')
    autocomplete_fields = ('manager',)


@admin.register(EmployeeReaction)
class EmployeeReactionAdmin(admin.ModelAdmin):
    list_display = ('from_employee', 'reaction', 'to_employee', 'created_at')
    list_filter = ('reaction',)
    search_fields = ('from_employee__full_name', 'to_employee__full_name')


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


@admin.register(PointsFormulaConfig)
class PointsFormulaConfigAdmin(admin.ModelAdmin):
    list_display = ('company', 'points_per_effort_unit', 'on_time_bonus', 'auto_apply_salary')


@admin.register(LevelTier)
class LevelTierAdmin(admin.ModelAdmin):
    list_display = ('company', 'level', 'name', 'min_points', 'base_salary', 'allowance')
    list_filter = ('company',)
    ordering = ('company', 'level')
