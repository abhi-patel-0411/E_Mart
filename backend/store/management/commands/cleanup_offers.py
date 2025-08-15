from django.core.management.base import BaseCommand
from django.utils import timezone
from store.models import Cart, Offer
import threading
import time

class Command(BaseCommand):
    help = 'Automatically cleanup expired offers from user carts'

    def add_arguments(self, parser):
        parser.add_argument('--interval', type=int, default=3600, help='Cleanup interval in seconds (default: 3600 = 1 hour)')

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(f'Starting automatic offer cleanup service (interval: {interval}s)')
        
        def cleanup_loop():
            while True:
                try:
                    self.cleanup_expired_offers()
                    time.sleep(interval)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Cleanup error: {e}'))
                    time.sleep(60)  # Wait 1 minute before retrying
        
        # Start cleanup in background thread
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()
        
        self.stdout.write(self.style.SUCCESS('Offer cleanup service started'))
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write('Stopping offer cleanup service')

    def cleanup_expired_offers(self):
        now = timezone.now()
        cleaned_carts = 0
        total_expired_offers = 0
        
        carts_with_offers = Cart.objects.exclude(applied_offers=[])
        
        for cart in carts_with_offers:
            original_count = len(cart.applied_offers)
            valid_offers = []
            
            for offer_data in cart.applied_offers:
                try:
                    offer = Offer.objects.get(id=offer_data.get('offer_id'))
                    if offer.is_active and offer.start_date <= now <= offer.end_date:
                        valid_offers.append(offer_data)
                except Offer.DoesNotExist:
                    continue
            
            if len(valid_offers) != original_count:
                cart.applied_offers = valid_offers
                cart.save()
                cleaned_carts += 1
                total_expired_offers += (original_count - len(valid_offers))
        
        if cleaned_carts > 0:
            self.stdout.write(f'[{now}] Cleaned {cleaned_carts} carts, removed {total_expired_offers} expired offers')