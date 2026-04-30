from rest_framework import serializers
from .models import Appointment
from apps.doctors.serializers import DoctorListSerializer
from apps.hospitals.serializers import HospitalListSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorListSerializer(read_only=True)
    hospital = HospitalListSerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_no', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'hospital', 'appointment_date', 'appointment_time', 'type', 'status',
            'symptoms', 'notes', 'prescription_url', 'fee_amount', 'payment_status',
            'payment', 'reminder_sent', 'cancelled_by', 'cancel_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'appointment_no', 'created_at', 'updated_at'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}"


class AppointmentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_no', 'appointment_date', 'appointment_time',
            'type', 'status', 'fee_amount', 'payment_status'
        ]
