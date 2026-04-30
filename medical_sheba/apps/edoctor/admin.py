from django.contrib import admin
from .models import EDoctorProfile, ConsultationSlot, EDoctorConsultation


@admin.register(EDoctorProfile)
class EDoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'consultation_fee', 'is_verified', 'rating', 'is_available']
    list_filter = ['is_verified', 'is_available', 'specialization', 'created_at']
    search_fields = ['name', 'registration_number', 'hospital_name', 'email']
    readonly_fields = ['doctor_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('doctor_id', 'name', 'specialization', 'qualification', 'experience_years', 'registration_number')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number', 'hospital_name', 'consultation_address')
        }),
        ('Consultation Details', {
            'fields': ('consultation_fee', 'consultation_duration_minutes', 'languages_spoken')
        }),
        ('Availability', {
            'fields': ('available_days', 'available_start_time', 'available_end_time', 'is_available')
        }),
        ('Verification & Rating', {
            'fields': ('is_verified', 'rating', 'review_count')
        }),
        ('Professional Information', {
            'fields': ('bio', 'specialties')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConsultationSlot)
class ConsultationSlotAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'start_time', 'end_time', 'status', 'is_available']
    list_filter = ['status', 'is_available', 'start_time', 'created_at']
    search_fields = ['doctor__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Slot Information', {
            'fields': ('doctor', 'start_time', 'end_time', 'status')
        }),
        ('Availability', {
            'fields': ('is_available',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EDoctorConsultation)
class EDoctorConsultationAdmin(admin.ModelAdmin):
    list_display = ['consultation_id', 'patient_name', 'doctor', 'scheduled_date', 'status', 'fee_amount', 'is_paid']
    list_filter = ['status', 'urgency', 'is_paid', 'scheduled_date', 'created_at']
    search_fields = ['consultation_id', 'patient_name', 'patient_email', 'doctor__name']
    readonly_fields = ['consultation_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Consultation Information', {
            'fields': ('consultation_id', 'doctor', 'slot', 'status')
        }),
        ('Patient Information', {
            'fields': ('patient_name', 'patient_email', 'patient_phone', 'patient_age')
        }),
        ('Medical Information', {
            'fields': ('chief_complaint', 'medical_history', 'consultation_notes', 'prescription')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'scheduled_time', 'urgency')
        }),
        ('Payment', {
            'fields': ('fee_amount', 'is_paid')
        }),
        ('Video Call', {
            'fields': ('video_call_link', 'meeting_password'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
