# Generated migration to add admin_user field to Hospital

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('hospitals', '0002_add_detail_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospital',
            name='admin_user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='hospital_admin', to=settings.AUTH_USER_MODEL),
        ),
    ]
