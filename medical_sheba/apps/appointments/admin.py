from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['appointment_no', 'get_patient', 'get_doctor', 'appointment_date', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'type', 'payment_status', 'appointment_date', 'created_at']
    search_fields = ['appointment_no', 'patient__email', 'doctor__user__first_name']
    readonly_fields = ['appointment_no', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('appointment_no', 'patient', 'doctor', 'hospital')
        }),
        ('Scheduling', {
            'fields': ('appointment_date', 'appointment_time', 'type')
        }),
        ('Status & Payment', {
            'fields': ('status', 'payment_status', 'payment', 'payment_method')
        }),
        ('Cancellation Info', {
            'fields': ('cancelled_by', 'cancel_reason', 'cancel_date'),
            'classes': ('collapse',)
        }),
        ('Additional Notes', {
            'fields': ('consultation_notes', 'diagnosis', 'prescription')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_patient(self, obj):
        return obj.patient.get_full_name() or obj.patient.email
    get_patient.short_description = 'Patient'
    
    def get_doctor(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.email
    get_doctor.short_description = 'Doctor'
