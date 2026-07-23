from rest_framework import serializers
from .models import Project
from tasks.serializers import TaskTreeSerializer


class ProjectTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='project', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'type', 'name', 'status', 'drive_folder_id', 'drive_folder_url', 'order_index', 'childCount', 'children']

    def get_children(self, obj):
        tasks = obj.tasks.all().order_by('order_index')
        return TaskTreeSerializer(tasks, many=True).data

    def get_childCount(self, obj):
        tasks_count = obj.tasks.count()
        if tasks_count > 0:
            return f"{tasks_count} công việc"
        return None
