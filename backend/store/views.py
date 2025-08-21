from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
import uuid

from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile, Compare, Offer, SearchQuery
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer,
    WishlistSerializer, OrderSerializer, ReviewSerializer, UserProfileSerializer,
    UserRegistrationSerializer, UserSerializer, CompareSerializer, OfferSerializer
)
from .analytics import get_analytics_data

# Import combo eligibility function
from .views_combo_eligibility import check_combo_eligibility
from .stock_utils import update_checkout_stock
from .product_utils import admin_toggle_product_availability

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    
    # Try to authenticate with username first
    user = authenticate(username=username_or_email, password=password)
    
    # If username authentication fails, try with email
    if not user:
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Category Views
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

# Product Views
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        queryset = Product.objects.filter(available=True)
        
        # Basic filters
        category_slug = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        limit = self.request.query_params.get('limit')
        
        # Advanced filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        brand = self.request.query_params.get('brand')
        min_rating = self.request.query_params.get('min_rating')
        sort_by = self.request.query_params.get('sort_by', 'name')
        in_stock = self.request.query_params.get('in_stock')
        
        # Category filter
        if category_slug:
            queryset = queryset.filter(
                Q(category__slug=category_slug) | 
                Q(category__name__icontains=category_slug.replace('-', ' '))
            )
        
        # Enhanced search
        if search:
            search_terms = search.split()
            search_query = Q()
            for term in search_terms:
                search_query |= (
                    Q(name__icontains=term) |
                    Q(description__icontains=term) |
                    Q(brand__icontains=term) |
                    Q(category__name__icontains=term) |
                    Q(specifications__icontains=term)
                )
            queryset = queryset.filter(search_query).distinct()
        
        # Price range filter
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Brand filter
        if brand:
            brands = brand.split(',')
            queryset = queryset.filter(brand__in=brands)
        
        # Stock filter
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        elif in_stock == 'false':
            queryset = queryset.filter(stock=0)
        
        # Sorting
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created')
        elif sort_by == 'rating':
            # This would need a more complex query for actual rating calculation
            queryset = queryset.order_by('-id')  # Placeholder
        else:
            queryset = queryset.order_by('name')
        
        # Limit results
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
                
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# Cart Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Auto-clean expired offers from cart
    offers_removed = cart.clean_expired_offers()
    
    serializer = CartSerializer(cart)
    response_data = serializer.data
    
    # Notify if offers were auto-removed
    if offers_removed:
        response_data['message'] = 'Some expired offers were automatically removed from your cart'
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    # Check if product is available and in stock
    if not product.available:
        return Response({'error': 'This product is currently unavailable'}, status=status.HTTP_400_BAD_REQUEST)
    
    if product.stock <= 0:
        return Response({'error': 'This product is out of stock'}, status=status.HTTP_400_BAD_REQUEST)
    
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, 
        product=product,
        defaults={'quantity': 1}
    )
    
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    return Response({'message': f'{product.name} added to cart!'})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    quantity = request.data.get('quantity', 1)
    cart = cart_item.cart
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': 'Cart updated!'})
    else:
        cart_item.delete()
        # Clear applied offers when cart items are removed
        if cart.applied_offers:
            cart.applied_offers = []
            cart.save()
        return Response({'message': 'Item removed!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    cart = cart_item.cart
    cart_item.delete()
    
    # Clear applied offers when cart items are removed
    if cart.applied_offers:
        cart.applied_offers = []
        cart.save()
    
    return Response({'message': 'Item removed from cart!'})

# Wishlist Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    
    if created:
        return Response({'message': f'{product.name} added to wishlist!'})
    else:
        return Response({'message': f'{product.name} already in wishlist!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    Wishlist.objects.filter(user=request.user, product=product).delete()
    return Response({'message': f'{product.name} removed from wishlist!'})

# Compare Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_compare(request):
    compare_items = Compare.objects.filter(user=request.user)
    serializer = CompareSerializer(compare_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_compare(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    # Limit to 4 products for comparison
    compare_count = Compare.objects.filter(user=request.user).count()
    if compare_count >= 4:
        return Response({'error': 'You can compare maximum 4 products at a time!'}, status=status.HTTP_400_BAD_REQUEST)
    
    compare_item, created = Compare.objects.get_or_create(user=request.user, product=product)
    
    if created:
        return Response({'message': f'{product.name} added to compare!'})
    else:
        return Response({'message': f'{product.name} already in compare list!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_compare(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    Compare.objects.filter(user=request.user, product=product).delete()
    return Response({'message': f'{product.name} removed from compare!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_compare(request):
    Compare.objects.filter(user=request.user).delete()
    return Response({'message': 'Compare list cleared!'})

# Order Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    try:
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        if not cart_items:
            return Response({'error': 'Cart is empty!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        applied_offers = cart.applied_offers or []
        
        # Use cart's calculation methods for consistency
        total = cart.get_total_price()
        discounted_total = cart.get_discounted_total()
        discount_amount = total - discounted_total
        final_amount = discounted_total
        
        order = Order.objects.create(
            user=request.user,
            order_id=f'ORD-{uuid.uuid4().hex[:8].upper()}',
            total_amount=total,
            discount_amount=discount_amount,
            final_amount=final_amount,
            applied_offers=applied_offers,
            shipping_address=request.data.get('address', 'Default Address'),
            payment_method=request.data.get('payment_method', 'Cash on Delivery'),
            payment_details=request.data.get('payment_details', {}),
            payment_status=request.data.get('payment_status', 'pending')
        )
        
        # Update offer usage count
        for offer_data in applied_offers:
            try:
                offer_id = offer_data.get('offer_id')
                if offer_id:
                    offer = Offer.objects.get(id=offer_id)
                    offer.used_count = (offer.used_count or 0) + 1
                    offer.save()
                    print(f"Updated offer {offer.name} usage count to {offer.used_count}")
            except (Offer.DoesNotExist, KeyError, TypeError) as e:
                print(f"Error updating offer usage: {e}")
                pass
        
        # Create order items and update stock
        for item in cart_items:
            free_quantity = 0
            item_discount = 0
            
            # Calculate free quantity and discount for this item
            for offer_data in applied_offers:
                for free_item in offer_data.get('free_items', []):
                    if free_item.get('product_id') == item.product.id:
                        free_quantity = free_item.get('free_quantity', 0)
                        item_discount = float(free_item.get('discount_amount', 0))
                        break
            
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
                free_quantity=free_quantity,
                discount_amount=item_discount
            )
            
            # Update product stock
            product = item.product
            product.stock = max(0, product.stock - item.quantity)
            if product.stock == 0:
                product.available = False
            product.save()
        
        # Update product stock
        update_checkout_stock(request)
        
        # Clear cart
        cart_items.delete()
        cart.applied_offers = []
        cart.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': f'Checkout failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

# Review Views
@api_view(['GET'])
def product_reviews(request, product_id):
    reviews = Review.objects.filter(product_id=product_id, is_approved=True)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def product_reviews_by_slug(request, slug):
    try:
        product = get_object_or_404(Product, slug=slug)
        reviews = Review.objects.filter(product=product, is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    review, created = Review.objects.get_or_create(
        product=product,
        user=request.user,
        defaults={
            'rating': request.data.get('rating'),
            'comment': request.data.get('comment')
        }
    )
    
    if not created:
        review.rating = request.data.get('rating')
        review.comment = request.data.get('comment')
        review.save()
    
    serializer = ReviewSerializer(review)
    return Response(serializer.data)

# User Profile Views
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Update user fields
        user = request.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        user.save()
        
        # Handle profile image upload
        if 'profile_image' in request.FILES:
            profile.profile_picture = request.FILES['profile_image']
        
        # Update other profile fields
        if 'phone' in request.data:
            profile.phone = request.data['phone']
        if 'address' in request.data:
            profile.address = request.data['address']
        if 'city' in request.data:
            profile.city = request.data['city']
        if 'state' in request.data:
            profile.state = request.data['state']
        if 'pincode' in request.data:
            profile.pincode = request.data['pincode']
        if 'date_of_birth' in request.data:
            profile.date_of_birth = request.data['date_of_birth']
        
        profile.save()
        
        # Return updated profile with user data
        updated_profile = UserProfileSerializer(profile).data
        return Response(updated_profile)

# Analytics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    user_orders = Order.objects.filter(user=request.user)
    total_spent = sum(order.total_amount for order in user_orders)
    
    return Response({
        'total_orders': user_orders.count(),
        'total_spent': total_spent,
        'recent_orders': OrderSerializer(user_orders[:5], many=True).data,
    })

# Analytics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_prediction(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from .revenue_utils import get_total_revenue
    
    total_revenue = get_total_revenue()
    total_orders = Order.objects.count()
    
    return Response({
        'historical_data': [{'date': '2024-01-01', 'sales': total_revenue, 'orders': total_orders}],
        'predictions': [{'date': '2024-01-02', 'predicted_sales': total_revenue}],
        'avg_daily_sales': total_revenue,
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'data_source': 'database'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_analytics(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from .revenue_utils import get_total_revenue
    
    total_revenue = get_total_revenue()
    
    return Response({
        'total_revenue': total_revenue,
        'monthly_revenue': [{'month': 'Total', 'revenue': total_revenue}],
        'category_revenue': [{'category': 'All', 'revenue': total_revenue}]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def refund_analytics(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Sum, Count
    
    # Cancelled orders (refunds)
    cancelled_orders = Order.objects.filter(status='cancelled')
    total_refunds = cancelled_orders.aggregate(total=Sum('final_amount'))['total'] or 0
    
    # Monthly refund data
    monthly_refunds = []
    for i in range(6):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        refund_amount = cancelled_orders.filter(
            created_at__gte=month_start,
            created_at__lt=month_end
        ).aggregate(total=Sum('final_amount'))['total'] or 0
        
        monthly_refunds.append({
            'month': month_start.strftime('%Y-%m'),
            'refunds': float(refund_amount),
            'count': cancelled_orders.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
        })
    
    # Refund rate
    total_orders = Order.objects.count()
    refund_rate = (cancelled_orders.count() / total_orders * 100) if total_orders > 0 else 0
    
    return Response({
        'total_refunds': float(total_refunds),
        'refund_count': cancelled_orders.count(),
        'refund_rate': round(refund_rate, 2),
        'monthly_refunds': list(reversed(monthly_refunds))
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_recommendations(request):
    """Get multiple types of recommendations for home page"""
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../')
    try:
        from ml_comparison import ml_comparison
    except ImportError:
        ml_comparison = None
    from django.db.models import Count
    
    try:
        # Most Ordered Products
        most_ordered = Product.objects.filter(available=True).annotate(
            order_count=Count('orderitem')
        ).order_by('-order_count')[:6]
        
        # Most Popular (by reviews)
        most_popular = Product.objects.filter(available=True).annotate(
            review_count=Count('reviews')
        ).order_by('-review_count')[:6]
        
        # KNN ML Recommendations
        knn_recommendations = []
        best_ml_recommendations = []
        
        if ml_comparison:
            try:
                knn_recommendations = ml_comparison.get_recommendations('KNN', 6)
                best_ml_recommendations = ml_comparison.get_recommendations('Linear_Regression', 6)
            except Exception as e:
                print(f"ML recommendations error: {e}")
                knn_recommendations = []
                best_ml_recommendations = []
        
        return Response({
            'most_ordered': ProductSerializer(most_ordered, many=True).data,
            'most_popular': ProductSerializer(most_popular, many=True).data,
            'knn_recommendations': knn_recommendations,
            'best_ml_recommendations': best_ml_recommendations
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from .revenue_utils import get_total_revenue
    
    total_revenue = get_total_revenue()
    
    analytics_data = {
        'total_revenue': total_revenue,
        'total_orders': Order.objects.count(),
        'total_users': User.objects.count(),
        'total_products': Product.objects.count()
    }
    
    return Response(analytics_data)

# Admin CRUD Operations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_products(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_product(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get category by slug
        category_slug = request.data.get('category')
        category = None
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug)
            except Category.DoesNotExist:
                return Response({'error': f'Category {category_slug} not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique slug
        base_slug = request.data.get('name', '').lower().replace(' ', '-').replace('--', '-')
        slug = base_slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Handle multiple images
        image_urls = []
        if request.data.get('image_url'):
            image_urls.append(request.data.get('image_url'))
        
        # Create product
        product = Product.objects.create(
            name=request.data.get('name'),
            slug=slug,
            category=category,
            description=request.data.get('description', ''),
            price=request.data.get('price', 0),
            actual_price=request.data.get('actual_price'),
            discount_percentage=request.data.get('discount_percentage', 0),
            offer_text=request.data.get('offer_text', ''),
            exchange_available=request.data.get('exchange_available', False),
            exchange_discount=request.data.get('exchange_discount', 0),
            stock=int(request.data.get('stock', 0)),
            image_url=request.data.get('image_url', ''),
            image_urls=request.data.get('image_urls', []),
            video_url=request.data.get('video_url', ''),
            video_file=request.data.get('video_file', ''),
            available=True
        )
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_product(request, product_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = get_object_or_404(Product, id=product_id)
        
        # Update name and slug
        if 'name' in request.data:
            product.name = request.data['name']
            base_slug = request.data['name'].lower().replace(' ', '-').replace('--', '-')
            # Ensure unique slug
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(id=product.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            product.slug = slug
        
        # Update price - save exactly as entered
        if 'price' in request.data:
            product.price = request.data['price']
        
        # Update other fields
        product.description = request.data.get('description', product.description)
        product.actual_price = request.data.get('actual_price', product.actual_price)
        product.discount_percentage = request.data.get('discount_percentage', product.discount_percentage)
        product.offer_text = request.data.get('offer_text', product.offer_text)
        product.exchange_available = request.data.get('exchange_available', product.exchange_available)
        product.exchange_discount = request.data.get('exchange_discount', product.exchange_discount)
        product.stock = int(request.data.get('stock', product.stock))
        product.image_url = request.data.get('image_url', product.image_url)
        product.image_urls = request.data.get('image_urls', product.image_urls)
        product.video_url = request.data.get('video_url', product.video_url)
        product.video_file = request.data.get('video_file', product.video_file)
        
        # Update category
        if 'category' in request.data:
            category = get_object_or_404(Category, slug=request.data['category'])
            product.category = category
        
        product.save()
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_product(request, product_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return Response({'message': 'Product deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    users_data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined
    } for user in users]
    return Response(users_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'date_joined': user.date_joined
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        
        user.save()
        return Response({'message': 'User updated successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_ban_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        user.is_active = False
        user.save()
        return Response({'message': 'User banned successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all().select_related('user').prefetch_related('items__product').order_by('-created_at')
    orders_data = []
    for order in orders:
        # Get order items
        order_items = []
        for item in order.items.all():
            order_items.append({
                'id': item.id,
                'product': {
                    'id': item.product.id,
                    'name': item.product.name,
                    'image_url': item.product.image_url,
                    'slug': item.product.slug
                },
                'quantity': item.quantity,
                'price': float(item.price),
                'total': float(item.price * item.quantity)
            })
        
        orders_data.append({
            'id': order.id,
            'order_id': order.order_id,
            'user': {
                'first_name': order.user.first_name,
                'last_name': order.user.last_name,
                'username': order.user.username,
                'email': order.user.email
            },
            'total_amount': float(order.total_amount),
            'final_amount': float(order.final_amount or order.total_amount),
            'discount_amount': float(order.discount_amount or 0),
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'shipping_address': order.shipping_address,
            'payment_method': order.payment_method,
            'items': order_items,
            'items_count': len(order_items)
        })
    return Response(orders_data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status', order.status)
        order.status = new_status
        order.save()
        return Response({
            'message': 'Order status updated successfully',
            'order_id': order.id,
            'new_status': new_status
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_wishlists(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    wishlists = Wishlist.objects.all().select_related('user', 'product')
    wishlists_data = []
    for wishlist in wishlists:
        wishlists_data.append({
            'id': wishlist.id,
            'user': {
                'username': wishlist.user.username,
                'first_name': wishlist.user.first_name,
                'last_name': wishlist.user.last_name
            },
            'product': {
                'name': wishlist.product.name,
                'price': float(wishlist.product.price),
                'image_url': wishlist.product.image_url
            },
            'added_at': wishlist.added_at.isoformat()
        })
    return Response(wishlists_data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_remove_wishlist(request, wishlist_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        wishlist = get_object_or_404(Wishlist, id=wishlist_id)
        wishlist.delete()
        return Response({'message': 'Wishlist item removed successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_compares(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    compares = Compare.objects.all().select_related('user', 'product')
    compares_data = []
    for compare in compares:
        compares_data.append({
            'id': compare.id,
            'user': {
                'username': compare.user.username,
                'first_name': compare.user.first_name,
                'last_name': compare.user.last_name
            },
            'product': {
                'name': compare.product.name,
                'price': float(compare.product.price),
                'image_url': compare.product.image_url
            },
            'added_at': compare.added_at.isoformat()
        })
    return Response(compares_data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_remove_compare(request, compare_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        compare = get_object_or_404(Compare, id=compare_id)
        compare.delete()
        return Response({'message': 'Compare item removed successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Offer Management Views
@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_offers(request):
    from django.utils import timezone
    now = timezone.now()
    
    # Auto-delete expired offers
    expired_offers = Offer.objects.filter(
        end_date__lt=now
    )
    expired_count = expired_offers.count()
    expired_offers.delete()
    
    # Get active offers
    offers = Offer.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gt=now
    )
    
    serializer = OfferSerializer(offers, many=True)
    response_data = serializer.data
    
    if expired_count > 0:
        response_data = {
            'offers': response_data,
            'message': f'{expired_count} expired offers were automatically removed'
        }
    
    return Response(response_data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applicable_offers(request):
    cart = get_object_or_404(Cart, user=request.user)
    cart_items = CartItem.objects.filter(cart=cart)
    
    if not cart_items:
        return Response({'offers': []})
    
    from django.utils import timezone
    now = timezone.now()
    
    # Auto-delete expired offers from database
    expired_offers = Offer.objects.filter(
        end_date__lt=now
    )
    expired_offers.delete()
    
    # Auto-clean expired offers from cart
    offers_removed = cart.clean_expired_offers()
    
    # If user already has an offer applied, return empty (only one offer allowed)
    if cart.applied_offers:
        response_data = {'offers': [], 'current_offer': cart.applied_offers[0]}
        if offers_removed:
            response_data['message'] = 'Some expired offers were automatically removed'
        return Response(response_data)
    
    # Only get currently active offers (not expired)
    active_offers = Offer.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gt=now
    ).order_by('-priority', '-created_at')
    
    applicable_offers = []
    auto_applied_offer = None
    
    for offer in active_offers:
        # Double-check offer is not expired
        if offer.is_expired():
            continue
            
        # Check if offer is applicable
        result = offer.apply_offer(cart_items, request.user)
        if result['success']:
            offer_data = {
                'id': offer.id,
                'code': offer.code,
                'name': offer.name,
                'description': offer.description,
                'offer_type': offer.offer_type,
                'discount_amount': result['discount_amount'],
                'badge_text': result.get('badge_text', ''),
                'auto_apply': offer.auto_apply,
                'priority': offer.priority,
                'first_time_only': offer.first_time_only
            }
            
            # Auto-apply highest priority offer
            if offer.auto_apply and not auto_applied_offer:
                auto_applied_offer = offer_data
                # Apply the offer automatically
                applied_offer = {
                    'offer_id': offer.id,
                    'offer_code': offer.code,
                    'offer_name': result['offer_name'],
                    'offer_type': result['offer_type'],
                    'discount_amount': float(result['discount_amount']),
                    'badge_text': result.get('badge_text', '')
                }
                cart.applied_offers = [applied_offer]
                cart.save()
                break
            else:
                applicable_offers.append(offer_data)
    
    response_data = {
        'offers': applicable_offers,
        'auto_applied': auto_applied_offer
    }
    
    if offers_removed:
        response_data['message'] = 'Some expired offers were automatically removed'
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_offer_from_cart(request):
    cart = get_object_or_404(Cart, user=request.user)
    offer_id = request.data.get('offer_id')
    
    if not offer_id:
        return Response({'error': 'Offer ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    current_offers = cart.applied_offers or []
    current_offers = [o for o in current_offers if o.get('offer_id') != int(offer_id)]
    
    cart.applied_offers = current_offers
    cart.save()
    
    serializer = CartSerializer(cart)
    return Response({
        'success': True,
        'message': 'Offer removed successfully',
        'cart': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart_offers(request):
    """Get available and applied offers for cart items"""
    cart = get_object_or_404(Cart, user=request.user)
    cart_items = CartItem.objects.filter(cart=cart)
    
    if not cart_items:
        return Response({
            'available_offers': [],
            'applied_offers': []
        })
    
    from django.utils import timezone
    now = timezone.now()
    
    # Clean expired offers
    cart.clean_expired_offers()
    
    # Get all active offers
    active_offers = Offer.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gt=now
    ).order_by('-priority', '-created_at')
    
    available_offers = []
    applied_offers = cart.applied_offers or []
    applied_offer_ids = [o.get('offer_id') for o in applied_offers]
    
    # Auto-apply all eligible auto offers that aren't already applied
    auto_offers_to_apply = []
    
    # Check which offers are applicable to current cart
    for offer in active_offers:
        if offer.is_expired():
            continue
            
        # Skip if already applied
        if offer.id in applied_offer_ids:
            continue
            
        # Check if offer applies to cart items
        result = offer.apply_offer(cart_items, request.user)
        if result['success']:
            offer_data = {
                'id': offer.id,
                'code': offer.code,
                'name': offer.name,
                'description': offer.description,
                'offer_type': offer.offer_type,
                'estimated_discount': result['discount_amount'],
                'badge_text': result.get('badge_text', ''),
                'auto_apply': offer.auto_apply,
                'priority': offer.priority,
                'first_time_only': offer.first_time_only,
                'min_order_value': float(offer.min_order_value)
            }
            
            if offer.auto_apply:
                # Auto-apply this offer
                auto_offers_to_apply.append({
                    'offer_id': offer.id,
                    'offer_name': result['offer_name'],
                    'offer_type': result['offer_type'],
                    'discount_amount': float(result['discount_amount']),
                    'badge_text': result.get('badge_text', ''),
                    'auto_apply': True
                })
            else:
                # Only show manual offers if no manual offer is applied
                manual_offers_applied = [o for o in applied_offers if not o.get('auto_apply', False)]
                if len(manual_offers_applied) == 0:
                    available_offers.append(offer_data)
    
    # Apply auto offers
    if auto_offers_to_apply:
        cart.applied_offers = applied_offers + auto_offers_to_apply
        cart.save()
        applied_offers = cart.applied_offers
    
    # Format applied offers
    formatted_applied_offers = []
    for applied_offer in applied_offers:
        try:
            offer = Offer.objects.get(id=applied_offer.get('offer_id'))
            formatted_applied_offers.append({
                'offer_id': applied_offer.get('offer_id'),
                'offer_name': applied_offer.get('offer_name'),
                'offer_type': applied_offer.get('offer_type'),
                'discount_amount': applied_offer.get('discount_amount'),
                'badge_text': applied_offer.get('badge_text'),
                'auto_apply': applied_offer.get('auto_apply', False)
            })
        except Offer.DoesNotExist:
            continue
    
    return Response({
        'available_offers': available_offers,
        'applied_offers': formatted_applied_offers
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_cart_offer(request):
    """Apply an offer to cart"""
    cart = get_object_or_404(Cart, user=request.user)
    offer_id = request.data.get('offer_id')
    
    if not offer_id:
        return Response({'error': 'Offer ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    cart_items = CartItem.objects.filter(cart=cart)
    if not cart_items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        offer = Offer.objects.get(id=offer_id, is_active=True)
    except Offer.DoesNotExist:
        return Response({'error': 'Offer not found or inactive'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if offer is expired
    if offer.is_expired():
        return Response({'error': 'This offer has expired'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check current applied offers
    current_applied = cart.applied_offers or []
    
    # Check if this offer is already applied (prevent duplicates)
    if any(o.get('offer_id') == offer.id for o in current_applied):
        return Response({'error': 'This offer is already applied'}, status=status.HTTP_400_BAD_REQUEST)
    
    # For manual offers, only allow 1
    if not offer.auto_apply:
        manual_offers = [o for o in current_applied if not o.get('auto_apply', False)]
        if len(manual_offers) >= 1:
            return Response({
                'error': 'You can only apply one manual offer. Remove the current offer to apply this one.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Apply the offer
    result = offer.apply_offer(cart_items, request.user)
    if not result['success']:
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    
    # Add to applied offers
    new_offer = {
        'offer_id': offer.id,
        'offer_name': result['offer_name'],
        'offer_type': result['offer_type'],
        'discount_amount': float(result['discount_amount']),
        'badge_text': result.get('badge_text', ''),
        'auto_apply': offer.auto_apply
    }
    
    # If it's a manual offer, replace any existing manual offer
    if not offer.auto_apply:
        # Keep only auto offers and add this manual offer
        auto_offers = [o for o in current_applied if o.get('auto_apply', False)]
        cart.applied_offers = auto_offers + [new_offer]
    else:
        # Add auto offer (multiple auto offers allowed)
        cart.applied_offers = current_applied + [new_offer]
    
    cart.save()
    
    return Response({
        'success': True,
        'message': f'Offer "{offer.name}" applied successfully!',
        'discount_amount': result['discount_amount']
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_cart_offer(request):
    """Remove an offer from cart (only manual offers can be removed)"""
    cart = get_object_or_404(Cart, user=request.user)
    offer_id = request.data.get('offer_id')
    
    if not offer_id:
        return Response({'error': 'Offer ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        offer = Offer.objects.get(id=offer_id)
        if offer.auto_apply:
            return Response({'error': 'Auto-apply offers cannot be manually removed'}, status=status.HTTP_400_BAD_REQUEST)
    except Offer.DoesNotExist:
        pass
    
    current_offers = cart.applied_offers or []
    updated_offers = [o for o in current_offers if o.get('offer_id') != int(offer_id)]
    
    cart.applied_offers = updated_offers
    cart.save()
    
    return Response({
        'success': True,
        'message': 'Offer removed successfully'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_offer(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from django.utils.dateparse import parse_datetime
        
        # Debug: Log the incoming data
        print(f"Received offer data: {request.data}")
        
        # Validate required fields
        required_fields = ['name', 'offer_type', 'start_date', 'end_date']
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'Field {field} is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique code if not provided
        code = request.data.get('code', '').upper()
        if not code:
            import random, string
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Check if code already exists
        if Offer.objects.filter(code=code).exists():
            return Response({'error': 'Offer code already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get offer type
        offer_type = request.data.get('offer_type', 'discount')
        
        # Parse and validate dates
        try:
            start_date_str = request.data.get('start_date')
            if 'T' not in start_date_str:
                start_date_str += 'T00:00:00'
            start_date = parse_datetime(start_date_str)
            
            end_date_str = request.data.get('end_date')
            if 'T' not in end_date_str:
                end_date_str += 'T23:59:59'
            end_date = parse_datetime(end_date_str)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not start_date:
            return Response({'error': 'Invalid start date format'}, status=status.HTTP_400_BAD_REQUEST)
        if not end_date:
            return Response({'error': 'Invalid end date format'}, status=status.HTTP_400_BAD_REQUEST)
        if start_date >= end_date:
            return Response({'error': 'End date must be after start date'}, status=status.HTTP_400_BAD_REQUEST)
        
        offer = Offer.objects.create(
            name=request.data.get('name'),
            code=code,
            description=request.data.get('description', ''),
            offer_type=offer_type,
            discount_percentage=float(request.data.get('discount_percentage', 0)),
            flat_discount=float(request.data.get('flat_discount', 0)),
            buy_quantity=int(request.data.get('buy_quantity', 1)),
            get_quantity=int(request.data.get('get_quantity', 1)),
            min_order_value=float(request.data.get('min_order_value', 0)),
            priority=request.data.get('priority', 'medium'),
            start_date=start_date,
            end_date=end_date,
            is_active=request.data.get('is_active', True),
            auto_apply=request.data.get('auto_apply', False),
            first_time_only=request.data.get('first_time_only', False),
            badge_text=request.data.get('badge_text', '')
        )
        
        # Set products
        product_ids = request.data.get('product_ids', [])
        if product_ids:
            products = Product.objects.filter(id__in=product_ids)
            offer.products.set(products)
        
        # Set categories
        category_ids = request.data.get('category_ids', [])
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            offer.categories.set(categories)
        

        
        # Set free product for buy_x_get_y
        free_product_id = request.data.get('free_product_id')
        if free_product_id:
            offer.free_product = Product.objects.get(id=free_product_id)
            offer.save()
        
        serializer = OfferSerializer(offer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        print(f"ValueError in offer creation: {str(e)}")
        return Response({'error': f'Invalid data format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Exception in offer creation: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_offers(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get all offers for admin (don't auto-delete, let admin decide)
    offers = Offer.objects.all().order_by('-created_at')
    serializer = OfferSerializer(offers, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_offer(request, offer_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from django.utils import timezone
        from django.utils.dateparse import parse_datetime
        
        offer = get_object_or_404(Offer, id=offer_id)
        
        # Update all fields from request data
        if 'name' in request.data:
            offer.name = request.data['name']
        if 'code' in request.data:
            offer.code = request.data['code']
        if 'description' in request.data:
            offer.description = request.data['description']
        if 'offer_type' in request.data:
            offer.offer_type = request.data['offer_type']
        if 'is_active' in request.data:
            offer.is_active = request.data['is_active']
        if 'discount_percentage' in request.data:
            offer.discount_percentage = request.data['discount_percentage']
        if 'flat_discount' in request.data:
            offer.flat_discount = request.data['flat_discount']
        if 'buy_quantity' in request.data:
            offer.buy_quantity = request.data['buy_quantity']
        if 'get_quantity' in request.data:
            offer.get_quantity = request.data['get_quantity']
        if 'min_order_value' in request.data:
            offer.min_order_value = request.data['min_order_value']
        if 'priority' in request.data:
            offer.priority = request.data['priority']
        if 'badge_text' in request.data:
            offer.badge_text = request.data['badge_text']
        if 'auto_apply' in request.data:
            offer.auto_apply = request.data['auto_apply']
        if 'first_time_only' in request.data:
            offer.first_time_only = request.data['first_time_only']
        
        # Handle date fields with validation
        if 'start_date' in request.data and request.data['start_date']:
            try:
                start_date_str = request.data['start_date']
                if 'T' not in start_date_str:
                    start_date_str += 'T00:00:00'
                start_date = parse_datetime(start_date_str)
                if start_date:
                    offer.start_date = start_date
            except (ValueError, TypeError):
                return Response({'error': 'Invalid start date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'end_date' in request.data and request.data['end_date']:
            try:
                end_date_str = request.data['end_date']
                if 'T' not in end_date_str:
                    end_date_str += 'T23:59:59'
                end_date = parse_datetime(end_date_str)
                if end_date:
                    offer.end_date = end_date
            except (ValueError, TypeError):
                return Response({'error': 'Invalid end date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        offer.save()
        
        # Update relationships
        if 'product_ids' in request.data:
            products = Product.objects.filter(id__in=request.data['product_ids'])
            offer.products.set(products)
        
        if 'category_ids' in request.data:
            categories = Category.objects.filter(id__in=request.data['category_ids'])
            offer.categories.set(categories)
        

        
        if 'free_product_id' in request.data and request.data['free_product_id']:
            try:
                offer.free_product = Product.objects.get(id=request.data['free_product_id'])
            except Product.DoesNotExist:
                offer.free_product = None
        elif 'free_product_id' in request.data:
            offer.free_product = None
        
        offer.save()
        
        serializer = OfferSerializer(offer)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_offer(request, offer_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    offer = get_object_or_404(Offer, id=offer_id)
    offer.delete()
    return Response({'message': 'Offer deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_revoke_offer(request, offer_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        offer = get_object_or_404(Offer, id=offer_id)
        offer.is_active = False
        offer.save()
        
        # Remove this offer from all active carts
        from .models import Cart
        carts_with_offer = Cart.objects.filter(applied_offers__isnull=False)
        
        for cart in carts_with_offer:
            if cart.applied_offers:
                # Remove the revoked offer from cart
                updated_offers = []
                for applied_offer in cart.applied_offers:
                    if applied_offer.get('offer_id') != offer_id:
                        updated_offers.append(applied_offer)
                
                cart.applied_offers = updated_offers
                cart.save()
        
        return Response({
            'success': True,
            'message': f'Offer "{offer.name}" has been revoked and removed from all active carts'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_offer_usage_stats(request, offer_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        offer = get_object_or_404(Offer, id=offer_id)
        
        # Count actual usage from orders
        actual_usage = 0
        orders_with_offer = Order.objects.all()
        matching_orders = []
        
        for order in orders_with_offer:
            if order.applied_offers:
                for applied_offer in order.applied_offers:
                    if applied_offer.get('offer_id') == offer_id:
                        actual_usage += 1
                        matching_orders.append({
                            'order_id': order.order_id,
                            'created_at': order.created_at.isoformat(),
                            'user': order.user.username
                        })
                        break
        
        # Update the offer's used_count if it's different
        old_count = offer.used_count
        if offer.used_count != actual_usage:
            offer.used_count = actual_usage
            offer.save()
        
        return Response({
            'offer_id': offer_id,
            'offer_name': offer.name,
            'old_count': old_count,
            'used_count': actual_usage,
            'matching_orders': matching_orders,
            'total_orders_checked': orders_with_offer.count()
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_offer_usage(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get all offers and their usage
        offers = Offer.objects.all()
        orders = Order.objects.all()
        
        debug_info = {
            'total_offers': offers.count(),
            'total_orders': orders.count(),
            'offers_data': [],
            'recent_orders': []
        }
        
        # Check each offer
        for offer in offers:
            actual_usage = 0
            matching_orders = []
            
            for order in orders:
                if order.applied_offers:
                    for applied_offer in order.applied_offers:
                        if applied_offer.get('offer_id') == offer.id:
                            actual_usage += 1
                            matching_orders.append(order.order_id)
                            break
            
            debug_info['offers_data'].append({
                'id': offer.id,
                'name': offer.name,
                'code': offer.code,
                'stored_count': offer.used_count,
                'actual_count': actual_usage,
                'matching_orders': matching_orders
            })
        
        # Get recent orders with offers
        for order in orders.order_by('-created_at')[:10]:
            if order.applied_offers:
                debug_info['recent_orders'].append({
                    'order_id': order.order_id,
                    'user': order.user.username,
                    'created_at': order.created_at.isoformat(),
                    'applied_offers': order.applied_offers
                })
        
        return Response(debug_info)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Category Admin Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_category(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        name = request.data.get('name')
        slug = request.data.get('slug')
        
        if Category.objects.filter(slug=slug).exists():
            return Response({'error': 'Category with this slug already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        category = Category.objects.create(
            name=name,
            slug=slug
        )
        
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_category(request, category_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        category = get_object_or_404(Category, id=category_id)
        
        if 'name' in request.data:
            category.name = request.data['name']
        if 'slug' in request.data:
            category.slug = request.data['slug']
        
        category.save()
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_category(request, category_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        category = get_object_or_404(Category, id=category_id)
        category.delete()
        return Response({'message': 'Category deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_offer(request, offer_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        offer = get_object_or_404(Offer, id=offer_id)
        serializer = OfferSerializer(offer)
        return Response(serializer.data)
    except Offer.DoesNotExist:
        return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_cleanup_expired_offers(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from .offer_cleanup import cleanup_expired_offers
    result = cleanup_expired_offers()
    
    return Response({
        'success': True,
        'message': f'Cleanup completed: {result["expired_offers_deleted"]} offers deleted, {result["carts_updated"]} carts updated',
        'expired_offers_deleted': result['expired_offers_deleted'],
        'carts_updated': result['carts_updated']
    })

# Search Views
@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    try:
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'products': [], 'brands': [], 'categories': []})
        
        # Product name suggestions
        product_suggestions = Product.objects.filter(
            name__icontains=query, available=True
        ).values_list('name', flat=True).distinct()[:5]
        
        # Brand suggestions
        brand_suggestions = Product.objects.filter(
            brand__icontains=query, available=True
        ).exclude(brand__isnull=True).exclude(brand__exact='').values_list('brand', flat=True).distinct()[:3]
        
        # Category suggestions
        category_suggestions = Category.objects.filter(
            name__icontains=query
        ).values_list('name', flat=True).distinct()[:3]
        
        suggestions = {
            'products': list(product_suggestions),
            'brands': list(filter(None, brand_suggestions)),  # Remove empty brands
            'categories': list(category_suggestions)
        }
        
        return Response(suggestions)
    except Exception as e:
        print(f"Search suggestions error: {e}")
        return Response({'products': [], 'brands': [], 'categories': []})

@api_view(['GET'])
@permission_classes([AllowAny])
def popular_searches(request):
    try:
        from django.utils import timezone
        from datetime import timedelta
        from django.db import models
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        popular = SearchQuery.objects.filter(
            created_at__gte=thirty_days_ago,
            results_count__gt=0  # Only include searches that returned results
        ).values('query').annotate(
            search_count=models.Count('query')
        ).order_by('-search_count')[:10]
        
        popular_queries = [item['query'] for item in popular]
        
        # If no popular searches, return some default suggestions
        if not popular_queries:
            popular_queries = ['smartphones', 'laptops', 'headphones', 'cameras', 'gaming']
        
        return Response(popular_queries)
    except Exception as e:
        print(f"Popular searches error: {e}")
        # Return default popular searches on error
        return Response(['smartphones', 'laptops', 'headphones', 'cameras', 'gaming'])

@api_view(['GET'])
@permission_classes([AllowAny])
def search_filters(request):
    brands = Product.objects.filter(available=True).values_list('brand', flat=True).distinct()
    categories = Category.objects.all().values('id', 'name', 'slug')
    
    price_range = Product.objects.filter(available=True).aggregate(
        min_price=models.Min('price'),
        max_price=models.Max('price')
    )
    
    return Response({
        'brands': list(filter(None, brands)),
        'categories': list(categories),
        'price_range': price_range
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def track_search(request):
    query = request.data.get('query', '').strip()
    results_count = request.data.get('results_count', 0)
    
    if query:
        SearchQuery.objects.create(
            query=query,
            user=request.user if request.user.is_authenticated else None,
            results_count=results_count,
            ip_address=request.META.get('REMOTE_ADDR')
        )
    
    return Response({'status': 'tracked'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = get_object_or_404(Order, id=order_id, user=request.user)
        
        if order.status not in ['pending', 'confirmed']:
            return Response({'error': 'Order cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate 70% refund
        refund_amount = float(order.total_amount) * 0.7
        
        # Update order status
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'success': True,
            'message': 'Order cancelled successfully',
            'refund_amount': refund_amount
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    import stripe
    stripe.api_key = 'sk_test_51RieweIC3UmOEaMXwWX2vzpioUXkLq9UKrkM5IxV6uYrwvwZoIPGuC4J9SJ30s8rmHlchSuDH5ykMLsK9wPtXgRv00My4jOQTb'
    
    try:
        amount = request.data.get('amount')
        
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='inr',
            metadata={'user_id': request.user.id}
        )
        
        return Response({
            'client_secret': intent.client_secret
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Product Offers Views
@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_offers(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    from django.utils import timezone
    now = timezone.now()
    
    # Get only active and non-expired offers for this product
    active_offers = Offer.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gt=now
    ).filter(
        Q(products=product) | Q(categories=product.category)
    ).distinct()
    
    offers_data = []
    for offer in active_offers:
        # Skip expired offers
        if offer.is_expired():
            continue
            
        offer_data = {
            'id': offer.id,
            'code': offer.code,
            'name': offer.name,
            'offer_type': offer.offer_type,
            'badge_text': offer.get_badge_text(),
            'description': offer.description,
            'auto_apply': offer.auto_apply,
            'first_time_only': offer.first_time_only,
            'discount_percentage': float(offer.discount_percentage),
            'flat_discount': float(offer.flat_discount),
        }
        
        # Add category-specific data
        if offer.offer_type == 'category_offer':
            offer_data['categories'] = [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug
            } for c in offer.categories.all()]
        
        offers_data.append(offer_data)
    
    return Response({'offers': offers_data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_category_offers(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    from django.utils import timezone
    
    # Get active offers for this category
    active_offers = Offer.objects.filter(
        is_active=True,
        start_date__lte=timezone.now(),
        end_date__gte=timezone.now(),
        categories=category
    ).distinct()
    
    offers_data = []
    for offer in active_offers:
        offers_data.append({
            'id': offer.id,
            'code': offer.code,
            'name': offer.name,
            'offer_type': offer.offer_type,
            'badge_text': offer.get_badge_text(),
            'description': offer.description,
            'auto_apply': offer.auto_apply
        })
    
    return Response({'offers': offers_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_offer_code(request):
    code = request.data.get('code', '').upper()
    if not code:
        return Response({'error': 'Offer code required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from django.utils import timezone
        offer = Offer.objects.get(
            code=code,
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )
        
        # Check if user can use this offer
        user = request.user if request.user.is_authenticated else None
        can_use = offer.can_user_use(user)
        
        return Response({
            'valid': True,
            'offer': {
                'id': offer.id,
                'code': offer.code,
                'name': offer.name,
                'description': offer.description,
                'offer_type': offer.offer_type,
                'badge_text': offer.get_badge_text(),
                'can_use': can_use,
                'first_time_only': offer.first_time_only
            }
        })
    except Offer.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invalid or expired offer code'
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_first_time_offers(request):
    from django.utils import timezone
    
    first_time_offers = Offer.objects.filter(
        is_active=True,
        first_time_only=True,
        start_date__lte=timezone.now(),
        end_date__gte=timezone.now()
    )
    
    offers_data = []
    for offer in first_time_offers:
        offers_data.append({
            'id': offer.id,
            'code': offer.code,
            'name': offer.name,
            'description': offer.description,
            'offer_type': offer.offer_type,
            'badge_text': offer.get_badge_text(),
            'discount_percentage': float(offer.discount_percentage),
            'auto_apply': offer.auto_apply
        })
    
    return Response({'offers': offers_data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics_dashboard(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Sum, Count, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Get all data from database
    orders = Order.objects.all().select_related('user')
    products = Product.objects.all().select_related('category')
    users = User.objects.all()
    
    # Calculate revenue from final_amount (actual paid amount)
    total_revenue = 0
    completed_orders_list = []
    cancelled_orders_list = []
    today_sales = 0
    
    today = timezone.now().date()
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    for order in orders:
        amount = float(order.final_amount or order.total_amount)
        total_revenue += amount
        
        # Today's sales
        if order.created_at.date() == today:
            today_sales += amount
            
        # Categorize orders by status
        if order.status in ['delivered', 'shipped', 'completed']:
            completed_orders_list.append(order)
        elif order.status in ['cancelled', 'returned', 'refunded']:
            cancelled_orders_list.append(order)
    
    # Calculate refunds (cancelled orders)
    total_refunds = sum(float(order.final_amount or order.total_amount) for order in cancelled_orders_list)
    net_revenue = total_revenue - total_refunds
    
    # Calculate average daily sales (last 30 days)
    last_30_days_revenue = sum(
        float(order.final_amount or order.total_amount) 
        for order in orders 
        if order.created_at >= thirty_days_ago
    )
    avg_daily_sales = last_30_days_revenue / 30 if last_30_days_revenue else 0
    
    # Prepare stats
    stats = {
        'total_revenue': total_revenue,
        'net_revenue': net_revenue,
        'total_refunds': total_refunds,
        'today_sales': today_sales,
        'avg_daily_sales': avg_daily_sales,
        'completed_orders_count': len(completed_orders_list),
        'cancelled_orders': len(cancelled_orders_list),
        'refund_rate': (total_refunds / total_revenue * 100) if total_revenue > 0 else 0
    }
    
    # Serialize data for frontend
    orders_data = []
    for order in orders:
        orders_data.append({
            'id': order.id,
            'order_id': order.order_id,
            'user': {
                'username': order.user.username,
                'first_name': order.user.first_name,
                'last_name': order.user.last_name
            },
            'total_amount': float(order.total_amount),
            'final_amount': float(order.final_amount or order.total_amount),
            'status': order.status,
            'created_at': order.created_at.isoformat()
        })
    
    products_data = []
    for product in products:
        products_data.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'available': product.available,
            'category': {
                'id': product.category.id,
                'name': product.category.name,
                'slug': product.category.slug
            } if product.category else None
        })
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat()
        })
    
    return Response({
        'stats': stats,
        'orders': orders_data,
        'products': products_data,
        'users': users_data,
        'sales_data': {
            'avg_daily_sales': avg_daily_sales,
            'total_revenue': total_revenue
        },
        'revenue_data': {
            'total_revenue': total_revenue,
            'net_revenue': net_revenue
        },
        'refund_data': {
            'total_refunds': total_refunds,
            'refund_rate': stats['refund_rate']
        }
    })