from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edoctor', '0008_edoctorconsultation_patient'),
    ]

    operations = [
        # Adds soft-delete support for e-doctors with existing consultation history.
        migrations.AddField(
            model_name='edoctorprofile',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
