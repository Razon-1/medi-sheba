from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'get_user', 'amount', 'gateway', 'payment_type', 'status', 'created_at']
    list_filter = ['gateway', 'payment_type', 'status', 'created_at']
    search_fields = ['transaction_id', 'user__email', 'user__first_name']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('transaction_id', 'user', 'amount', 'currency')
        }),
        ('Gateway Details', {
            'fields': ('gateway', 'payment_type', 'description')
        }),
        ('Status', {
            'fields': ('status', 'gateway_response')
        }),
        ('Refund Information', {
            'fields': ('refund_amount', 'refund_reason', 'refund_status'),
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
