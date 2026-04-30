from django.contrib import admin
from .models import BloodDonor, BloodRequest


@admin.register(BloodDonor)
class BloodDonorAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'blood_group', 'district', 'is_available', 'total_donations', 'last_donation_date', 'created_at']
    list_filter = ['blood_group', 'district', 'is_available', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Blood Donation Details', {
            'fields': ('blood_group', 'genotype', 'rhesus_factor', 'is_available')
        }),
        ('Location', {
            'fields': ('district', 'upazila')
        }),
        ('Donation History', {
            'fields': ('total_donations', 'last_donation_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
    get_name.short_description = 'Name'


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ['blood_group', 'patient_name', 'urgency', 'status', 'required_date', 'created_at']
    list_filter = ['blood_group', 'urgency', 'status', 'required_date', 'created_at']
    search_fields = ['patient_name', 'contact_phone', 'hospital__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('blood_group', 'urgency', 'quantity_units', 'status')
        }),
        ('Patient Details', {
            'fields': ('patient_name', 'contact_phone', 'age')
        }),
        ('Hospital', {
            'fields': ('hospital',)
        }),
        ('Dates', {
            'fields': ('required_date', 'expired_date')
        }),
        ('Notes', {
            'fields': ('medical_reason',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
