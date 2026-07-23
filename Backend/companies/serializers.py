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
        sub_companies = obj.children.filter(is_active=True).order_by('order_index')
        if sub_companies.exists():
            return CompanyTreeSerializer(sub_companies, many=True).data
        projects = obj.projects.all().order_by('order_index')
        return ProjectTreeSerializer(projects, many=True).data

    def get_childCount(self, obj):
        sub_companies_count = obj.children.filter(is_active=True).count()
        if sub_companies_count > 0:
            return f"{sub_companies_count} công ty con"
        projects_count = obj.projects.count()
        if projects_count > 0:
            return f"{projects_count} dự án"
        return None
