from rest_framework import serializers
from .models import AmbulanceService, AmbulanceRequest


class AmbulanceServiceListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True, allow_null=True, required=False)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True, allow_null=True, required=False)
    
    class Meta:
        model = AmbulanceService
        fields = [
            'id', 'name', 'vehicle_type', 'driver_name', 'phone_number',
            'district', 'district_name', 'upazila', 'upazila_name', 'address',
            'cost_per_km', 'is_available', 'rating', 'review_count'
        ]


class AmbulanceServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ambulance services with optional district"""
    class Meta:
        model = AmbulanceService
        fields = [
            'name', 'vehicle_type', 'driver_name', 'phone_number', 'email',
            'district', 'upazila', 'address', 'latitude', 'longitude',
            'cost_per_km', 'hospital', 'is_verified', 'image_url', 'requires_authentication'
        ]
        extra_kwargs = {
            'district': {'required': False, 'allow_null': True},
            'upazila': {'required': False, 'allow_null': True},
            'email': {'required': False, 'allow_null': True},
            'address': {'required': False, 'allow_null': True},
            'latitude': {'required': False, 'allow_null': True},
            'longitude': {'required': False, 'allow_null': True},
        }


class AmbulanceServiceDetailSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True, allow_null=True, required=False)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True, allow_null=True, required=False)
    
    class Meta:
        model = AmbulanceService
        fields = [
            'id', 'name', 'vehicle_type', 'driver_name', 'phone_number', 'email',
            'district', 'district_name', 'upazila', 'upazila_name', 'address',
            'latitude', 'longitude', 'cost_per_km', 'is_available', 'is_verified',
            'rating', 'review_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AmbulanceRequestListSerializer(serializers.ModelSerializer):
    ambulance_name = serializers.CharField(source='ambulance.name', read_only=True)
    ambulance_phone = serializers.CharField(source='ambulance.phone_number', read_only=True)
    
    class Meta:
        model = AmbulanceRequest
        fields = [
            'id', 'request_id', 'patient_name', 'contact_phone',
            'pickup_location', 'dropoff_location', 'vehicle_type_required',
            'urgency', 'status', 'required_date', 'ambulance',
            'ambulance_name', 'ambulance_phone', 'created_at'
        ]


class AmbulanceRequestDetailSerializer(serializers.ModelSerializer):
    ambulance_name = serializers.CharField(source='ambulance.name', read_only=True)
    ambulance_phone = serializers.CharField(source='ambulance.phone_number', read_only=True)
    ambulance_type = serializers.CharField(source='ambulance.vehicle_type', read_only=True)
    
    class Meta:
        model = AmbulanceRequest
        fields = [
            'id', 'request_id', 'patient_name', 'contact_phone',
            'pickup_location', 'pickup_address', 'dropoff_location',
            'vehicle_type_required', 'urgency', 'notes', 'status',
            'required_date', 'ambulance', 'ambulance_name', 'ambulance_phone',
            'ambulance_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['request_id', 'created_at', 'updated_at']


class AmbulanceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmbulanceRequest
        fields = [
            'patient_name', 'contact_phone', 'pickup_location', 'pickup_address',
            'dropoff_location', 'vehicle_type_required', 'urgency', 'required_date', 'notes'
        ]
