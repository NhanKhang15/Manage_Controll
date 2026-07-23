from rest_framework import serializers
from .models import Task, TaskAssignment


class TaskTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='task', read_only=True)
    completed = serializers.BooleanField(source='is_completed')

    class Meta:
        model = Task
        fields = ['id', 'type', 'name', 'status', 'completed', 'due_date', 'order_index']


class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = ['id', 'task', 'employee', 'role', 'assigned_at', 'assigned_by']
