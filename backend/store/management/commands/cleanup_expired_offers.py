from django.core.management.base import BaseCommand
from django.utils import timezone
from store.offer_cleanup import cleanup_expired_offers

class Command(BaseCommand):
    help = 'Clean up expired offers from database and carts'

    def handle(self, *args, **options):
        self.stdout.write('Starting expired offers cleanup...')
        
        result = cleanup_expired_offers()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Cleanup completed: {result["expired_offers_deleted"]} offers deleted, '
                f'{result["carts_updated"]} carts updated'
            )
        )