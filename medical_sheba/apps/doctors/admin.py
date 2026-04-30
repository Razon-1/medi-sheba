from django.contrib import admin
from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'specialty', 'get_hospital', 'is_verified', 'is_available', 'rating', 'created_at']
    list_filter = ['specialty', 'is_verified', 'is_available', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'specialty', 'bmdc_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'hospital')
        }),
        ('Professional Details', {
            'fields': ('specialty', 'subspecialty', 'qualifications', 'experience_years', 'bmdc_number')
        }),
        ('Consultation', {
            'fields': ('consultation_fee', 'follow_up_fee')
        }),
        ('Availability & Status', {
            'fields': ('is_verified', 'is_available', 'available_days', 'available_time_start', 'available_time_end')
        }),
        ('Additional Info', {
            'fields': ('bio', 'languages', 'chamber_address', 'rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
    get_name.short_description = 'Name'
    
    def get_hospital(self, obj):
        return obj.hospital.name if obj.hospital else 'N/A'
    get_hospital.short_description = 'Hospital'
