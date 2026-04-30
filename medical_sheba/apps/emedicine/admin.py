from django.contrib import admin
from .models import EMedicinePharmacy, MedicineItem, EMedicineOrder


@admin.register(EMedicinePharmacy)
class EMedicinePharmacyAdmin(admin.ModelAdmin):
    list_display = ['name', 'pharmacy_type', 'license_number', 'is_verified', 'is_available', 'rating', 'delivery_time_hours']
    list_filter = ['pharmacy_type', 'is_verified', 'is_available', 'district', 'created_at']
    search_fields = ['name', 'license_number', 'phone_number', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'pharmacy_type', 'license_number')
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
    list_display = ['name', 'generic_name', 'manufacturer', 'medicine_type', 'price', 'stock', 'is_available']
    list_filter = ['medicine_type', 'is_available', 'manufacturer', 'created_at']
    search_fields = ['name', 'generic_name', 'manufacturer']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Medicine Information', {
            'fields': ('name', 'generic_name', 'manufacturer', 'medicine_type')
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
    list_display = ['order_id', 'patient_name', 'pharmacy', 'total_amount', 'status', 'urgency', 'created_at']
    list_filter = ['status', 'urgency', 'pharmacy', 'created_at']
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
            'fields': ('medicines_list', 'total_amount', 'urgency', 'required_date')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
