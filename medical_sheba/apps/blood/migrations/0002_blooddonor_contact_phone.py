from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blood', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='blooddonor',
            name='contact_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
