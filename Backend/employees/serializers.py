from rest_framework import serializers
from employees.models import Employee, EmployeeCompany


class EmployeeSerializer(serializers.ModelSerializer):
    companies = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'full_name', 'email', 'phone', 'avatar_url',
            'position_title', 'is_active', 'companies',
        ]

    def get_companies(self, obj):
        links = EmployeeCompany.objects.filter(employee=obj).select_related('company')
        return [
            {
                'id': link.company_id,
                'name': link.company.name,
                'role_in_company': link.role_in_company,
                'can_approve_proposals': link.can_approve_proposals,
            }
            for link in links
        ]
