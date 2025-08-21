from django.utils import timezone
from .models import Offer, Cart

def cleanup_expired_offers():
    """
    Clean up expired offers from database and carts
    """
    now = timezone.now()
    
    # Get expired offers
    expired_offers = Offer.objects.filter(end_date__lt=now)
    expired_count = expired_offers.count()
    
    if expired_count > 0:
        # Remove from all carts first
        carts_with_offers = Cart.objects.filter(applied_offers__isnull=False)
        carts_updated = 0
        
        for cart in carts_with_offers:
            if cart.applied_offers:
                original_count = len(cart.applied_offers)
                # Keep only non-expired offers
                cart.applied_offers = [
                    offer for offer in cart.applied_offers
                    if not any(exp_offer.id == offer.get('offer_id') for exp_offer in expired_offers)
                ]
                if len(cart.applied_offers) < original_count:
                    cart.save()
                    carts_updated += 1
        
        # Delete expired offers
        expired_offers.delete()
        
        return {
            'expired_offers_deleted': expired_count,
            'carts_updated': carts_updated
        }
    
    return {'expired_offers_deleted': 0, 'carts_updated': 0}