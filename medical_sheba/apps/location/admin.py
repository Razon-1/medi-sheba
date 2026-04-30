from django.contrib import admin
from .models import District, Upazila


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'region']
    list_filter = ['region']
    search_fields = ['name', 'code']
    readonly_fields = []
    
    fieldsets = (
        ('District Information', {
            'fields': ('name', 'code', 'region')
        }),
    )


@admin.register(Upazila)
class UpazilaAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'code']
    list_filter = ['district']
    search_fields = ['name', 'code']
    readonly_fields = []
    
    fieldsets = (
        ('Upazila Information', {
            'fields': ('name', 'code', 'district')
        }),
    )
