from django.contrib import admin
from .models import Company, Department


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'order_index', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'drive_folder_id')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'created_at')
    list_filter = ('company',)
    search_fields = ('name', 'company__name')
