from django.db import models


class District(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        db_table = 'districts'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Upazila(models.Model):
    name = models.CharField(max_length=100)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='upazilas')
    code = models.CharField(max_length=10)
    
    class Meta:
        db_table = 'upazilas'
        ordering = ['district', 'name']
        unique_together = ['district', 'code']
    
    def __str__(self):
        return f"{self.name}, {self.district.name}"
