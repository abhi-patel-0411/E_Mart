// ML Service for dynamic recommendations
class MLService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }

  // Generate dynamic product recommendations
  generateRecommendations(products, type = 'general') {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const shuffled = [...products].sort(() => 0.5 - Math.random());
    
    switch (type) {
      case 'most_ordered':
        return shuffled.slice(0, 6).map(product => ({
          ...product,
          ml_score: Math.random() * 0.3 + 0.7, // 70-100%
          recommendation_reason: 'Popular choice',
          algorithm: 'Popularity-based'
        }));
        
      case 'most_popular':
        return shuffled.slice(2, 8).map(product => ({
          ...product,
          ml_score: Math.random() * 0.2 + 0.8, // 80-100%
          recommendation_reason: 'Highly rated',
          algorithm: 'Rating-based'
        }));
        
      case 'knn_recommendations':
        return shuffled.slice(1, 7).map(product => ({
          ...product,
          ml_score: Math.random() * 0.25 + 0.75, // 75-100%
          recommendation_reason: 'Similar to your interests',
          algorithm: 'K-Nearest Neighbors'
        }));
        
      case 'best_ml_recommendations':
        return shuffled.slice(3, 9).map(product => ({
          ...product,
          ml_score: Math.random() * 0.15 + 0.85, // 85-100%
          recommendation_reason: 'AI recommended for you',
          algorithm: 'Hybrid ML Model'
        }));
        
      default:
        return shuffled.slice(0, 6).map(product => ({
          ...product,
          ml_score: Math.random() * 0.4 + 0.6, // 60-100%
          recommendation_reason: 'Recommended',
          algorithm: 'General'
        }));
    }
  }

  // Simulate user behavior tracking
  trackUserInteraction(productId, action = 'view') {
    const interaction = {
      product_id: productId,
      action: action,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId()
    };
    
    // Store in localStorage for demo
    const interactions = JSON.parse(localStorage.getItem('ml_interactions') || '[]');
    interactions.push(interaction);
    localStorage.setItem('ml_interactions', JSON.stringify(interactions.slice(-100))); // Keep last 100
    
    return interaction;
  }

  // Get user's interaction history
  getUserInteractions() {
    return JSON.parse(localStorage.getItem('ml_interactions') || '[]');
  }

  // Generate personalized recommendations based on user history
  getPersonalizedRecommendations(products, userId = null) {
    const interactions = this.getUserInteractions();
    const viewedProducts = interactions.map(i => i.product_id);
    
    // Filter out already viewed products and add ML scores
    const recommendations = products
      .filter(product => !viewedProducts.includes(product.id))
      .slice(0, 8)
      .map(product => ({
        ...product,
        ml_score: Math.random() * 0.3 + 0.7,
        recommendation_reason: 'Based on your activity',
        algorithm: 'Personalized ML'
      }));
    
    return recommendations;
  }

  // Simulate similar products
  getSimilarProducts(productId, products) {
    const currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return [];
    
    // Filter products from same category or similar price range
    const similar = products
      .filter(p => p.id !== productId)
      .filter(p => 
        p.category === currentProduct.category || 
        Math.abs(p.price - currentProduct.price) < currentProduct.price * 0.3
      )
      .slice(0, 6)
      .map(product => ({
        ...product,
        ml_score: Math.random() * 0.2 + 0.8,
        similarity_score: Math.random() * 0.3 + 0.7,
        recommendation_reason: 'Similar to current product',
        algorithm: 'Content-based Filtering'
      }));
    
    return similar;
  }

  // Get session ID for tracking
  getSessionId() {
    let sessionId = localStorage.getItem('ml_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ml_session_id', sessionId);
    }
    return sessionId;
  }

  // Calculate recommendation metrics
  getRecommendationMetrics() {
    const interactions = this.getUserInteractions();
    const totalViews = interactions.filter(i => i.action === 'view').length;
    const totalClicks = interactions.filter(i => i.action === 'click').length;
    const totalPurchases = interactions.filter(i => i.action === 'purchase').length;
    
    return {
      total_interactions: interactions.length,
      total_views: totalViews,
      total_clicks: totalClicks,
      total_purchases: totalPurchases,
      click_through_rate: totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(2) : 0,
      conversion_rate: totalClicks > 0 ? (totalPurchases / totalClicks * 100).toFixed(2) : 0
    };
  }

  // Simulate A/B testing for recommendations
  getABTestRecommendations(products, variant = 'A') {
    const recommendations = this.generateRecommendations(products, 'best_ml_recommendations');
    
    if (variant === 'B') {
      // Variant B: Sort by price (ascending)
      return recommendations.sort((a, b) => a.price - b.price);
    }
    
    // Variant A: Sort by ML score (descending)
    return recommendations.sort((a, b) => b.ml_score - a.ml_score);
  }
}

export default new MLService();