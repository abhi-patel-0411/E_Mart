from django.apps import AppConfig
import threading
import time
import os

class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'
    
    def ready(self):
        # Only start cleanup in main process, not in reloader
        if os.environ.get('RUN_MAIN') == 'true':
            self.start_offer_cleanup()
    
    def start_offer_cleanup(self):
        def cleanup_loop():
            time.sleep(10)  # Wait for Django to start
            
            while True:
                try:
                    from django.utils import timezone
                    from .models import Cart, Offer
                    
                    now = timezone.now()
                    carts_with_offers = Cart.objects.exclude(applied_offers=[])
                    
                    for cart in carts_with_offers:
                        original_count = len(cart.applied_offers)
                        valid_offers = []
                        
                        for offer_data in cart.applied_offers:
                            try:
                                offer = Offer.objects.get(id=offer_data.get('offer_id'))
                                if offer.is_active and offer.start_date <= now < offer.end_date:
                                    valid_offers.append(offer_data)
                            except Offer.DoesNotExist:
                                continue
                        
                        if len(valid_offers) != original_count:
                            cart.applied_offers = valid_offers
                            cart.save()
                    
                    time.sleep(5)  # 5 seconds
                    
                except Exception:
                    time.sleep(300)  # 5 minutes on error
        
        threading.Thread(target=cleanup_loop, daemon=True).start()