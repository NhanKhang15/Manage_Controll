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
        if not hasattr(obj, '_cached_top_projects'):
            obj._cached_top_projects = list(obj.projects.filter(parent__isnull=True).order_by('order_index'))
        return obj._cached_top_projects

    def _direct_tasks(self, obj):
        # select_related/prefetch_related ngay tại đây: gộp pic/department/assignees/
        # checklist của cả lô task vào chung 1-2 query, tránh N+1 khi TaskTreeSerializer
        # đọc từng quan hệ đó cho từng task một.
        if not hasattr(obj, '_cached_direct_tasks'):
            obj._cached_direct_tasks = list(
                obj.tasks.filter(project__isnull=True, parent__isnull=True)
                .select_related('pic', 'department')
                .prefetch_related(
                    'assignments__employee', 'checklist_items',
                    'children__pic', 'children__department',
                    'children__assignments__employee', 'children__checklist_items',
                )
                .order_by('order_index')
            )
        return obj._cached_direct_tasks

    def get_children(self, obj):
        """Phòng ban chứa: các Folder (Projects) và các Công việc trực tiếp thuộc phòng ban."""
        projects = self._top_projects(obj)
        tasks = self._direct_tasks(obj)
        return [
            *ProjectTreeSerializer(projects, many=True).data,
            *TaskTreeSerializer(tasks, many=True).data,
        ]

    def get_childCount(self, obj):
        projects = self._top_projects(obj)
        tasks = self._direct_tasks(obj)
        projects_count = len(projects)
        tasks_count = len(tasks)
        parts = []
        if projects_count > 0:
            parts.append(f"{projects_count} folder")
        if tasks_count > 0:
            parts.append(f"{tasks_count} công việc")
        return " · ".join(parts) if parts else None

    def get_progress_percent(self, obj):
        tasks = self._direct_tasks(obj)
        return progress_percent_of_tasks(tasks) if tasks else 0


class CompanyTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='company', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'type', 'name', 'drive_folder_id', 'drive_folder_url',
            'order_index', 'is_active', 'due_soon_days', 'childCount', 'children',
        ]

    def _sub_companies(self, obj):
        if not hasattr(obj, '_cached_sub_companies'):
            obj._cached_sub_companies = list(obj.children.filter(is_active=True).order_by('order_index'))
        return obj._cached_sub_companies

    def _departments(self, obj):
        if not hasattr(obj, '_cached_departments'):
            obj._cached_departments = list(obj.departments.all().order_by('order_index'))
        return obj._cached_departments

    def get_children(self, obj):
        """1 công ty chứa: các công ty con và các phòng ban."""
        sub_companies = self._sub_companies(obj)
        departments = self._departments(obj)
        return [
            *CompanyTreeSerializer(sub_companies, many=True).data,
            *DepartmentTreeSerializer(departments, many=True).data,
        ]

    def get_childCount(self, obj):
        sub_companies = self._sub_companies(obj)
        departments = self._departments(obj)
        sub_companies_count = len(sub_companies)
        departments_count = len(departments)
        parts = []
        if sub_companies_count > 0:
            parts.append(f"{sub_companies_count} công ty con")
        if departments_count > 0:
            parts.append(f"{departments_count} phòng ban")
        return " · ".join(parts) if parts else None

