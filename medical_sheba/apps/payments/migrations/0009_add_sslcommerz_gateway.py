from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0008_remove_subscription_user_unique_constraint'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='gateway',
            field=models.CharField(
                choices=[
                    ('bkash', 'bKash'),
                    ('nagad', 'Nagad'),
                    ('card', 'Card'),
                    ('rocket', 'Rocket'),
                    ('sslcommerz', 'SSLCommerz'),
                ],
                max_length=20,
            ),
        ),
    ]
