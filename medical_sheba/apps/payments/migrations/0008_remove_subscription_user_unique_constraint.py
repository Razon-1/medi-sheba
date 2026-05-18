from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0007_align_subscription_schema'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE subscriptions DROP INDEX user_id;",
            reverse_sql="ALTER TABLE subscriptions ADD UNIQUE INDEX user_id (user_id);",
        ),
    ]
