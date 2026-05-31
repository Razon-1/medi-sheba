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
            'availability_schedule',
            'is_available', 'is_verified', 'requires_authentication', 'bio', 'specialties', 'hospital', 'image_url'
        ]
        read_only_fields = ['id', 'doctor_id', 'is_verified']


class EDoctorProfileListSerializer(serializers.ModelSerializer):
    """Doctor profile list view - minimal info"""
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    hospital_display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = EDoctorProfile
        fields = [
            'id', 'doctor_id', 'name', 'specialization', 'specialization_display',
            'qualification', 'experience_years', 'consultation_fee', 'is_verified',
            'rating', 'review_count', 'is_available', 'hospital', 'hospital_name',
            'hospital_display_name', 'phone_number',
            'available_days', 'available_start_time', 'available_end_time',
            'availability_schedule', 'image_url'
        ]

    def get_hospital_display_name(self, obj):
        if obj.hospital:
            return obj.hospital.name
        return obj.hospital_name or 'Private Practice'


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
            'availability_schedule',
            'is_available', 'is_verified', 'rating', 'review_count', 'bio',
            'specialties', 'image_url', 'created_at', 'updated_at'
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
            'id', 'consultation_id', 'doctor', 'patient', 'doctor_name', 'specialization',
            'patient_name', 'scheduled_date', 'scheduled_time', 'status',
            'urgency', 'fee_amount', 'is_paid', 'payment_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['patient']


class EDoctorConsultationDetailSerializer(serializers.ModelSerializer):
    """Consultation detail view - full information"""
    doctor = EDoctorProfileDetailSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EDoctorConsultation
        fields = [
            'id', 'consultation_id', 'doctor', 'doctor_id', 'patient', 'slot',
            'patient_name', 'patient_email', 'patient_phone', 'patient_age',
            'chief_complaint', 'medical_history', 'consultation_notes', 'prescription',
            'scheduled_date', 'scheduled_time', 'urgency', 'status',
            'fee_amount', 'is_paid', 'video_call_link', 'meeting_password',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['patient']


class EDoctorConsultationCreateSerializer(serializers.ModelSerializer):
    """Consultation creation - input only"""
    
    class Meta:
        model = EDoctorConsultation
        fields = [
            'id', 'consultation_id', 'doctor', 'patient', 'slot', 'patient_name', 'patient_email', 'patient_phone',
            'patient_age', 'chief_complaint', 'medical_history', 'scheduled_date',
            'scheduled_time', 'urgency', 'status', 'fee_amount', 'is_paid', 'payment_status'
        ]
        read_only_fields = [
            'id', 'consultation_id', 'patient', 'status', 'fee_amount', 'is_paid', 'payment_status'
        ]

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        scheduled_date = attrs.get('scheduled_date')
        scheduled_time = attrs.get('scheduled_time')
        patient_email = (attrs.get('patient_email') or '').strip()
        patient_phone = (attrs.get('patient_phone') or '').strip()
        active_statuses = ['scheduled', 'confirmed', 'ongoing']

        # Direct API booking must also respect dashboard delete/unavailable state.
        if doctor and (doctor.is_deleted or not doctor.is_available):
            raise serializers.ValidationError({
                'doctor': 'This e-doctor is no longer available for consultation.'
            })

        if doctor and scheduled_date and scheduled_time:
            base_query = EDoctorConsultation.objects.filter(
                doctor=doctor,
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                status__in=active_statuses,
            )

            if patient_email:
                patient_duplicate_query = base_query.filter(patient_email__iexact=patient_email)
            elif patient_phone:
                patient_duplicate_query = base_query.filter(patient_phone=patient_phone)
            else:
                patient_duplicate_query = EDoctorConsultation.objects.none()

            if patient_duplicate_query.exists():
                raise serializers.ValidationError({
                    'scheduled_time': 'You already booked this doctor at this date and time.'
                })

            if base_query.exists():
                raise serializers.ValidationError({
                    'scheduled_time': 'Doctor already booked for consultation at this date and time.'
                })

        return attrs

    def create(self, validated_data):
        doctor = validated_data['doctor']
        validated_data['fee_amount'] = doctor.consultation_fee
        return super().create(validated_data)
