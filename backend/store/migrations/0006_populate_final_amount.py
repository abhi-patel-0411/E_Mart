# Data migration to populate final_amount for existing orders

from django.db import migrations

def populate_final_amount(apps, schema_editor):
    Order = apps.get_model('store', 'Order')
    for order in Order.objects.all():
        if order.final_amount == 0:
            order.final_amount = order.total_amount - order.discount_amount
            order.save()

def reverse_populate_final_amount(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('store', '0005_merge_20250710_2144'),
    ]

    operations = [
        migrations.RunPython(populate_final_amount, reverse_populate_final_amount),
    ]