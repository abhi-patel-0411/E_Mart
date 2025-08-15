# E-Mart API Documentation

## 🔗 Base URL
```
Development: http://localhost:8000/api/
Production: https://your-domain.com/api/
```

## 🔐 Authentication

### JWT Token Authentication
All protected endpoints require JWT token in header:
```javascript
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "first_name": "John",
  "last_name": "Doe"
}

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Login User
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_image": "http://localhost:8000/media/profiles/user1.jpg"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh Token
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 🛍️ Products API

### Get All Products
```http
GET /api/products/
Query Parameters:
- page: int (pagination)
- category: int (category ID)
- search: string (search query)
- min_price: float
- max_price: float
- ordering: string (price, -price, name, -created_at)
- is_featured: boolean

Response:
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "iPhone 14 Pro",
      "slug": "iphone-14-pro",
      "description": "Latest iPhone with advanced features",
      "price": "99999.00",
      "discounted_price": "89999.00",
      "category": {
        "id": 1,
        "name": "Smartphones",
        "slug": "smartphones"
      },
      "brand": "Apple",
      "image": "http://localhost:8000/media/products/iphone14.jpg",
      "images": [
        "http://localhost:8000/media/products/iphone14_1.jpg",
        "http://localhost:8000/media/products/iphone14_2.jpg"
      ],
      "rating": 4.5,
      "review_count": 128,
      "stock_quantity": 50,
      "is_featured": true,
      "ml_score": 0.85,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Single Product
```http
GET /api/products/{slug}/

Response:
{
  "id": 1,
  "name": "iPhone 14 Pro",
  "slug": "iphone-14-pro",
  "description": "Detailed product description...",
  "price": "99999.00",
  "discounted_price": "89999.00",
  "category": {
    "id": 1,
    "name": "Smartphones",
    "slug": "smartphones"
  },
  "brand": "Apple",
  "images": [...],
  "specifications": {
    "display": "6.1-inch Super Retina XDR",
    "processor": "A16 Bionic",
    "storage": "128GB",
    "camera": "48MP Main Camera"
  },
  "rating": 4.5,
  "review_count": 128,
  "reviews": [
    {
      "id": 1,
      "user": "John Doe",
      "rating": 5,
      "comment": "Excellent product!",
      "created_at": "2024-01-10T15:20:00Z"
    }
  ],
  "similar_products": [
    {
      "id": 2,
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "price": "79999.00",
      "image": "...",
      "ml_similarity_score": 0.92
    }
  ]
}
```

### Search Products
```http
GET /api/products/search/
Query Parameters:
- q: string (search query)
- category: int
- min_price: float
- max_price: float

Response:
{
  "results": [...],
  "search_suggestions": [
    "iPhone 14",
    "iPhone 13",
    "Samsung Galaxy"
  ],
  "ml_enhanced": true
}
```

---

## 📱 Categories API

### Get All Categories
```http
GET /api/categories/

Response:
[
  {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "image": "http://localhost:8000/media/categories/electronics.jpg",
    "product_count": 150,
    "subcategories": [
      {
        "id": 2,
        "name": "Smartphones",
        "slug": "smartphones",
        "product_count": 45
      }
    ]
  }
]
```

---

## 🛒 Orders API

### Create Order (Checkout)
```http
POST /api/orders/checkout/
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "123 Main St, City, State 12345",
  "payment_method": "stripe",
  "payment_id": "pi_1234567890",
  "payment_status": "completed",
  "billing_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}

Response:
{
  "order_id": "ORD-2024-001",
  "id": 1,
  "status": "confirmed",
  "total_amount": "99999.00",
  "final_amount": "89999.00",
  "items": [
    {
      "product": {
        "id": 1,
        "name": "iPhone 14 Pro",
        "image": "..."
      },
      "quantity": 1,
      "price": "99999.00",
      "cost": "89999.00"
    }
  ],
  "shipping_address": "123 Main St, City, State 12345",
  "payment_method": "stripe",
  "payment_status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_delivery": "2024-01-20T00:00:00Z"
}
```

### Get User Orders
```http
GET /api/orders/
Authorization: Bearer <token>
Query Parameters:
- status: string (pending, confirmed, shipped, delivered, cancelled)
- page: int

Response:
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "order_id": "ORD-2024-001",
      "status": "shipped",
      "total_amount": "99999.00",
      "final_amount": "89999.00",
      "created_at": "2024-01-15T10:30:00Z",
      "items_count": 2,
      "tracking_number": "TRK123456789"
    }
  ]
}
```

### Get Order Details
```http
GET /api/orders/{id}/
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "order_id": "ORD-2024-001",
  "status": "shipped",
  "payment_status": "completed",
  "total_amount": "99999.00",
  "final_amount": "89999.00",
  "items": [...],
  "shipping_address": "...",
  "billing_address": "...",
  "payment_method": "stripe",
  "tracking_number": "TRK123456789",
  "tracking_updates": [
    {
      "status": "Order Confirmed",
      "timestamp": "2024-01-15T10:30:00Z",
      "location": "Warehouse"
    },
    {
      "status": "Shipped",
      "timestamp": "2024-01-16T14:20:00Z",
      "location": "Distribution Center"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_delivery": "2024-01-20T00:00:00Z"
}
```

### Track Order
```http
GET /api/orders/{id}/track/
Authorization: Bearer <token>

Response:
{
  "order_id": "ORD-2024-001",
  "current_status": "shipped",
  "tracking_number": "TRK123456789",
  "estimated_delivery": "2024-01-20T00:00:00Z",
  "tracking_history": [
    {
      "status": "Order Placed",
      "timestamp": "2024-01-15T10:30:00Z",
      "location": "Online",
      "description": "Your order has been placed successfully"
    },
    {
      "status": "Order Confirmed",
      "timestamp": "2024-01-15T11:00:00Z",
      "location": "Warehouse",
      "description": "Order confirmed and being prepared"
    },
    {
      "status": "Shipped",
      "timestamp": "2024-01-16T14:20:00Z",
      "location": "Distribution Center",
      "description": "Package shipped and on the way"
    }
  ]
}
```

---

## 👤 User Profile API

### Get User Profile
```http
GET /api/users/profile/
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_image": "http://localhost:8000/media/profiles/user1.jpg"
  },
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "date_of_birth": "1990-01-15"
}
```

### Update User Profile
```http
PUT /api/users/profile/
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "date_of_birth": "1990-01-15",
  "profile_image": <file>
}

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_image": "http://localhost:8000/media/profiles/user1_updated.jpg"
  },
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "date_of_birth": "1990-01-15"
}
```

### Wishlist Management
```http
GET /api/users/wishlist/
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "product": {
      "id": 1,
      "name": "iPhone 14 Pro",
      "slug": "iphone-14-pro",
      "price": "99999.00",
      "discounted_price": "89999.00",
      "image": "...",
      "rating": 4.5
    },
    "added_at": "2024-01-15T10:30:00Z"
  }
]

POST /api/users/wishlist/add/
{
  "product_id": 1
}

DELETE /api/users/wishlist/remove/
{
  "product_id": 1
}
```

---

## 🤖 Machine Learning API

### Home Recommendations
```http
GET /api/recommendations/home/
Authorization: Bearer <token> (optional)

Response:
{
  "most_ordered": [
    {
      "id": 1,
      "name": "iPhone 14 Pro",
      "slug": "iphone-14-pro",
      "price": "99999.00",
      "image": "...",
      "order_count": 150
    }
  ],
  "most_popular": [
    {
      "id": 2,
      "name": "Samsung Galaxy S23",
      "slug": "samsung-galaxy-s23",
      "price": "79999.00",
      "image": "...",
      "rating": 4.7,
      "review_count": 200
    }
  ],
  "knn_recommendations": [
    {
      "id": 3,
      "name": "OnePlus 11",
      "slug": "oneplus-11",
      "price": "59999.00",
      "image": "...",
      "ml_score": 0.89,
      "similarity_reason": "Based on your previous purchases"
    }
  ],
  "best_ml_recommendations": [
    {
      "id": 4,
      "name": "Google Pixel 7",
      "slug": "google-pixel-7",
      "price": "49999.00",
      "image": "...",
      "ml_score": 0.95,
      "recommendation_type": "hybrid",
      "confidence": 0.87
    }
  ]
}
```

### Similar Products
```http
GET /api/recommendations/product/{product_id}/similar/

Response:
{
  "similar_products": [
    {
      "id": 2,
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "price": "79999.00",
      "image": "...",
      "similarity_score": 0.92,
      "similarity_reasons": [
        "Same brand",
        "Similar price range",
        "Same category"
      ]
    }
  ],
  "algorithm_used": "content_based",
  "confidence": 0.85
}
```

### User Personalized Recommendations
```http
GET /api/recommendations/user/{user_id}/
Authorization: Bearer <token>

Response:
{
  "personalized_products": [
    {
      "id": 1,
      "name": "iPhone 14 Pro",
      "slug": "iphone-14-pro",
      "price": "99999.00",
      "image": "...",
      "personalization_score": 0.91,
      "recommendation_reason": "Based on your browsing history and preferences",
      "algorithm": "collaborative_filtering"
    }
  ],
  "user_preferences": {
    "preferred_categories": ["Electronics", "Smartphones"],
    "price_range": [20000, 100000],
    "preferred_brands": ["Apple", "Samsung"]
  }
}
```

### Track User Behavior
```http
POST /api/analytics/track-interaction/
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_type": "product_view",
  "product_id": 1,
  "session_id": "sess_123456",
  "timestamp": "2024-01-15T10:30:00Z",
  "additional_data": {
    "time_spent": 45,
    "scroll_depth": 0.8,
    "clicked_elements": ["add_to_cart", "view_details"]
  }
}

Response:
{
  "status": "success",
  "message": "Interaction tracked successfully"
}
```

---

## 📊 Analytics API

### Dashboard Stats
```http
GET /api/analytics/dashboard-stats/
Authorization: Bearer <admin_token>

Response:
{
  "stats": {
    "total_orders": 1250,
    "total_revenue": 15750000.00,
    "total_users": 850,
    "total_products": 200,
    "orders_today": 25,
    "revenue_today": 125000.00,
    "new_users_today": 5
  },
  "orders": [
    {
      "id": 1,
      "order_id": "ORD-2024-001",
      "user": "John Doe",
      "total_amount": "99999.00",
      "status": "confirmed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "iPhone 14 Pro",
      "price": "99999.00",
      "stock_quantity": 50,
      "sales_count": 150
    }
  ],
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "date_joined": "2024-01-01T00:00:00Z",
      "total_orders": 5
    }
  ],
  "sales_data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
    "actual": [100000, 150000, 200000, 180000, 220000],
    "predicted": [null, null, null, null, 250000]
  },
  "revenue_data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
    "revenue": [500000, 750000, 1000000, 900000, 1100000],
    "refunds": [25000, 30000, 40000, 35000, 45000]
  }
}
```

### Sales Forecast
```http
GET /api/analytics/sales-forecast/
Authorization: Bearer <admin_token>
Query Parameters:
- period: string (daily, weekly, monthly)
- days: int (forecast period)

Response:
{
  "forecast_data": [
    {
      "date": "2024-01-16",
      "predicted_sales": 125000.00,
      "confidence_interval": [110000.00, 140000.00],
      "factors": [
        "Historical trends",
        "Seasonal patterns",
        "Current inventory"
      ]
    }
  ],
  "model_accuracy": 0.87,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

---

## 💳 Payment API

### Create Payment Intent
```http
POST /api/create-payment-intent/
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 8999900,
  "currency": "inr",
  "metadata": {
    "order_id": "ORD-2024-001",
    "user_id": 1
  }
}

Response:
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "payment_intent_id": "pi_1234567890",
  "amount": 8999900,
  "currency": "inr",
  "status": "requires_payment_method"
}
```

### Confirm Payment
```http
POST /api/confirm-payment/
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_intent_id": "pi_1234567890",
  "payment_method_id": "pm_1234567890"
}

Response:
{
  "status": "succeeded",
  "payment_intent": {
    "id": "pi_1234567890",
    "amount": 8999900,
    "currency": "inr",
    "status": "succeeded",
    "charges": {
      "data": [
        {
          "id": "ch_1234567890",
          "amount": 8999900,
          "currency": "inr",
          "status": "succeeded"
        }
      ]
    }
  }
}
```

---

## 🔧 Admin API

### Get All Orders (Admin)
```http
GET /api/admin/orders/
Authorization: Bearer <admin_token>
Query Parameters:
- status: string
- date_from: date
- date_to: date
- user_id: int

Response:
{
  "count": 1250,
  "results": [
    {
      "id": 1,
      "order_id": "ORD-2024-001",
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
      },
      "status": "confirmed",
      "total_amount": "99999.00",
      "payment_status": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "items_count": 2
    }
  ]
}
```

### Update Order Status
```http
PATCH /api/admin/orders/{id}/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "tracking_number": "TRK123456789"
}

Response:
{
  "id": 1,
  "order_id": "ORD-2024-001",
  "status": "shipped",
  "tracking_number": "TRK123456789",
  "updated_at": "2024-01-16T10:30:00Z"
}
```

### Product Management
```http
POST /api/admin/products/
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "New Product",
  "description": "Product description",
  "price": "99999.00",
  "category": 1,
  "brand": "Brand Name",
  "stock_quantity": 100,
  "image": <file>,
  "specifications": {
    "key1": "value1",
    "key2": "value2"
  }
}

PUT /api/admin/products/{id}/
DELETE /api/admin/products/{id}/
```

---

## 📝 Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/register/"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔄 Rate Limiting

### Rate Limits
- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **ML Recommendations**: 20 requests per minute
- **Admin API**: 200 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## 📚 SDK Examples

### JavaScript/React Example
```javascript
// API Service Setup
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example API calls
const authAPI = {
  login: (credentials) => api.post('auth/login/', credentials),
  register: (userData) => api.post('auth/register/', userData),
  refreshToken: (refresh) => api.post('auth/token/refresh/', { refresh }),
};

const productsAPI = {
  getProducts: (params) => api.get('products/', { params }),
  getProduct: (slug) => api.get(`products/${slug}/`),
  searchProducts: (query) => api.get('products/search/', { params: { q: query } }),
};

const ordersAPI = {
  checkout: (orderData) => api.post('orders/checkout/', orderData),
  getOrders: () => api.get('orders/'),
  getOrder: (id) => api.get(`orders/${id}/`),
  trackOrder: (id) => api.get(`orders/${id}/track/`),
};
```

This API documentation provides comprehensive information about all available endpoints, request/response formats, authentication requirements, and usage examples for the E-Mart platform.