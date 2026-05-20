from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edoctor', '0006_edoctorprofile_availability_schedule'),
    ]

    operations = [
        migrations.AlterField(
            model_name='edoctorconsultation',
            name='status',
            field=models.CharField(
                choices=[
                    ('scheduled', 'Scheduled'),
                    ('confirmed', 'Confirmed'),
                    ('ongoing', 'Ongoing'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled'),
                    ('no_show', 'No Show'),
                ],
                default='scheduled',
                max_length=20,
            ),
        ),
    ]
