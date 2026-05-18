from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0006_subscription_is_trial'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='duration',
            field=models.CharField(choices=[('monthly', '1 Month'), ('quarterly', '3 Months'), ('annual', '1 Year')], default='monthly', max_length=20),
        ),
        migrations.AddField(
            model_name='subscription',
            name='amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='subscription',
            name='payment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='subscriptions', to='payments.payment'),
        ),
        migrations.AddField(
            model_name='subscription',
            name='features',
            field=models.JSONField(default=dict),
        ),
    ]
