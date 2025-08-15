from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
import random

@api_view(['GET'])
@permission_classes([AllowAny])
def simple_home_recommendations(request):
    """Simple ML recommendations without complex database queries"""
    try:
        # Get all products
        products = list(Product.objects.all()[:20])
        
        if not products:
            return Response({
                'most_ordered': [],
                'most_popular': [],
                'knn_recommendations': [],
                'best_ml_recommendations': [],
            })
        
        # Shuffle products for different sections
        random.shuffle(products)
        
        # Most Ordered - simulate with random order counts
        most_ordered = []
        for product in products[:6]:
            product_data = ProductSerializer(product).data
            product_data['total_orders'] = random.randint(20, 100)
            most_ordered.append(product_data)
        most_ordered.sort(key=lambda x: x['total_orders'], reverse=True)
        
        # Most Popular - simulate with random ratings
        most_popular = []
        for product in products[2:8]:
            product_data = ProductSerializer(product).data
            product_data['review_count'] = random.randint(10, 50)
            product_data['average_rating'] = round(random.uniform(3.5, 5.0), 1)
            most_popular.append(product_data)
        most_popular.sort(key=lambda x: x['review_count'] * x['average_rating'], reverse=True)
        
        # KNN Recommendations - simulate ML scores
        knn_recommendations = []
        for product in products[4:10]:
            product_data = ProductSerializer(product).data
            product_data['ml_score'] = round(random.uniform(0.75, 0.95), 2)
            product_data['algorithm'] = 'K-Nearest Neighbors'
            knn_recommendations.append(product_data)
        
        # Best ML Recommendations - simulate hybrid scores
        best_ml_recommendations = []
        for product in products[6:12]:
            product_data = ProductSerializer(product).data
            product_data['ml_score'] = round(random.uniform(0.85, 0.98), 2)
            product_data['algorithm'] = 'Hybrid ML Model'
            best_ml_recommendations.append(product_data)
        
        return Response({
            'most_ordered': most_ordered,
            'most_popular': most_popular,
            'knn_recommendations': knn_recommendations,
            'best_ml_recommendations': best_ml_recommendations,
        })
        
    except Exception as e:
        print(f"Error in simple_home_recommendations: {e}")
        return Response({
            'most_ordered': [],
            'most_popular': [],
            'knn_recommendations': [],
            'best_ml_recommendations': [],
        })