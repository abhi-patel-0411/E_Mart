from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simple_checkout(request):
    """Proper checkout function that creates orders in the database"""
    try:
        # Get cart and items
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        if not cart_items:
            return Response({'error': 'Cart is empty!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        from decimal import Decimal
        applied_offers = cart.applied_offers or []
        
        # Use cart's calculation methods for consistency
        total = Decimal(str(cart.get_total_price()))
        discounted_total = Decimal(str(cart.get_discounted_total()))
        discount_amount = total - discounted_total
        final_amount = discounted_total
        
        # Create order
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
        from .models import Offer
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
        
        # Create order items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            
            # Update stock
            product = item.product
            product.stock = max(0, product.stock - item.quantity)
            if product.stock == 0:
                product.available = False
            product.save()
        
        # Clear cart
        cart_items.delete()
        cart.applied_offers = []
        cart.save()
        
        # Return order data
        return Response({
            'success': True,
            'order_id': order.order_id,
            'total_amount': float(order.total_amount),
            'final_amount': float(order.final_amount),
            'discount_amount': float(order.discount_amount),
            'message': 'Order placed successfully!'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)