from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Offer, Cart, CartItem, Product

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_combo_eligibility(request, offer_id):
    """Check if all products required for a combo offer are in the user's cart"""
    try:
        # Get the offer
        offer = get_object_or_404(Offer, id=offer_id, offer_type='combo')
        
        # Get user's cart
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        # Get product IDs in cart
        cart_product_ids = set(cart_items.values_list('product_id', flat=True))
        
        # Get combo product IDs
        combo_product_ids = set(offer.combo_products.values_list('id', flat=True))
        
        # Find missing products
        missing_product_ids = combo_product_ids - cart_product_ids
        missing_products_data = []
        
        if missing_product_ids:
            missing_products = Product.objects.filter(id__in=missing_product_ids)
            missing_products_data = [{
                'id': p.id,
                'name': p.name,
                'price': float(p.price),
                'image_url': p.image_url,
                'slug': p.slug
            } for p in missing_products]
        
        return Response({
            'eligible': len(missing_product_ids) == 0,
            'missing_products': missing_products_data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)