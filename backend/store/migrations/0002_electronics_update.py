# Generated migration for electronics products

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='brand',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='model_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='specifications',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='product',
            name='warranty_months',
            field=models.IntegerField(default=12),
        ),
        migrations.AlterField(
            model_name='category',
            name='icon',
            field=models.CharField(default='fas fa-microchip', max_length=50),
        ),
    ]