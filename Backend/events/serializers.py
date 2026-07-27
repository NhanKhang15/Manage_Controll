from rest_framework import serializers
from events.models import Event, Driver, EventAttachment, Notification


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['id', 'company', 'full_name', 'phone', 'is_active']


class EventAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttachment
        fields = ['id', 'file_url', 'file_name']


class EventSerializer(serializers.ModelSerializer):
    attachments = EventAttachmentSerializer(many=True, read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    creator_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'company', 'type', 'title', 'content', 'event_date',
            'start_time', 'end_time', 'location', 'online_meeting_link',
            'created_by', 'creator_name', 'need_pickup_car', 'driver',
            'driver_name', 'has_gift', 'gift_note', 'invite_all_company',
            'attachments', 'created_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    triggered_by_name = serializers.CharField(source='triggered_by.full_name', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'company', 'recipient', 'type', 'icon_key', 'title',
            'body', 'link_url', 'related_table', 'related_id', 'is_read',
            'read_at', 'triggered_by', 'triggered_by_name', 'created_at'
        ]
