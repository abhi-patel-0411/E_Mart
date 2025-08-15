from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Product

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_toggle_product_availability(request, product_id):
    """Toggle product availability status"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = get_object_or_404(Product, id=product_id)
        product.available = not product.available
        product.save()
        
        return Response({
            'id': product.id,
            'name': product.name,
            'available': product.available,
            'message': f"Product {'activated' if product.available else 'deactivated'} successfully"
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)