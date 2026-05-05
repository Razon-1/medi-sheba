from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hospitals', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospital',
            name='description',
            field=models.TextField(blank=True, help_text='About the hospital', null=True),
        ),
        migrations.AddField(
            model_name='hospital',
            name='services',
            field=models.TextField(blank=True, help_text='Comma-separated list of services', null=True),
        ),
        migrations.AddField(
            model_name='hospital',
            name='special_facilities',
            field=models.TextField(blank=True, help_text='Comma-separated list of special facilities', null=True),
        ),
        migrations.AddField(
            model_name='hospital',
            name='visiting_hours_start',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hospital',
            name='visiting_hours_end',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
