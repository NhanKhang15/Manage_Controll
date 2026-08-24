from rest_framework import serializers
from .models import Project
from tasks.serializers import TaskTreeSerializer, progress_percent_of_tasks


class ProjectTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='project', read_only=True)
    department_id = serializers.CharField(source='department.id', read_only=True, allow_null=True)
    company_id = serializers.CharField(source='company.id', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'type', 'name', 'status', 'company_id', 'department_id',
            'drive_folder_id', 'drive_folder_url', 'order_index',
            'childCount', 'children', 'progress_percent',
        ]

    def _sub_folders(self, obj):
        if not hasattr(obj, '_cached_sub_folders'):
            obj._cached_sub_folders = list(obj.children.all().order_by('order_index'))
        return obj._cached_sub_folders

    def _top_tasks(self, obj):
        if not hasattr(obj, '_cached_top_tasks'):
            obj._cached_top_tasks = list(obj.tasks.filter(parent__isnull=True).order_by('order_index'))
        return obj._cached_top_tasks

    def get_children(self, obj):
        sub_folders = self._sub_folders(obj)
        tasks = self._top_tasks(obj)
        return [
            *ProjectTreeSerializer(sub_folders, many=True).data,
            *TaskTreeSerializer(tasks, many=True).data,
        ]

    def get_childCount(self, obj):
        sub_folders = self._sub_folders(obj)
        tasks = self._top_tasks(obj)
        folders_count = len(sub_folders)
        tasks_count = len(tasks)
        parts = []
        if folders_count > 0:
            parts.append(f"{folders_count} folder con")
        if tasks_count > 0:
            parts.append(f"{tasks_count} công việc")
        return " · ".join(parts) if parts else None

    def get_progress_percent(self, obj):
        return progress_percent_of_tasks(self._top_tasks(obj))

