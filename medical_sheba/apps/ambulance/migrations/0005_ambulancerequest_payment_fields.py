from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0008_remove_subscription_user_unique_constraint'),
        ('ambulance', '0004_ambulanceservice_requires_authentication'),
    ]

    operations = [
        migrations.AddField(
            model_name='ambulancerequest',
            name='estimated_fare',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='ambulancerequest',
            name='final_fare',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='ambulancerequest',
            name='payment_status',
            field=models.CharField(choices=[('unpaid', 'Unpaid'), ('paid', 'Paid'), ('refunded', 'Refunded')], default='unpaid', max_length=20),
        ),
        migrations.AddField(
            model_name='ambulancerequest',
            name='payment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ambulance_requests', to='payments.payment'),
        ),
    ]
