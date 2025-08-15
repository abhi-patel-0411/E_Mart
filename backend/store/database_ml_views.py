from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .ml_recommender import ProductRecommender
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def database_ml_recommendations(request):
    """ML recommendations using real database data and sklearn algorithms"""
    try:
        # Get all ML recommendations
        recommendations = ProductRecommender.get_all_recommendations()
        
        # Add metadata
        recommendations['timestamp'] = datetime.now().isoformat()
        recommendations['data_source'] = 'database'
        recommendations['ml_algorithms'] = ['KNN', 'Decision Tree']
        
        return Response(recommendations)
        
    except Exception as e:
        print(f"Database ML recommendations error: {e}")
        return Response({
            'most_ordered': [],
            'most_popular': [],
            'knn_recommendations': [],
            'best_ml_recommendations': [],
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def most_ordered_database(request):
    """Most ordered products from database"""
    try:
        products = ProductRecommender.get_most_ordered_products(6)
        return Response(products)
    except Exception as e:
        return Response({'error': str(e)})

@api_view(['GET'])
@permission_classes([AllowAny])
def most_popular_database(request):
    """Most popular products from database"""
    try:
        products = ProductRecommender.get_most_popular_products(6)
        return Response(products)
    except Exception as e:
        return Response({'error': str(e)})

@api_view(['GET'])
@permission_classes([AllowAny])
def knn_database_recommendations(request):
    """KNN recommendations using database data"""
    try:
        products = ProductRecommender.get_knn_recommendations(6)
        return Response(products)
    except Exception as e:
        return Response({'error': str(e)})

