# Migration to add hospital relationship to EDoctorProfile

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('edoctor', '0001_initial'),
        ('hospitals', '0003_add_hospital_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='edoctorprofile',
            name='hospital',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='edoctors', to='hospitals.hospital'),
        ),
    ]
