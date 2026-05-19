from django.contrib import admin
from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder


@admin.register(EMedicinePharmacy)
class EMedicinePharmacyAdmin(admin.ModelAdmin):
    list_display = ['name', 'admin_user', 'pharmacy_type', 'license_number', 'is_verified', 'is_available', 'rating', 'delivery_time_hours']
    list_filter = ['pharmacy_type', 'is_verified', 'is_available', 'district', 'admin_user', 'created_at']
    search_fields = ['name', 'license_number', 'phone_number', 'email', 'admin_user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('admin_user', 'name', 'pharmacy_type', 'license_number')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'email', 'address')
        }),
        ('Location', {
            'fields': ('district', 'upazila', 'latitude', 'longitude')
        }),
        ('Service Details', {
            'fields': ('delivery_time_hours', 'min_order_amount', 'delivery_charge')
        }),
        ('Status & Ratings', {
            'fields': ('is_available', 'is_verified', 'rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MedicineItem)
class MedicineItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'pharmacy', 'generic_name', 'manufacturer', 'medicine_type', 'price', 'stock', 'is_available']
    list_filter = ['pharmacy', 'medicine_type', 'is_available', 'manufacturer', 'created_at']
    search_fields = ['name', 'generic_name', 'manufacturer', 'pharmacy__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Medicine Information', {
            'fields': ('pharmacy', 'name', 'generic_name', 'manufacturer', 'medicine_type')
        }),
        ('Dosage & Pricing', {
            'fields': ('strength', 'strength_unit', 'price')
        }),
        ('Details', {
            'fields': ('description', 'side_effects', 'precautions')
        }),
        ('Availability', {
            'fields': ('is_available', 'stock')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EMedicineOrder)
class EMedicineOrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'patient_name', 'pharmacy', 'total_amount', 'status', 'payment_status', 'urgency', 'created_at']
    list_filter = ['status', 'payment_status', 'urgency', 'pharmacy', 'created_at']
    search_fields = ['order_id', 'patient_name', 'contact_phone']
    readonly_fields = ['order_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'pharmacy', 'status')
        }),
        ('Patient Details', {
            'fields': ('patient_name', 'contact_phone', 'delivery_address')
        }),
        ('Order Details', {
            'fields': ('medicines_list', 'delivered_medicines_list', 'total_amount', 'urgency', 'required_date')
        }),
        ('Payment', {
            'fields': ('payment_status', 'payment')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
