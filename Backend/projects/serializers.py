from rest_framework import serializers
from .models import Project
from tasks.serializers import TaskTreeSerializer, progress_percent_of_tasks


class ProjectTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='project', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'type', 'name', 'status', 'drive_folder_id', 'drive_folder_url',
            'order_index', 'childCount', 'children', 'progress_percent',
        ]

    def _top_tasks(self, obj):
        return list(obj.tasks.filter(parent__isnull=True).order_by('order_index'))

    def get_children(self, obj):
        return TaskTreeSerializer(self._top_tasks(obj), many=True).data

    def get_childCount(self, obj):
        tasks_count = obj.tasks.filter(parent__isnull=True).count()
        if tasks_count > 0:
            return f"{tasks_count} công việc"
        return None

    def get_progress_percent(self, obj):
        return progress_percent_of_tasks(self._top_tasks(obj))
