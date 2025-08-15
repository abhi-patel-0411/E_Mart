from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default='fas fa-microchip')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Categories'

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    specifications = models.JSONField(default=dict, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    actual_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    offer_text = models.CharField(max_length=200, blank=True)
    exchange_available = models.BooleanField(default=False)
    exchange_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    image_urls = models.JSONField(default=list, blank=True)
    video_url = models.URLField(blank=True, null=True)
    video_file = models.TextField(blank=True, null=True)  # Base64 encoded video
    stock = models.IntegerField(default=10)
    available = models.BooleanField(default=True)
    warranty_months = models.IntegerField(default=12)
    created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    def get_average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return sum([review.rating for review in reviews]) / len(reviews)
        return 0
    
    def get_review_count(self):
        return self.reviews.count()
    
    def get_discounted_price(self):
        return float(self.price)
    
    def get_savings_amount(self):
        if self.actual_price and self.actual_price > self.price:
            return self.actual_price - self.price
        return 0

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    applied_offers = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Cart {self.id}"
    
    def get_total_price(self):
        return sum(float(item.product.price) * item.quantity for item in self.items.all())
    
    def get_discounted_total(self):
        from decimal import Decimal
        base_total = Decimal(str(self.get_total_price()))
        
        # Clean expired offers first - auto remove if expired
        self.clean_expired_offers()
        
        # Only apply discount if valid offer exists (max 1 offer)
        if not self.applied_offers or len(self.applied_offers) == 0:
            return float(base_total)
        
        # Only use first offer (single offer policy)
        offer = self.applied_offers[0]
        discount_amount = Decimal(str(offer.get('discount_amount', 0)))
        
        # Ensure discount doesn't exceed cart total
        discount_amount = min(discount_amount, base_total)
        
        final_total = base_total - discount_amount
        return float(max(Decimal('0'), final_total))
    
    def get_total_discount(self):
        # Clean expired offers first - auto remove if expired
        self.clean_expired_offers()
        
        if not self.applied_offers or len(self.applied_offers) == 0:
            return 0.0
        
        # Only one offer allowed
        offer = self.applied_offers[0]
        return float(offer.get('discount_amount', 0))
    
    def clean_expired_offers(self):
        """Remove expired offers from cart without deleting from database"""
        if not self.applied_offers:
            return False
        
        from django.utils import timezone
        now = timezone.now()
        valid_offers = []
        offers_removed = False
        
        for offer_data in self.applied_offers:
            try:
                offer = Offer.objects.get(id=offer_data.get('offer_id'))
                # Check if offer is still valid (not expired)
                if offer.is_active and offer.start_date <= now < offer.end_date:
                    valid_offers.append(offer_data)
                else:
                    offers_removed = True
            except Offer.DoesNotExist:
                offers_removed = True
                continue
        
        if offers_removed:
            self.applied_offers = valid_offers
            self.save()
        
        return offers_removed
    
    def apply_specific_offer(self, offer_id, user=None):
        from django.utils import timezone
        try:
            offer = Offer.objects.get(
                id=offer_id,
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            )
            
            result = offer.apply_offer(self.items.all(), user)
            if result['success']:
                # Ensure discount doesn't exceed cart total
                from decimal import Decimal
                cart_total = Decimal(str(self.get_total_price()))
                discount_amount = float(min(Decimal(str(result['discount_amount'])), cart_total))
                
                applied_offer = {
                    'offer_id': offer.id,
                    'offer_name': result['offer_name'],
                    'offer_type': result['offer_type'],
                    'discount_amount': discount_amount,
                    'badge_text': result.get('badge_text', ''),
                    'free_items': result.get('free_items', []),
                    'combo_price': result.get('combo_price')
                }
                
                # Only allow one offer per user
                self.applied_offers = [applied_offer]
                self.save()
                self.refresh_from_db()
                return discount_amount, [applied_offer]
            
        except Offer.DoesNotExist:
            pass
        
        return 0, []

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    applied_offers = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    def get_cost(self):
        return float(self.product.price) * self.quantity
    
    def get_discounted_cost(self):
        return float(self.product.price) * self.quantity

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        
    def __str__(self):
        return f"{self.user.username}'s wishlist item: {self.product.name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=100, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    applied_offers = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.TextField()
    payment_method = models.CharField(max_length=50, default='Cash on Delivery')
    payment_details = models.JSONField(default=dict, blank=True)
    payment_status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_id}"
    
    class Meta:
        ordering = ['-created_at']

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    free_quantity = models.PositiveIntegerField(default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    def get_cost(self):
        from decimal import Decimal
        return float(Decimal(str(self.price)) * self.quantity)
    
    def get_discounted_cost(self):
        from decimal import Decimal
        base_cost = Decimal(str(self.price)) * self.quantity
        discount = Decimal(str(self.discount_amount))
        return float(max(Decimal('0'), base_cost - discount))

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}/5)"

class Compare(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-added_at']
        
    def __str__(self):
        return f"{self.user.username}'s compare item: {self.product.name}"

class Offer(models.Model):
    OFFER_TYPES = [
        ('discount', 'Percentage Discount'),
        ('flat', 'Flat ₹ Off'),
        ('category_offer', 'Category Offer'),
        ('first_time', 'First Purchase Offer'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, default='OFFER001')
    description = models.TextField(blank=True)
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES)
    
    # Discount Configuration
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    flat_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Product/Category Selection
    products = models.ManyToManyField(Product, related_name='offers', blank=True)
    categories = models.ManyToManyField(Category, blank=True, related_name='offers')
    
    # Buy X Get Y Configuration
    buy_quantity = models.IntegerField(default=1)
    get_quantity = models.IntegerField(default=1)
    free_product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name='free_offers')
    

    
    # Constraints
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    used_count = models.IntegerField(default=0)
    
    # Timing & Status
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    auto_apply = models.BooleanField(default=False)
    first_time_only = models.BooleanField(default=False)
    
    # Priority & Metadata
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    badge_text = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (self.is_active and 
                self.start_date <= now <= self.end_date)
    
    def is_expired(self):
        from django.utils import timezone
        now = timezone.now()
        return now >= self.end_date or not self.is_active
    
    def get_badge_text(self):
        if self.badge_text:
            return self.badge_text
        
        if self.offer_type == 'discount':
            return f"{self.discount_percentage}% OFF"
        elif self.offer_type == 'flat':
            return f"Rs.{self.flat_discount} OFF"

        elif self.offer_type == 'category_offer':
            return f"{self.discount_percentage}% OFF"
        elif self.offer_type == 'first_time':
            return "First Purchase Offer"
        return "Special Offer"
    
    def can_user_use(self, user):
        if not user or not user.is_authenticated:
            return not self.first_time_only
        
        # Check first time user restriction
        if self.first_time_only:
            has_orders = Order.objects.filter(user=user).exists()
            if has_orders:
                return False
        
        return True
    
    def get_user_usage_count(self, user):
        # Count orders where this offer was used
        count = 0
        for order in Order.objects.filter(user=user):
            for offer in order.applied_offers:
                if offer.get('offer_id') == self.id:
                    count += 1
                    break
        return count
    
    def apply_offer(self, cart_items, user=None):
        if not self.is_valid():
            return {'success': False, 'error': 'Offer is not valid'}
        
        if not self.can_user_use(user):
            if self.first_time_only:
                return {'success': False, 'error': 'This offer is only for first-time users'}
            return {'success': False, 'error': 'You cannot use this offer'}
        
        # Apply offer based on type
        if self.offer_type == 'discount':
            return self._apply_percentage_discount(cart_items)
        elif self.offer_type == 'flat':
            return self._apply_flat_discount(cart_items)

        elif self.offer_type == 'category_offer':
            return self._apply_category_offer(cart_items)
        elif self.offer_type == 'first_time':
            return self._apply_first_time_offer(cart_items, user)
        
        return {'success': False, 'error': 'Invalid offer type'}
    
    def get_eligible_items(self, cart_items):
        eligible_items = []
        for item in cart_items:
            # Check if product is directly eligible
            if self.products.filter(id=item.product.id).exists():
                eligible_items.append(item)
            # Check if product's category is eligible (if product has a category)
            elif item.product.category and self.categories.filter(id=item.product.category.id).exists():
                eligible_items.append(item)
        return eligible_items
    
    def _apply_percentage_discount(self, cart_items):
        eligible_items = self.get_eligible_items(cart_items)
        if not eligible_items:
            return {'success': False, 'error': 'No eligible items found'}
        
        total_value = sum(item.get_cost() for item in eligible_items)
        if total_value < float(self.min_order_value):
            return {'success': False, 'error': f'Minimum order value of Rs.{self.min_order_value} required'}
        
        discount_amount = total_value * (float(self.discount_percentage) / 100)
        
        return {
            'success': True,
            'discount_amount': discount_amount,
            'offer_name': self.name,
            'offer_type': self.offer_type,
            'badge_text': self.get_badge_text()
        }
    
    def _apply_flat_discount(self, cart_items):
        eligible_items = self.get_eligible_items(cart_items)
        if not eligible_items:
            return {'success': False, 'error': 'No eligible items found'}
        
        total_value = sum(item.get_cost() for item in eligible_items)
        if total_value < float(self.min_order_value):
            return {'success': False, 'error': f'Minimum order value of Rs.{self.min_order_value} required'}
        
        discount_amount = min(float(self.flat_discount), total_value)
        
        return {
            'success': True,
            'discount_amount': discount_amount,
            'offer_name': self.name,
            'offer_type': self.offer_type,
            'badge_text': self.get_badge_text()
        }
    

    

    
    def _apply_category_offer(self, cart_items):
        # Ensure categories are selected for category offers
        if not self.categories.exists():
            return {'success': False, 'error': 'No categories configured for this offer'}
        
        category_ids = set(self.categories.values_list('id', flat=True))
        eligible_items = []
        
        # Check if products have categories and if they match the offer categories
        for item in cart_items:
            if item.product.category and item.product.category.id in category_ids:
                eligible_items.append(item)
        
        if not eligible_items:
            return {'success': False, 'error': 'No eligible items in specified categories'}
        
        total_value = sum(item.get_cost() for item in eligible_items)
        if total_value < float(self.min_order_value):
            return {'success': False, 'error': f'Minimum order value of Rs.{self.min_order_value} required'}
        
        discount_amount = total_value * (float(self.discount_percentage) / 100)
        
        return {
            'success': True,
            'discount_amount': discount_amount,
            'offer_name': self.name,
            'offer_type': self.offer_type,
            'badge_text': self.get_badge_text()
        }
    
    def _apply_first_time_offer(self, cart_items, user):
        if not user or not user.is_authenticated:
            return {'success': False, 'error': 'User must be logged in'}
        
        # Check if user has previous orders
        if Order.objects.filter(user=user).exists():
            return {'success': False, 'error': 'This offer is only for first-time users'}
        
        total_value = sum(item.get_cost() for item in cart_items)
        if total_value < float(self.min_order_value):
            return {'success': False, 'error': f'Minimum order value of Rs.{self.min_order_value} required'}
        
        discount_amount = total_value * (float(self.discount_percentage) / 100)
        
        return {
            'success': True,
            'discount_amount': discount_amount,
            'offer_name': self.name,
            'offer_type': self.offer_type,
            'badge_text': self.get_badge_text()
        }

class SearchQuery(models.Model):
    query = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.query} ({self.results_count} results)"