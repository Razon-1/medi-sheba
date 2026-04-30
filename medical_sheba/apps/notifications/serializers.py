from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'body', 'related_type',
            'related_id', 'is_read', 'sent_at', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sent_at', 'created_at', 'updated_at']


class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'is_read', 'created_at']
