# Migration to add hospital relationship to AmbulanceService

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ambulance', '0001_initial'),
        ('hospitals', '0003_add_hospital_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='ambulanceservice',
            name='hospital',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ambulances', to='hospitals.hospital'),
        ),
    ]
