from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('edoctor', '0007_alter_edoctorconsultation_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='edoctorconsultation',
            name='patient',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='edoctor_consultations',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
