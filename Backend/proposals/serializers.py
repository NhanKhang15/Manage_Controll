from rest_framework import serializers
from .models import Proposal


class ProposalSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    decided_by_name = serializers.CharField(source='decided_by.full_name', read_only=True, default=None)

    class Meta:
        model = Proposal
        fields = [
            'id', 'title', 'amount', 'note', 'requester', 'requester_name',
            'status', 'decided_by', 'decided_by_name', 'decided_at', 'created_at',
        ]
        read_only_fields = ['id', 'requester', 'status', 'decided_by', 'decided_by_name', 'decided_at', 'created_at']
