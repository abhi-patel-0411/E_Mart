from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Product, Order, User, Wishlist

def get_analytics_data():
    """Get comprehensive analytics data"""
    now = timezone.now()
    
    # Revenue analytics
    total_revenue = Order.objects.aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Time-based revenue
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)
    
    revenue_30_days = Order.objects.filter(
        created_at__gte=last_30_days
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    revenue_7_days = Order.objects.filter(
        created_at__gte=last_7_days
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Order analytics
    total_orders = Order.objects.count()
    completed_orders = Order.objects.filter(status='completed').count()
    pending_orders = Order.objects.filter(status='pending').count()
    
    # User analytics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    
    # Product analytics
    total_products = Product.objects.count()
    active_products = Product.objects.filter(available=True).count()
    low_stock_products = Product.objects.filter(stock__lte=5).count()
    
    # Top products by revenue (simulated)
    top_products = Product.objects.filter(available=True)[:10]
    
    # Daily revenue for last 7 days
    daily_revenue = []
    for i in range(7):
        date = now - timedelta(days=i)
        day_revenue = Order.objects.filter(
            created_at__date=date.date()
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        daily_revenue.append({
            'date': date.strftime('%Y-%m-%d'),
            'revenue': float(day_revenue)
        })
    
    # Order status distribution
    order_status = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Weekly user activity (simulated)
    weekly_activity = []
    for i in range(7):
        date = now - timedelta(days=i)
        # Simulate user activity based on orders
        activity = Order.objects.filter(
            created_at__date=date.date()
        ).count() * 5  # Multiply by 5 to simulate user sessions
        weekly_activity.append({
            'day': date.strftime('%a'),
            'activity': activity
        })
    
    return {
        'revenue': {
            'total': float(total_revenue),
            'last_30_days': float(revenue_30_days),
            'last_7_days': float(revenue_7_days),
            'daily': list(reversed(daily_revenue))
        },
        'orders': {
            'total': total_orders,
            'completed': completed_orders,
            'pending': pending_orders,
            'status_distribution': list(order_status)
        },
        'users': {
            'total': total_users,
            'active': active_users,
            'weekly_activity': list(reversed(weekly_activity))
        },
        'products': {
            'total': total_products,
            'active': active_products,
            'low_stock': low_stock_products,
            'top_products': [
                {
                    'id': p.id,
                    'name': p.name,
                    'price': float(p.price),
                    'image_url': p.image_url,
                    'stock': p.stock
                } for p in top_products
            ]
        },
        'conversion_rate': round((completed_orders / max(total_orders, 1)) * 100, 2)
    }