from django.utils import timezone
from .models import Offer

class AutoDeleteExpiredOffersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Delete expired offers on every request
        now = timezone.now()
        Offer.objects.filter(end_date__lt=now).delete()
        
        response = self.get_response(request)
        return response