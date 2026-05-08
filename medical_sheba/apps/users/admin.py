from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'date_of_birth', 'gender')}),
        ('Address', {'fields': ('address', 'district', 'upazila')}),
        ('Account Status', {'fields': ('roles', 'is_active', 'is_verified', 'is_staff', 'is_superuser')}),
        ('Additional Info', {'fields': ('blood_group', 'profile_image')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'last_login'), 'classes': ('collapse',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'roles', 'phone', 'first_name', 'last_name'),
        }),
    )
    
    list_display = ['email', 'first_name', 'last_name', 'get_roles', 'is_verified', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_verified', 'is_staff', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    def get_roles(self, obj):
        """Display roles as comma-separated list"""
        return ', '.join(obj.roles) if obj.roles else 'No roles'
    get_roles.short_description = 'Roles'
