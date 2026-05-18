from rest_framework import serializers
from .models import Appointment
from apps.doctors.serializers import DoctorListSerializer
from apps.hospitals.serializers import HospitalListSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorListSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True, required=True)
    hospital = HospitalListSerializer(read_only=True)
    hospital_id = serializers.IntegerField(write_only=True, required=False)
    patient_id = serializers.IntegerField(write_only=True, required=False)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_no', 'patient', 'patient_id', 'patient_name', 'doctor', 'doctor_id', 'doctor_name',
            'hospital', 'hospital_id', 'appointment_date', 'appointment_time', 'type', 'status',
            'symptoms', 'notes', 'prescription_url', 'fee_amount', 'payment_status',
            'payment', 'reminder_sent', 'cancelled_by', 'cancel_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'appointment_no', 'patient', 'created_at', 'updated_at', 'doctor', 'hospital', 
            'status', 'payment', 'reminder_sent', 'cancelled_by', 'cancel_reason'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}"
    
    def validate_doctor_id(self, value):
        """Validate that doctor exists"""
        from apps.doctors.models import Doctor
        try:
            Doctor.objects.get(id=value)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError("Doctor with this ID does not exist.")
        return value
    
    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id', None)
        hospital_id = validated_data.pop('hospital_id', None)
        patient_id = validated_data.pop('patient_id', None)
        
        # Set doctor
        if doctor_id:
            from apps.doctors.models import Doctor
            try:
                doctor = Doctor.objects.get(id=doctor_id)
                validated_data['doctor'] = doctor
                # Auto-assign hospital from doctor if not provided
                if not hospital_id and doctor.hospital:
                    validated_data['hospital'] = doctor.hospital
            except Doctor.DoesNotExist:
                raise serializers.ValidationError({'doctor_id': 'Doctor not found'})
        else:
            raise serializers.ValidationError({'doctor_id': 'Doctor ID is required'})
        
        # Set hospital if provided
        if hospital_id:
            from apps.hospitals.models import Hospital
            try:
                hospital = Hospital.objects.get(id=hospital_id)
                validated_data['hospital'] = hospital
            except Hospital.DoesNotExist:
                raise serializers.ValidationError({'hospital_id': 'Hospital not found'})
        
        # Set patient (should be set by view, but handle if provided)
        if patient_id and 'patient' not in validated_data:
            from apps.users.models import User
            try:
                patient = User.objects.get(id=patient_id)
                validated_data['patient'] = patient
            except User.DoesNotExist:
                raise serializers.ValidationError({'patient_id': 'Patient not found'})
        
        return super().create(validated_data)


class AppointmentListSerializer(serializers.ModelSerializer):
    doctor = DoctorListSerializer(read_only=True)
    hospital = HospitalListSerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_no', 'appointment_date', 'appointment_time',
            'type', 'status', 'fee_amount', 'payment_status', 'doctor', 'hospital',
            'patient_name', 'doctor_name', 'created_at'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}"
