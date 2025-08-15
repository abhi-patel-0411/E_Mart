from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='offer',
            name='combo_products',
        ),
        migrations.RemoveField(
            model_name='offer',
            name='combo_price',
        ),
    ]