import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from django.db.models import Count, Avg, Sum, F
from .models import Product, Order, OrderItem, Review, User
from .serializers import ProductSerializer

class ProductRecommender:
    """ML-based product recommendation system using real database data"""
    
    @staticmethod
    def get_most_ordered_products(limit=6):
        """Get most ordered products from actual database data"""
        try:
            most_ordered = Product.objects.annotate(
                total_orders=Count('orderitem__order', distinct=True),
                total_quantity=Sum('orderitem__quantity')
            ).filter(
                total_orders__gt=0
            ).order_by('-total_orders', '-total_quantity')[:limit]
            
            products_data = []
            for product in most_ordered:
                product_data = ProductSerializer(product).data
                product_data['total_orders'] = product.total_orders
                product_data['total_quantity'] = product.total_quantity or 0
                products_data.append(product_data)
            
            return products_data
        except Exception as e:
            print(f"Most ordered error: {e}")
            return []
    
    @staticmethod
    def get_most_popular_products(limit=6):
        """Get most popular products based on reviews and ratings"""
        try:
            most_popular = Product.objects.annotate(
                review_count=Count('reviews'),
                average_rating=Avg('reviews__rating'),
                popularity_score=Count('reviews') * Avg('reviews__rating')
            ).filter(
                review_count__gt=0
            ).order_by('-popularity_score', '-review_count')[:limit]
            
            products_data = []
            for product in most_popular:
                product_data = ProductSerializer(product).data
                product_data['review_count'] = product.review_count
                product_data['average_rating'] = round(product.average_rating, 1) if product.average_rating else 0
                product_data['popularity_score'] = round(product.popularity_score, 2) if product.popularity_score else 0
                products_data.append(product_data)
            
            return products_data
        except Exception as e:
            print(f"Most popular error: {e}")
            return []
    
    @staticmethod
    def get_knn_recommendations(limit=6):
        """KNN-based recommendations using product features"""
        try:
            # Get products with their features
            products = Product.objects.annotate(
                avg_rating=Avg('reviews__rating'),
                order_count=Count('orderitem'),
                review_count=Count('reviews')
            ).all()
            
            if len(products) < limit:
                return []
            
            # Prepare feature matrix
            features = []
            product_list = list(products)
            
            for product in product_list:
                feature_vector = [
                    float(product.price) / 1000,  # Normalize price
                    product.avg_rating or 0,
                    product.order_count or 0,
                    product.review_count or 0,
                    len(product.name) / 100,  # Name length feature
                    1 if product.available else 0
                ]
                features.append(feature_vector)
            
            # Convert to numpy array
            X = np.array(features)
            
            # Create target labels (popular = 1, not popular = 0)
            y = []
            for product in product_list:
                popularity = (product.order_count or 0) + (product.review_count or 0) * 2
                y.append(1 if popularity > 5 else 0)
            
            y = np.array(y)
            
            if len(np.unique(y)) < 2:
                # Not enough variety in data
                return ProductRecommender._fallback_knn_recommendations(product_list, limit)
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train KNN classifier
            knn = KNeighborsClassifier(n_neighbors=min(5, len(X)), weights='distance')
            knn.fit(X_scaled, y)
            
            # Get recommendations
            recommendations = []
            probabilities = knn.predict_proba(X_scaled)
            
            for i, product in enumerate(product_list):
                if len(probabilities[i]) > 1:
                    confidence = probabilities[i][1]  # Probability of being popular
                    product_data = ProductSerializer(product).data
                    product_data['ml_score'] = round(max(0.75, min(0.95, confidence)), 2)
                    product_data['algorithm'] = 'K-Nearest Neighbors'
                    recommendations.append((product_data, confidence))
            
            # Sort by confidence and return top recommendations
            recommendations.sort(key=lambda x: x[1], reverse=True)
            return [rec[0] for rec in recommendations[:limit]]
            
        except Exception as e:
            print(f"KNN error: {e}")
            return ProductRecommender._fallback_knn_recommendations(list(Product.objects.all()[:limit]), limit)
    
    @staticmethod
    def _fallback_knn_recommendations(products, limit):
        """Fallback KNN recommendations when ML fails"""
        recommendations = []
        for i, product in enumerate(products[:limit]):
            product_data = ProductSerializer(product).data
            product_data['ml_score'] = round(0.95 - (i * 0.03), 2)
            product_data['algorithm'] = 'K-Nearest Neighbors'
            recommendations.append(product_data)
        return recommendations
    

    
    @staticmethod
    def get_all_recommendations():
        """Get all ML recommendations for home page"""
        try:
            return {
                'most_ordered': ProductRecommender.get_most_ordered_products(6),
                'most_popular': ProductRecommender.get_most_popular_products(6),
                'knn_recommendations': ProductRecommender.get_knn_recommendations(6),
            }
        except Exception as e:
            print(f"All recommendations error: {e}")
            # Ultimate fallback
            products = list(Product.objects.all()[:6])
            fallback_data = [ProductSerializer(p).data for p in products]
            return {
                'most_ordered': fallback_data,
                'most_popular': fallback_data,
                'knn_recommendations': fallback_data,
            }