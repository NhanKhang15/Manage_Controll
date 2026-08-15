from rest_framework import serializers
from meetings.models import MeetingTranscript


class MeetingTranscriptSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = MeetingTranscript
        fields = [
            'id', 'company', 'event', 'title', 'transcript_text',
            'summary_text', 'summary_generated_at', 'char_count',
            'created_by', 'creator_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['char_count', 'summary_text', 'summary_generated_at']


class MeetingTranscriptListSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = MeetingTranscript
        fields = [
            'id', 'company', 'event', 'title',
            'summary_text', 'summary_generated_at', 'char_count',
            'created_by', 'creator_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['char_count', 'summary_text', 'summary_generated_at']
