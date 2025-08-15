def update_checkout_stock(request):
    # Create a new function to update stock during checkout
    try:
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        # Update product stock
        for item in cart_items:
            product = item.product
            product.stock = max(0, product.stock - item.quantity)
            if product.stock == 0:
                product.available = False
            product.save()
            
        return True
    except Exception as e:
        print(f"Error updating stock: {str(e)}")
        return False