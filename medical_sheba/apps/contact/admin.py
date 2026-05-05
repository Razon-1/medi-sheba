from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Q
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'subject',
        'name',
        'email',
        'status_badge',
        'created_at',
        'assigned_to',
        'quick_actions'
    ]
    list_filter = ['status', 'created_at', 'assigned_to']
    search_fields = ['name', 'email', 'subject', 'message', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'message_preview']
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message Details', {
            'fields': ('subject', 'message_preview', 'message')
        }),
        ('Status & Management', {
            'fields': ('status', 'assigned_to', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['mark_as_new', 'mark_as_read', 'mark_as_responded', 'mark_as_archived']

    def status_badge(self, obj):
        """Display status as a colored badge"""
        colors = {
            'new': 'red',
            'read': 'orange',
            'responded': 'green',
            'archived': 'gray',
        }
        color = colors.get(obj.status, 'blue')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def message_preview(self, obj):
        """Show a preview of the message"""
        preview = obj.message[:200] + '...' if len(obj.message) > 200 else obj.message
        return format_html('<pre style="white-space: pre-wrap;">{}</pre>', preview)
    message_preview.short_description = 'Message Preview'

    def quick_actions(self, obj):
        """Quick action buttons"""
        status_text = ''
        if obj.status == 'new':
            status_text = '<span style="color: red; font-weight: bold;">NEW</span>'
        elif obj.status == 'read':
            status_text = '<span style="color: orange; font-weight: bold;">READ</span>'
        return format_html(status_text)
    quick_actions.short_description = 'Alert'

    @admin.action(description='Mark selected as New')
    def mark_as_new(self, request, queryset):
        count = queryset.update(status='new')
        self.message_user(request, f'{count} message(s) marked as new.')

    @admin.action(description='Mark selected as Read')
    def mark_as_read(self, request, queryset):
        count = queryset.update(status='read')
        self.message_user(request, f'{count} message(s) marked as read.')

    @admin.action(description='Mark selected as Responded')
    def mark_as_responded(self, request, queryset):
        count = queryset.update(status='responded', assigned_to=request.user)
        self.message_user(request, f'{count} message(s) marked as responded and assigned to you.')

    @admin.action(description='Mark selected as Archived')
    def mark_as_archived(self, request, queryset):
        count = queryset.update(status='archived')
        self.message_user(request, f'{count} message(s) archived.')

    def save_model(self, request, obj, form, change):
        if change and not obj.assigned_to and obj.status == 'responded':
            obj.assigned_to = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Filter messages based on user role"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Staff users can only see messages assigned to them or unassigned ones
        return qs.filter(Q(assigned_to=request.user) | Q(assigned_to__isnull=True))

    class Media:
        css = {
            'all': ('admin/css/contact_admin.css',)
        }
