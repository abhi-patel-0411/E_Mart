from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Sum
from .models import Order

@api_view(['GET'])
@permission_classes([AllowAny])  # Keep open for now
def revenue_refund_analytics(request):
    try:
        from .revenue_utils import get_total_revenue
        
        total_revenue = get_total_revenue()
        cancelled_orders = Order.objects.filter(status='cancelled')
        total_refunds = float((cancelled_orders.aggregate(total=Sum('final_amount'))['total'] or 0) * 0.7)
        
        monthly_data = [{
            'month': 'Total',
            'revenue': total_revenue,
            'refunds': total_refunds,
            'orders_count': Order.objects.count(),
            'cancelled_count': cancelled_orders.count()
        }]
        
        return Response({
            'monthly_data': monthly_data,
            'total_revenue': total_revenue,
            'total_refunds': total_refunds,
            'refund_rate': round((total_refunds / total_revenue * 100) if total_revenue > 0 else 0, 2),
            'data_source': 'database'
        })
        
    except Exception as e:
        # Return sample data if there's an error
        sample_data = [
            {'month': 'Jan', 'revenue': 45000, 'refunds': 3150, 'orders_count': 25, 'cancelled_count': 2},
            {'month': 'Feb', 'revenue': 52000, 'refunds': 2800, 'orders_count': 30, 'cancelled_count': 1},
            {'month': 'Mar', 'revenue': 48000, 'refunds': 4200, 'orders_count': 28, 'cancelled_count': 3},
            {'month': 'Apr', 'revenue': 55000, 'refunds': 3500, 'orders_count': 32, 'cancelled_count': 2},
            {'month': 'May', 'revenue': 61000, 'refunds': 2100, 'orders_count': 35, 'cancelled_count': 1},
            {'month': 'Jun', 'revenue': 58000, 'refunds': 5600, 'orders_count': 33, 'cancelled_count': 4},
            {'month': 'Jul', 'revenue': 63000, 'refunds': 2800, 'orders_count': 38, 'cancelled_count': 2}
        ]
        
        return Response({
            'monthly_data': sample_data,
            'total_revenue': 382000,
            'total_refunds': 24150,
            'refund_rate': 6.3,
            'data_source': 'sample'
        })