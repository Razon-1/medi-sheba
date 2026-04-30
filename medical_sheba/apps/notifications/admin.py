from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'get_user', 'type', 'is_read', 'status', 'created_at']
    list_filter = ['type', 'is_read', 'status', 'created_at']
    search_fields = ['title', 'body', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'type', 'title', 'body')
        }),
        ('Channels', {
            'fields': ('channels', 'is_read')
        }),
        ('Status & Delivery', {
            'fields': ('status', 'sent_at', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Related Object', {
            'fields': ('related_content_type', 'related_object_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_user(self, obj):
        return obj.user.get_full_name() or obj.user.email
    get_user.short_description = 'User'
