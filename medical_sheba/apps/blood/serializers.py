from rest_framework import serializers
from .models import BloodDonor, BloodRequest


class BloodDonorSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BloodDonor
        fields = [
            'id', 'user', 'user_name', 'blood_group', 'last_donation_date',
            'total_donations', 'is_available', 'district', 'upazila',
            'latitude', 'longitude', 'health_conditions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class BloodDonorListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BloodDonor
        fields = ['id', 'user_name', 'blood_group', 'district', 'is_available']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class BloodRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BloodRequest
        fields = [
            'id', 'requester', 'requester_name', 'patient_name', 'blood_group',
            'units_required', 'hospital', 'hospital_name', 'required_date',
            'urgency', 'district', 'contact_phone', 'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_requester_name(self, obj):
        return f"{obj.requester.first_name} {obj.requester.last_name}"
    
    def get_hospital_name(self, obj):
        return obj.hospital.name if obj.hospital else "Not specified"


class BloodRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodRequest
        fields = [
            'id', 'patient_name', 'blood_group', 'units_required',
            'urgency', 'district', 'status'
        ]
