from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['get_target', 'rating', 'get_reviewer', 'is_visible', 'created_at']
    list_filter = ['target_type', 'rating', 'is_visible', 'created_at']
    search_fields = ['comment', 'reviewer__first_name', 'reviewer__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('reviewer', 'rating', 'comment')
        }),
        ('Target', {
            'fields': ('target_type', 'target_id')
        }),
        ('Related Appointment', {
            'fields': ('appointment',),
            'classes': ('collapse',)
        }),
        ('Visibility', {
            'fields': ('is_visible',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_target(self, obj):
        return f"{obj.get_target_type_display()} (ID: {obj.target_id})"
    get_target.short_description = 'Review Target'
    
    def get_reviewer(self, obj):
        return obj.reviewer.get_full_name() or obj.reviewer.email
    get_reviewer.short_description = 'Reviewer'
