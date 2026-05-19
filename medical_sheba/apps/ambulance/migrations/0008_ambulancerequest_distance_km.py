from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('ambulance', '0007_ambulanceservice_admin_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='ambulancerequest',
            name='distance_km',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=8,
                null=True,
                validators=[django.core.validators.MinValueValidator(0)],
            ),
        ),
    ]
