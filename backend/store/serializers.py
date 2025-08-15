from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile, Compare, Offer

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'profile_image']
    
    def get_profile_image(self, obj):
        try:
            if hasattr(obj, 'userprofile') and obj.userprofile.profile_picture:
                return obj.userprofile.profile_picture.url
        except:
            pass
        return None

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_image = serializers.ImageField(source='profile_picture', required=False)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        extra_kwargs = {
            'profile_picture': {'write_only': True}
        }
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Map profile_picture to profile_image for frontend
        if instance.profile_picture:
            data['profile_image'] = instance.profile_picture.url
        else:
            data['profile_image'] = None
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_average_rating(self, obj):
        try:
            return obj.get_average_rating()
        except:
            return 0
    
    def get_review_count(self, obj):
        try:
            return obj.get_review_count()
        except:
            return 0
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure consistent price formatting
        data['price'] = float(instance.price)
        if instance.actual_price:
            data['actual_price'] = float(instance.actual_price)
        if instance.discount_percentage:
            data['discount_percentage'] = float(instance.discount_percentage)
        return data

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    cost = serializers.SerializerMethodField()
    discounted_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'cost', 'discounted_cost', 'applied_offers']
    
    def get_cost(self, obj):
        # Force refresh product to get current price
        obj.product.refresh_from_db()
        return float(obj.product.price) * obj.quantity
    
    def get_discounted_cost(self, obj):
        # Force refresh product to get current price
        obj.product.refresh_from_db()
        return float(obj.product.price) * obj.quantity

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    discounted_total = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'discounted_total', 'total_discount', 'applied_offers', 'created_at', 'updated_at']
    
    def get_total_price(self, obj):
        return float(obj.get_total_price())
    
    def get_discounted_total(self, obj):
        return float(obj.get_discounted_total())
    
    def get_total_discount(self, obj):
        return float(obj.get_total_discount())

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    cost = serializers.SerializerMethodField()
    discounted_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = '__all__'
    
    def get_cost(self, obj):
        return obj.get_cost()
    
    def get_discounted_cost(self, obj):
        return obj.get_discounted_cost()

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure proper decimal formatting
        data['total_amount'] = float(instance.total_amount)
        data['discount_amount'] = float(instance.discount_amount)
        data['final_amount'] = float(instance.final_amount)
        return data

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'

class CompareSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Compare
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class OfferSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    combo_products = ProductSerializer(many=True, read_only=True)
    free_product = ProductSerializer(read_only=True)
    badge_text = serializers.SerializerMethodField()
    can_user_use = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = '__all__'
    
    def get_badge_text(self, obj):
        return obj.get_badge_text()
    
    def get_can_user_use(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.can_user_use(request.user)
        return True