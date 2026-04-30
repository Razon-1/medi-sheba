from django.contrib import admin
from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'district', 'is_verified', 'emergency_available', 'created_at']
    list_filter = ['type', 'district', 'is_verified', 'emergency_available', 'created_at']
    search_fields = ['name', 'address', 'phone_primary', 'phone_secondary']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'type', 'address')
        }),
        ('Contact Details', {
            'fields': ('phone_primary', 'phone_secondary', 'email', 'website')
        }),
        ('Location', {
            'fields': ('district', 'upazila', 'latitude', 'longitude')
        }),
        ('Services & Facilities', {
            'fields': ('emergency_available', 'beds_total', 'beds_available')
        }),
        ('Verification & Status', {
            'fields': ('is_verified', 'is_active', 'rating', 'review_count')
        }),
        ('Image', {
            'fields': ('image_url',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
