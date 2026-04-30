from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.appointments.models import Appointment


class Review(models.Model):
    TARGET_CHOICES = [
        ('doctor', 'Doctor'),
        ('hospital', 'Hospital'),
    ]
    
    id = models.AutoField(primary_key=True)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    target_type = models.CharField(max_length=20, choices=TARGET_CHOICES)
    target_id = models.IntegerField()
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(null=True, blank=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['reviewer']),
            models.Index(fields=['is_visible']),
        ]
        unique_together = ['reviewer', 'target_type', 'target_id']
    
    def __str__(self):
        return f"{self.reviewer.get_full_name()} reviewed {self.target_type}#{self.target_id} - {self.rating}★"
