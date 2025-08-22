from django.urls import path
from . import views
from . import database_ml_views
from . import revenue_refund_views
from . import checkout_views
from . import payment_views


urlpatterns = [
    # Authentication - USED ✓
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    
    # Categories - USED ✓
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Products - USED ✓
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/', views.product_by_id, name='product-by-id'),  # Used by cart context
    
    # Cart - USED ✓
    path('cart/', views.get_cart, name='get-cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/<int:item_id>/', views.update_cart_item, name='update-cart-item'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/auto-apply-offers/', views.auto_apply_offers, name='auto-apply-offers'),  # Used by frontend
    path('cart/offers/', views.get_cart_offers, name='get-cart-offers'),  # UNUSED - Not in frontend API
    path('cart/apply-offer/', views.apply_cart_offer, name='apply-cart-offer'),  # UNUSED - Not in frontend API
    path('cart/remove-offer/', views.remove_cart_offer, name='remove-cart-offer'),  # UNUSED - Not in frontend API
    
    # Wishlist - USED ✓
    path('wishlist/', views.get_wishlist, name='get-wishlist'),
    path('wishlist/add/<int:product_id>/', views.add_to_wishlist, name='add-to-wishlist'),
    path('wishlist/remove/<int:product_id>/', views.remove_from_wishlist, name='remove-from-wishlist'),
    
    # Compare - USED ✓
    path('compare/', views.get_compare, name='get-compare'),
    path('compare/add/<int:product_id>/', views.add_to_compare, name='add-to-compare'),
    path('compare/remove/<int:product_id>/', views.remove_from_compare, name='remove-from-compare'),
    path('compare/clear/', views.clear_compare, name='clear-compare'),
    
    # Orders - USED ✓
    path('checkout/', checkout_views.simple_checkout, name='checkout'),
    path('orders/', views.order_history, name='order-history'),
    path('orders/<str:order_id>/', views.order_detail, name='order-detail'),
    path('orders/<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    path('create-payment-intent/', payment_views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', payment_views.confirm_payment, name='confirm-payment'),
    path('stripe-webhook/', payment_views.stripe_webhook, name='stripe-webhook'),
    
    # Reviews - PARTIALLY USED
    path('products/<slug:slug>/reviews/', views.product_reviews_by_slug, name='product-reviews-by-slug'),  # Used by frontend
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product-reviews'),
    path('products/<int:product_id>/reviews/add/', views.add_review, name='add-review'),
    
    # User Profile - USED ✓
    path('profile/', views.user_profile, name='user-profile'),
    
    # Analytics - UNUSED
    # path('analytics/dashboard/', views.analytics_dashboard, name='analytics-dashboard'),  # UNUSED - Not in frontend API
    
    # Admin Analytics - USED ✓
    path('admin/analytics/sales-prediction/', views.sales_prediction, name='sales-prediction'),
    path('admin/analytics/revenue-refunds/', revenue_refund_views.revenue_refund_analytics, name='revenue-refunds'),
    path('admin/analytics/dashboard/', views.admin_analytics_dashboard, name='admin-analytics-dashboard'),
    
    # Admin - PARTIALLY USED
    path('admin/analytics/stats/', views.admin_stats, name='admin-stats'),  # USED ✓ - Dashboard stats
    path('admin/products/', views.admin_products, name='admin-products'),
    path('admin/products/create/', views.admin_create_product, name='admin-create-product'),
    path('admin/products/update/<int:product_id>/', views.admin_update_product, name='admin-update-product'),
    path('admin/products/delete/<int:product_id>/', views.admin_delete_product, name='admin-delete-product'),
    path('admin/products/toggle/<int:product_id>/', views.admin_toggle_product_availability, name='admin-toggle-product'),
    path('admin/users/', views.admin_users, name='admin-users'),
    path('admin/users/create/', views.admin_create_user, name='admin-create-user'),
    path('admin/users/update/<int:user_id>/', views.admin_update_user, name='admin-update-user'),
    path('admin/users/ban/<int:user_id>/', views.admin_ban_user, name='admin-ban-user'),
    path('admin/users/delete/<int:user_id>/', views.admin_delete_user, name='admin-delete-user'),
    path('admin/orders/', views.admin_orders, name='admin-orders'),
    path('admin/orders/update/<int:order_id>/', views.admin_update_order_status, name='admin-update-order-status'),
    path('admin/wishlists/', views.admin_wishlists, name='admin-wishlists'),
    path('admin/wishlists/remove/<int:wishlist_id>/', views.admin_remove_wishlist, name='admin-remove-wishlist'),
    path('admin/compares/', views.admin_compares, name='admin-compares'),
    path('admin/compares/remove/<int:compare_id>/', views.admin_remove_compare, name='admin-remove-compare'),
    
    # Offers - ADMIN ONLY USED
    path('offers/active/', views.get_active_offers, name='get-active-offers'),  # UNUSED - Not in frontend API
    path('offers/apply/', views.apply_cart_offer, name='apply-offer-to-cart'),  # UNUSED - Duplicate
    path('offers/applicable/', views.get_applicable_offers, name='get-applicable-offers'),  # UNUSED - Not in frontend API
    path('offers/remove/', views.remove_cart_offer, name='remove-offer-from-cart'),  # UNUSED - Duplicate
    path('admin/offers/', views.admin_list_offers, name='admin-list-offers'),
    path('admin/offers/create/', views.admin_create_offer, name='admin-create-offer'),
    path('admin/offers/update/<int:offer_id>/', views.admin_update_offer, name='admin-update-offer'),
    path('admin/offers/delete/<int:offer_id>/', views.admin_delete_offer, name='admin-delete-offer'),
    path('admin/offers/revoke/<int:offer_id>/', views.admin_revoke_offer, name='admin-revoke-offer'),
    path('admin/offers/usage-stats/<int:offer_id>/', views.admin_offer_usage_stats, name='admin-offer-usage-stats'),
    path('admin/offers/debug-usage/', views.debug_offer_usage, name='debug-offer-usage'),
    path('admin/offers/<int:offer_id>/', views.admin_get_offer, name='admin-get-offer'),  # UNUSED - Not in frontend
    path('admin/offers/cleanup-expired/', views.admin_cleanup_expired_offers, name='admin-cleanup-expired-offers'),  # UNUSED - Not in frontend
    
    # Categories Admin - USED ✓
    path('admin/categories/create/', views.admin_create_category, name='admin-create-category'),
    path('admin/categories/update/<int:category_id>/', views.admin_update_category, name='admin-update-category'),
    path('admin/categories/delete/<int:category_id>/', views.admin_delete_category, name='admin-delete-category'),
    
    
    path('search/suggestions/', views.search_suggestions, name='search-suggestions'),  # UNUSED - Not implemented in frontend
    path('search/popular/', views.popular_searches, name='popular-searches'),  # UNUSED - Not implemented in frontend
    path('search/filters/', views.search_filters, name='search-filters'),  # UNUSED - Not implemented in frontend
    path('search/track/', views.track_search, name='track-search'),  # UNUSED - Not implemented in frontend
    
    
    path('products/<int:product_id>/offers/', views.get_product_offers, name='get-product-offers'),  # UNUSED - Not in frontend
    path('categories/<int:category_id>/offers/', views.get_category_offers, name='get-category-offers'),  # UNUSED - Not in frontend
    path('offers/validate/', views.validate_offer_code, name='validate-offer-code'),  # UNUSED - Not in frontend
    path('offers/first-time/', views.get_first_time_offers, name='get-first-time-offers'),  # UNUSED - Not in frontend
    
    # Database ML Recommendations (Primary) - USED ✓
    path('recommendations/home/', database_ml_views.database_ml_recommendations, name='database-ml-recommendations'),
    
]