from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Hospital(models.Model):
    TYPE_CHOICES = [
        ('government', 'Government'),
        ('private', 'Private'),
        ('clinic', 'Clinic'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    address = models.TextField()
    district = models.CharField(max_length=100, db_index=True)
    upazila = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    phone_primary = models.CharField(max_length=20)
    phone_secondary = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    emergency_available = models.BooleanField(default=False)
    beds_total = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    beds_available = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    image_url = models.CharField(max_length=500, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hospitals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['district']),
            models.Index(fields=['type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.type})"
