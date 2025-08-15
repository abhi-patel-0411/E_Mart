@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Simplified checkout view that creates an order from the cart
    """
    try:
        # Get cart and items
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        if not cart_items:
            return Response({'error': 'Cart is empty!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        from decimal import Decimal
        total = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            order_id=f'ORD-{uuid.uuid4().hex[:8].upper()}',
            total_amount=total,
            discount_amount=0,
            final_amount=total,
            shipping_address=request.data.get('address', 'Default Address'),
            payment_method=request.data.get('payment_method', 'Cash on Delivery'),
            payment_status='completed'
        )
        
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
            'message': 'Order placed successfully!'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)