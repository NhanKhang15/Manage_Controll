from rest_framework import serializers
from .models import Company, Department
from projects.serializers import ProjectTreeSerializer


class CompanyTreeSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='company', read_only=True)
    childCount = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'type', 'name', 'drive_folder_id', 'drive_folder_url', 'order_index', 'is_active', 'childCount', 'children']

    def get_children(self, obj):
        """1 công ty có thể vừa có công ty con vừa có dự án riêng cùng lúc — trước
        đây chỉ trả 1 trong 2 (ưu tiên công ty con), làm ẩn mất dự án riêng của
        công ty cha bất cứ khi nào nó có công ty con."""
        sub_companies = obj.children.filter(is_active=True).order_by('order_index')
        projects = obj.projects.all().order_by('order_index')
        return [
            *CompanyTreeSerializer(sub_companies, many=True).data,
            *ProjectTreeSerializer(projects, many=True).data,
        ]

    def get_childCount(self, obj):
        sub_companies_count = obj.children.filter(is_active=True).count()
        projects_count = obj.projects.count()
        parts = []
        if sub_companies_count > 0:
            parts.append(f"{sub_companies_count} công ty con")
        if projects_count > 0:
            parts.append(f"{projects_count} dự án")
        return " · ".join(parts) if parts else None
