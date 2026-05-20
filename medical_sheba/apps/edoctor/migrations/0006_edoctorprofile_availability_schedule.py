from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edoctor', '0005_edoctorconsultation_payment_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='edoctorprofile',
            name='availability_schedule',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
