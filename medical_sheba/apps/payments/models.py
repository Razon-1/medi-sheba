from django.db import models
from django.core.validators import MinValueValidator
from apps.users.models import User


class Payment(models.Model):
    GATEWAY_CHOICES = [
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('rocket', 'Rocket'),
        ('sslcommerz', 'SSLCommerz'),
        ('card', 'Card'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('subscription', 'Subscription'),
        ('donation', 'Donation'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.AutoField(primary_key=True)
    transaction_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default='BDT')
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    reference_id = models.IntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    gateway_response = models.JSONField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    refund_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount} BDT ({self.status})"
