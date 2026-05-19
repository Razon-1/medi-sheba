from django.contrib import admin
from .models import AmbulanceService, AmbulanceRequest


@admin.register(AmbulanceService)
class AmbulanceServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'admin_user', 'vehicle_type', 'driver_name', 'phone_number', 'district', 'is_available', 'is_verified']
    list_filter = ['vehicle_type', 'district', 'admin_user', 'is_available', 'is_verified']
    search_fields = ['name', 'driver_name', 'phone_number', 'admin_user__email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('admin_user', 'hospital', 'name', 'vehicle_type', 'driver_name', 'phone_number', 'email')
        }),
        ('Location', {
            'fields': ('district', 'upazila', 'latitude', 'longitude', 'address')
        }),
        ('Service Details', {
            'fields': ('cost_per_km', 'is_available', 'is_verified', 'requires_authentication', 'image_url')
        }),
        ('Ratings', {
            'fields': ('rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AmbulanceRequest)
class AmbulanceRequestAdmin(admin.ModelAdmin):
    list_display = ['request_id', 'patient_name', 'user', 'ambulance', 'status', 'payment_status', 'pickup_location', 'required_date']
    list_filter = ['status', 'payment_status', 'vehicle_type_required', 'urgency', 'required_date']
    search_fields = ['patient_name', 'contact_phone']
    readonly_fields = ['request_id', 'created_at', 'updated_at']
    fieldsets = (
        ('Request Information', {
            'fields': ('request_id', 'user', 'patient_name', 'contact_phone')
        }),
        ('Location', {
            'fields': ('pickup_location', 'pickup_address', 'dropoff_location')
        }),
        ('Service Details', {
            'fields': ('vehicle_type_required', 'urgency', 'required_date', 'notes')
        }),
        ('Assignment', {
            'fields': ('ambulance', 'status')
        }),
        ('Payment', {
            'fields': ('estimated_fare', 'final_fare', 'distance_km', 'payment_status', 'payment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
