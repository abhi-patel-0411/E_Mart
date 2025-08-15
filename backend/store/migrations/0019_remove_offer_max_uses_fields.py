# Generated migration to remove max_uses fields

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0018_alter_offer_offer_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='offer',
            name='max_uses',
        ),
        migrations.RemoveField(
            model_name='offer',
            name='max_uses_per_user',
        ),
    ]