# Generated migration for Buy 1 Get 1 Free offers

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_compare'),
    ]

    operations = [
        migrations.CreateModel(
            name='Offer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('offer_type', models.CharField(choices=[('buy_one_get_one', 'Buy 1 Get 1 Free'), ('percentage_discount', 'Percentage Discount'), ('fixed_discount', 'Fixed Amount Discount')], max_length=20)),
                ('discount_value', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('min_quantity', models.IntegerField(default=1)),
                ('max_uses', models.IntegerField(blank=True, null=True)),
                ('used_count', models.IntegerField(default=0)),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('categories', models.ManyToManyField(blank=True, related_name='offers', to='store.category')),
                ('products', models.ManyToManyField(related_name='offers', to='store.product')),
            ],
        ),
        migrations.AddField(
            model_name='cart',
            name='applied_offers',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='cartitem',
            name='applied_offers',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='order',
            name='applied_offers',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='order',
            name='discount_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='final_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='discount_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='free_quantity',
            field=models.PositiveIntegerField(default=0),
        ),
    ]