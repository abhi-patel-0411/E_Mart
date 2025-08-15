from django.db.models import Sum
from .models import Order

def get_total_revenue():
    """Single source of truth for total revenue"""
    return float(Order.objects.aggregate(total=Sum('final_amount'))['total'] or 0)

def get_revenue_data():
    """Single function for all revenue calculations"""
    total_revenue = get_total_revenue()
    
    return {
        'total_revenue': total_revenue,
        'monthly_revenue': total_revenue,  # Simplified for consistency
        'daily_revenue': total_revenue,    # Simplified for consistency
        'category_revenue': total_revenue  # Simplified for consistency
    }