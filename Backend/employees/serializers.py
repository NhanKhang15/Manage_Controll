from rest_framework import serializers
from employees.models import Employee, EmployeeCompany, EmployeeReaction
from employees.rating import compute_rating_stats


class EmployeeSerializer(serializers.ModelSerializer):
    companies = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    direct_reports_count = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'full_name', 'email', 'phone', 'avatar_url',
            'position_title', 'is_active', 'companies',
            'rating', 'points', 'level', 'direct_reports_count',
        ]

    def get_companies(self, obj):
        links = EmployeeCompany.objects.filter(employee=obj).select_related('company')
        return [
            {
                'id': link.company_id,
                'name': link.company.name,
                'role_in_company': link.role_in_company,
                'can_approve_proposals': link.can_approve_proposals,
                'due_soon_days': link.company.due_soon_days,
            }
            for link in links
        ]

    def _rating_stats(self, obj):
        if not hasattr(obj, '_rating_stats_cache'):
            likes = EmployeeReaction.objects.filter(to_employee=obj, reaction=EmployeeReaction.LIKE).count()
            dislikes = EmployeeReaction.objects.filter(to_employee=obj, reaction=EmployeeReaction.DISLIKE).count()
            obj._rating_stats_cache = compute_rating_stats(likes, dislikes)
        return obj._rating_stats_cache

    def get_rating(self, obj):
        return self._rating_stats(obj)[0]

    def get_points(self, obj):
        return self._rating_stats(obj)[1]

    def get_level(self, obj):
        return self._rating_stats(obj)[2]

    def get_direct_reports_count(self, obj):
        return obj.direct_reports.filter(is_active=True).count()
