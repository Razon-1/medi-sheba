# Generated migration to add multi-role support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_remove_password_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='roles',
            field=models.JSONField(default=list, help_text='List of roles for this user'),
        ),
        migrations.RemoveField(
            model_name='user',
            name='role',
        ),
    ]
