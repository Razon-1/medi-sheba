# Generated migration for pharmacy admin management

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('emedicine', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='emedicinepharmacy',
            name='admin_user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pharmacy_admin', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='medicineitem',
            name='pharmacy',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='medicines', to='emedicine.emedicinepharmacy'),
            preserve_default=False,
        ),
    ]
