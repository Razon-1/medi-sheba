from rest_framework import serializers
from .models import Hospital


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'type', 'address', 'district', 'upazila',
            'latitude', 'longitude', 'phone_primary', 'phone_secondary',
            'email', 'website', 'emergency_available', 'beds_total',
            'beds_available', 'rating', 'review_count', 'image_url',
            'is_verified', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'review_count', 'created_at', 'updated_at']


class HospitalListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing"""
    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'type', 'district', 'phone_primary',
            'emergency_available', 'rating', 'is_active'
        ]
