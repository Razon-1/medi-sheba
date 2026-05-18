from rest_framework import serializers
from .models import EDoctorProfile, ConsultationSlot, EDoctorConsultation


class EDoctorProfileWriteSerializer(serializers.ModelSerializer):
    """Doctor profile write serializer - for create/update operations"""
    class Meta:
        model = EDoctorProfile
        fields = [
            'id', 'name', 'specialization', 'qualification', 'experience_years',
            'registration_number', 'email', 'phone_number', 'hospital_name',
            'consultation_address', 'consultation_fee', 'consultation_duration_minutes',
            'languages_spoken', 'available_days', 'available_start_time', 'available_end_time',
            'is_available', 'is_verified', 'requires_authentication', 'bio', 'specialties', 'hospital', 'image_url'
        ]
        read_only_fields = ['id', 'doctor_id']


class EDoctorProfileListSerializer(serializers.ModelSerializer):
    """Doctor profile list view - minimal info"""
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    
    class Meta:
        model = EDoctorProfile
        fields = [
            'id', 'doctor_id', 'name', 'specialization', 'specialization_display',
            'qualification', 'experience_years', 'consultation_fee', 'is_verified',
            'rating', 'review_count', 'is_available', 'hospital_name', 'phone_number',
            'available_days', 'available_start_time', 'available_end_time', 'image_url'
        ]


class EDoctorProfileDetailSerializer(serializers.ModelSerializer):
    """Doctor profile detail view - full information"""
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    qualification_display = serializers.CharField(source='get_qualification_display', read_only=True)
    
    class Meta:
        model = EDoctorProfile
        fields = [
            'id', 'doctor_id', 'name', 'specialization', 'specialization_display',
            'qualification', 'qualification_display', 'experience_years',
            'registration_number', 'email', 'phone_number', 'hospital_name',
            'consultation_address', 'consultation_fee', 'consultation_duration_minutes',
            'languages_spoken', 'available_days', 'available_start_time', 'available_end_time',
            'is_available', 'is_verified', 'rating', 'review_count', 'bio',
            'specialties', 'created_at', 'updated_at'
        ]


class ConsultationSlotSerializer(serializers.ModelSerializer):
    """Consultation slot information"""
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    
    class Meta:
        model = ConsultationSlot
        fields = ['id', 'doctor', 'doctor_name', 'start_time', 'end_time', 'status', 'is_available']


class EDoctorConsultationListSerializer(serializers.ModelSerializer):
    """Consultation list view - summary info"""
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    class Meta:
        model = EDoctorConsultation
        fields = [
            'id', 'consultation_id', 'doctor', 'doctor_name', 'specialization',
            'patient_name', 'scheduled_date', 'scheduled_time', 'status',
            'urgency', 'fee_amount', 'is_paid', 'payment_status', 'created_at'
        ]


class EDoctorConsultationDetailSerializer(serializers.ModelSerializer):
    """Consultation detail view - full information"""
    doctor = EDoctorProfileDetailSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EDoctorConsultation
        fields = [
            'id', 'consultation_id', 'doctor', 'doctor_id', 'slot',
            'patient_name', 'patient_email', 'patient_phone', 'patient_age',
            'chief_complaint', 'medical_history', 'consultation_notes', 'prescription',
            'scheduled_date', 'scheduled_time', 'urgency', 'status',
            'fee_amount', 'is_paid', 'video_call_link', 'meeting_password',
            'created_at', 'updated_at'
        ]


class EDoctorConsultationCreateSerializer(serializers.ModelSerializer):
    """Consultation creation - input only"""
    
    class Meta:
        model = EDoctorConsultation
        fields = [
            'doctor', 'slot', 'patient_name', 'patient_email', 'patient_phone',
            'patient_age', 'chief_complaint', 'medical_history', 'scheduled_date',
            'scheduled_time', 'urgency'
        ]

    def create(self, validated_data):
        doctor = validated_data['doctor']
        validated_data['fee_amount'] = doctor.consultation_fee
        return super().create(validated_data)
