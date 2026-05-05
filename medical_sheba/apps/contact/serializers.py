from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(
        source='assigned_to.get_full_name',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = ContactMessage
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'subject',
            'message',
            'status',
            'status_display',
            'created_at',
            'updated_at',
            'admin_notes',
            'assigned_to',
            'assigned_to_name',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'status',
            'admin_notes',
            'assigned_to',
        ]
