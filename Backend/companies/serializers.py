from rest_framework import serializers
from .models import Company, Department
from projects.serializers import ProjectTreeSerializer
from tasks.serializers import TaskTreeSerializer, progress_percent_of_tasks


class DepartmentTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='department', read_only=True)
    company_id = serializers.CharField(source='company.id', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'type', 'name', 'company_id', 'drive_folder_id', 'drive_folder_url',
            'order_index', 'childCount', 'children', 'progress_percent',
        ]

    def _top_projects(self, obj):
        return list(obj.projects.filter(parent__isnull=True).order_by('order_index'))

    def _direct_tasks(self, obj):
        return list(obj.tasks.filter(project__isnull=True, parent__isnull=True).order_by('order_index'))

    def get_children(self, obj):
        """Phòng ban chứa: các Folder (Projects) và các Công việc trực tiếp thuộc phòng ban."""
        projects = self._top_projects(obj)
        tasks = self._direct_tasks(obj)
        return [
            *ProjectTreeSerializer(projects, many=True).data,
            *TaskTreeSerializer(tasks, many=True).data,
        ]

    def get_childCount(self, obj):
        projects_count = obj.projects.filter(parent__isnull=True).count()
        tasks_count = obj.tasks.filter(project__isnull=True, parent__isnull=True).count()
        parts = []
        if projects_count > 0:
            parts.append(f"{projects_count} folder")
        if tasks_count > 0:
            parts.append(f"{tasks_count} công việc")
        return " · ".join(parts) if parts else None

    def get_progress_percent(self, obj):
        all_tasks = list(obj.tasks.filter(parent__isnull=True))
        return progress_percent_of_tasks(all_tasks) if all_tasks else 0


class CompanyTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='company', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'type', 'name', 'drive_folder_id', 'drive_folder_url',
            'order_index', 'is_active', 'childCount', 'children',
        ]

    def get_children(self, obj):
        """1 công ty chứa: các công ty con và các phòng ban."""
        sub_companies = obj.children.filter(is_active=True).order_by('order_index')
        departments = obj.departments.all().order_by('order_index')
        return [
            *CompanyTreeSerializer(sub_companies, many=True).data,
            *DepartmentTreeSerializer(departments, many=True).data,
        ]

    def get_childCount(self, obj):
        sub_companies_count = obj.children.filter(is_active=True).count()
        departments_count = obj.departments.count()
        parts = []
        if sub_companies_count > 0:
            parts.append(f"{sub_companies_count} công ty con")
        if departments_count > 0:
            parts.append(f"{departments_count} phòng ban")
        return " · ".join(parts) if parts else None
