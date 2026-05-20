from rest_framework import serializers
from .models import AmbulanceService, AmbulanceRequest


class AmbulanceServiceListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True, allow_null=True, required=False)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True, allow_null=True, required=False)
    admin_user_name = serializers.CharField(source='admin_user.get_full_name', read_only=True, allow_null=True, required=False)
    
    class Meta:
        model = AmbulanceService
        fields = [
            'id', 'name', 'vehicle_type', 'driver_name', 'phone_number',
            'district', 'district_name', 'upazila', 'upazila_name', 'address',
            'cost_per_km', 'is_available', 'is_verified', 'rating', 'review_count',
            'image_url', 'requires_authentication', 'hospital', 'admin_user', 'admin_user_name'
        ]
        read_only_fields = ['admin_user', 'hospital']


class AmbulanceServiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ambulance services with optional district"""
    district_name = serializers.CharField(source='district.name', read_only=True, allow_null=True, required=False)
    upazila_name = serializers.CharField(source='upazila.name', read_only=True, allow_null=True, required=False)
    admin_user_name = serializers.CharField(source='admin_user.get_full_name', read_only=True, allow_null=True, required=False)

    class Meta:
        model = AmbulanceService
        fields = [
            'id', 'name', 'vehicle_type', 'driver_name', 'phone_number', 'email',
            'district', 'upazila', 'address', 'latitude', 'longitude',
            'district_name', 'upazila_name', 'cost_per_km', 'hospital', 'admin_user',
            'admin_user_name', 'is_available', 'is_verified', 'rating', 'review_count',
            'image_url', 'requires_authentication'
        ]
        read_only_fields = ['id', 'admin_user', 'admin_user_name', 'hospital', 'rating', 'review_count', 'is_verified']
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
            'rating', 'review_count', 'hospital', 'admin_user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['admin_user', 'hospital', 'created_at', 'updated_at']


class AmbulanceRequestListSerializer(serializers.ModelSerializer):
    ambulance_name = serializers.CharField(source='ambulance.name', read_only=True, allow_null=True)
    ambulance_phone = serializers.CharField(source='ambulance.phone_number', read_only=True, allow_null=True)
    
    class Meta:
        model = AmbulanceRequest
        fields = [
            'id', 'request_id', 'patient_name', 'contact_phone',
            'pickup_location', 'dropoff_location', 'vehicle_type_required',
            'urgency', 'status', 'required_date', 'ambulance',
            'ambulance_name', 'ambulance_phone', 'estimated_fare',
            'final_fare', 'distance_km', 'payment_status', 'created_at'
        ]


class AmbulanceRequestDetailSerializer(serializers.ModelSerializer):
    ambulance_name = serializers.CharField(source='ambulance.name', read_only=True, allow_null=True)
    ambulance_phone = serializers.CharField(source='ambulance.phone_number', read_only=True, allow_null=True)
    ambulance_type = serializers.CharField(source='ambulance.vehicle_type', read_only=True, allow_null=True)
    
    class Meta:
        model = AmbulanceRequest
        fields = [
            'id', 'request_id', 'patient_name', 'contact_phone',
            'pickup_location', 'pickup_address', 'dropoff_location',
            'vehicle_type_required', 'urgency', 'notes', 'status',
            'required_date', 'ambulance', 'ambulance_name', 'ambulance_phone',
            'ambulance_type', 'estimated_fare', 'final_fare', 'payment_status',
            'distance_km', 'payment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['request_id', 'created_at', 'updated_at']


class AmbulanceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmbulanceRequest
        fields = [
            'id', 'request_id', 'patient_name', 'contact_phone', 'pickup_location',
            'pickup_address', 'dropoff_location', 'vehicle_type_required', 'urgency',
            'required_date', 'notes', 'ambulance', 'estimated_fare', 'payment_status'
        ]
        read_only_fields = ['id', 'request_id', 'estimated_fare', 'payment_status']
        extra_kwargs = {
            'ambulance': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        ambulance = attrs.get('ambulance')
        if ambulance:
            if not ambulance.is_available:
                raise serializers.ValidationError({'ambulance': 'Selected ambulance is not available.'})
            attrs['vehicle_type_required'] = ambulance.vehicle_type
        return attrs
