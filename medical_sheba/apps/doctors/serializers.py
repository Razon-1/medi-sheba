from rest_framework import serializers
from .models import Doctor, DoctorReview
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


class DoctorReviewSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DoctorReview
        fields = [
            'id', 'doctor', 'doctor_id', 'patient', 'patient_name', 'rating', 
            'title', 'review_text', 'is_verified_patient', 'helpful_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'patient', 'patient_name', 'helpful_count', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        validated_data['doctor_id'] = validated_data.pop('doctor_id')
        return super().create(validated_data)
