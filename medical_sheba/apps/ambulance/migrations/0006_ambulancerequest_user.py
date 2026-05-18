from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ambulance', '0005_ambulancerequest_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='ambulancerequest',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ambulance_requests', to=settings.AUTH_USER_MODEL),
        ),
    ]
