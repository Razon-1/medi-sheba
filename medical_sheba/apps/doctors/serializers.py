from rest_framework import serializers
from .models import Doctor
from apps.users.serializers import UserSerializer


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'user_id', 'hospital', 'bmdc_number', 'specialty',
            'subspecialty', 'qualifications', 'experience_years', 'consultation_fee',
            'follow_up_fee', 'chamber_address', 'available_days', 'available_time_start',
            'available_time_end', 'bio', 'languages', 'rating', 'review_count',
            'is_verified', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'review_count', 'created_at', 'updated_at']


class DoctorListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user_name', 'specialty', 'hospital_name', 'consultation_fee',
            'rating', 'is_available'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_hospital_name(self, obj):
        return obj.hospital.name if obj.hospital else "Private Practice"
