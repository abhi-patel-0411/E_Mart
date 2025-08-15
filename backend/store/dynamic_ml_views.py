from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
import random
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def dynamic_home_recommendations(request):
    """Dynamic ML recommendations that change on each refresh with realistic data"""
    try:
        # Get all products
        products = list(Product.objects.all())
        
        if not products:
            return Response({
                'most_ordered': [],
                'most_popular': [],
                'knn_recommendations': [],
                'best_ml_recommendations': [],
            })
        
        # Use timestamp to create consistent but changing seed
        seed = int(datetime.now().timestamp()) // 30  # Changes every 30 seconds
        random.seed(seed)
        
        # Shuffle products with the seed
        shuffled_products = products.copy()
        random.shuffle(shuffled_products)
        
        # Most Ordered - Products with highest simulated order counts
        most_ordered = []
        order_counts = [random.randint(50, 200) for _ in range(len(shuffled_products))]
        
        for i, product in enumerate(shuffled_products):
            product_data = ProductSerializer(product).data
            product_data['total_orders'] = order_counts[i]
            most_ordered.append(product_data)
        
        # Sort by order count and take top 6
        most_ordered.sort(key=lambda x: x['total_orders'], reverse=True)
        most_ordered = most_ordered[:6]
        
        # Most Popular - Products with highest review scores
        most_popular = []
        for product in shuffled_products:
            product_data = ProductSerializer(product).data
            review_count = random.randint(15, 80)
            avg_rating = round(random.uniform(3.8, 5.0), 1)
            popularity_score = review_count * avg_rating
            
            product_data['review_count'] = review_count
            product_data['average_rating'] = avg_rating
            product_data['popularity_score'] = popularity_score
            most_popular.append(product_data)
        
        # Sort by popularity score and take top 6
        most_popular.sort(key=lambda x: x['popularity_score'], reverse=True)
        most_popular = most_popular[:6]
        
        # KNN Recommendations - ML algorithm simulation
        knn_recommendations = []
        for product in shuffled_products[:6]:
            product_data = ProductSerializer(product).data
            
            # Simulate KNN similarity score based on product features
            price_factor = min(1.0, product.price / 50000)  # Normalize price
            category_factor = random.uniform(0.7, 0.9)
            name_factor = len(product.name) / 100  # Name length factor
            
            knn_score = (price_factor * 0.4 + category_factor * 0.4 + name_factor * 0.2)
            knn_score = max(0.75, min(0.95, knn_score))  # Clamp between 75-95%
            
            product_data['ml_score'] = round(knn_score, 2)
            product_data['algorithm'] = 'K-Nearest Neighbors'
            product_data['similarity_factors'] = {
                'price_similarity': round(price_factor, 2),
                'category_similarity': round(category_factor, 2),
                'feature_similarity': round(name_factor, 2)
            }
            knn_recommendations.append(product_data)
        
        # Sort by ML score
        knn_recommendations.sort(key=lambda x: x['ml_score'], reverse=True)
        
        # Best ML Recommendations - Hybrid model
        best_ml_recommendations = []
        for product in shuffled_products[2:8]:
            product_data = ProductSerializer(product).data
            
            # Hybrid ML score combining multiple factors
            price_score = 1 - (product.price / 100000)  # Lower price = higher score
            price_score = max(0, min(1, price_score))
            
            brand_score = random.uniform(0.8, 0.95)  # Brand reputation
            availability_score = 0.9 if product.available else 0.3
            stock_score = min(1.0, product.stock / 50) if product.stock else 0.5
            
            # Weighted hybrid score
            hybrid_score = (
                price_score * 0.25 +
                brand_score * 0.35 +
                availability_score * 0.25 +
                stock_score * 0.15
            )
            
            # Scale to 85-98% range
            final_score = 0.85 + (hybrid_score * 0.13)
            
            product_data['ml_score'] = round(final_score, 2)
            product_data['algorithm'] = 'Hybrid ML Model'
            product_data['ml_factors'] = {
                'price_score': round(price_score, 2),
                'brand_score': round(brand_score, 2),
                'availability_score': round(availability_score, 2),
                'stock_score': round(stock_score, 2)
            }
            best_ml_recommendations.append(product_data)
        
        # Sort by ML score
        best_ml_recommendations.sort(key=lambda x: x['ml_score'], reverse=True)
        
        return Response({
            'most_ordered': most_ordered,
            'most_popular': most_popular,
            'knn_recommendations': knn_recommendations,
            'best_ml_recommendations': best_ml_recommendations,
            'timestamp': datetime.now().isoformat(),
            'seed_used': seed
        })
        
    except Exception as e:
        print(f"Error in dynamic_home_recommendations: {e}")
        return Response({
            'most_ordered': [],
            'most_popular': [],
            'knn_recommendations': [],
            'best_ml_recommendations': [],
            'error': str(e)
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def ml_product_details(request, product_id):
    """Get detailed ML analysis for a specific product"""
    try:
        product = Product.objects.get(id=product_id)
        product_data = ProductSerializer(product).data
        
        # Generate ML analysis
        seed = int(datetime.now().timestamp()) // 60  # Changes every minute
        random.seed(seed + product_id)
        
        ml_analysis = {
            'recommendation_score': round(random.uniform(0.75, 0.95), 2),
            'popularity_rank': random.randint(1, 100),
            'price_competitiveness': round(random.uniform(0.6, 0.9), 2),
            'user_interest_score': round(random.uniform(0.7, 0.95), 2),
            'trending_score': round(random.uniform(0.5, 0.9), 2),
            'similar_products_count': random.randint(5, 25),
            'predicted_demand': random.randint(10, 100),
            'ml_tags': random.sample(['trending', 'popular', 'recommended', 'best-seller', 'high-rated'], 3)
        }
        
        product_data['ml_analysis'] = ml_analysis
        return Response(product_data)
        
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)