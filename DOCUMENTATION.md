****# E-Mart - Complete System Documentation

## 🏗️ Architecture Overview

E-Mart is a full-stack AI-powered e-commerce platform built with:
- **Frontend**: React.js with Bootstrap
- **Backend**: Django REST Framework
- **Database**: PostgreSQL/SQLite
- **ML Engine**: Python scikit-learn, pandas
- **Payment**: Stripe Integration
- **Authentication**: JWT Token-based

## 📁 Project Structure

```
abhiemart_latest/
├── frontend/                    # React Frontend Application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Route-based page components
│   │   ├── context/            # React Context providers
│   │   ├── services/           # API service layer
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
├── backend/                     # Django Backend Application
│   ├── api/                    # REST API endpoints
│   ├── ml/                     # Machine Learning modules
│   ├── models/                 # Database models
│   ├── authentication/        # Auth system
│   ├── orders/                # Order management
│   ├── products/              # Product management
│   └── users/                 # User management
└── docs/                       # Documentation files
```

---

## 🎯 Frontend Architecture

### Core Application Flow

#### 1. **App.js** - Main Application Entry Point
```javascript
App.js
├── Router Setup (React Router v6)
├── Global Providers
│   ├── CompareProvider (Product comparison)
│   └── AuthProvider (User authentication)
├── Loading Screen (First-time visit)
├── Route Configuration
│   ├── Public Routes (/, /products, /login, etc.)
│   └── Admin Routes (/dashboard, /admin/*)
└── Global Components
    ├── Navbar (Public pages)
    ├── Footer (Public pages)
    └── MobileBottomNav (Mobile navigation)
```

**Key Connections:**
- **LoadingScreen.js** → Shows on first visit using sessionStorage
- **Navbar.js** → Rendered on all public routes
- **AdminLayout.js** → Wrapper for admin routes

#### 2. **Context System** - State Management

##### AuthContext.js
```javascript
AuthContext
├── User Authentication State
├── Login/Logout Functions
├── Token Management (localStorage)
├── User Profile Data
└── Protected Route Logic

Connected Components:
├── Login.js → Uses login function
├── Register.js → Uses registration
├── Profile.js → Uses user data & updateUser
├── Navbar.js → Uses user state for dropdown
└── All protected pages → Uses isAuthenticated
```

##### CartContext.js
```javascript
CartContext
├── Cart Items Management
├── Add/Remove/Update Items
├── Cart Total Calculations
├── Local Storage Persistence
└── Checkout Data Preparation

Connected Components:
├── ProductCard.js → Uses addToCart
├── ProductDetail.js → Uses addToCart
├── CartBootstrap.js → Uses cart state
├── Checkout.js → Uses cart data
└── Navbar.js → Uses cart count
```

##### CompareContext.js
```javascript
CompareContext
├── Product Comparison State
├── Add/Remove Compare Items
├── Compare List Management
└── Maximum 3 Items Limit

Connected Components:
├── ProductCard.js → Uses addToCompare
├── ProductDetail.js → Uses addToCompare
├── Compare.js → Uses compare state
└── Navbar.js → Uses compare count
```

#### 3. **Services Layer** - API Communication

##### api.js - Central API Configuration
```javascript
API Services Structure:
├── Base Configuration (axios)
├── Authentication Interceptors
├── Error Handling
└── Service Modules:
    ├── authAPI → Login, Register, Profile
    ├── productsAPI → Products, Categories, Search
    ├── ordersAPI → Orders, Checkout, Tracking
    ├── userAPI → Profile, Wishlist, Addresses
    ├── adminAPI → Admin operations
    ├── analyticsAPI → ML recommendations
    └── mlAPI → Machine learning features

Connected Components:
├── All Pages → Import specific API services
├── Context Providers → Use for state updates
└── Custom Hooks → Wrap API calls
```

#### 4. **Page Components** - Route Handlers

##### Home.js - Landing Page
```javascript
Home.js Flow:
├── ML Recommendations Fetch
│   ├── Most Ordered Products
│   ├── Most Popular Products
│   ├── KNN Recommendations
│   └── Best ML Recommendations
├── Hero Section Display
├── Product Categories
├── Featured Products
└── Newsletter Signup

API Connections:
├── analyticsAPI.getRecommendations()
├── productsAPI.getProducts()
└── productsAPI.getCategories()

Components Used:
├── ProductCard.js
├── CategoryCard.js
├── HeroSlider.js
└── NewsletterSection.js
```

##### Products.js - Product Listing
```javascript
Products.js Flow:
├── Product Fetching with Pagination
├── Search & Filter Implementation
├── Category-based Filtering
├── Sort Options (Price, Rating, Date)
├── ML-powered Search Results
└── Infinite Scroll/Pagination

API Connections:
├── productsAPI.getProducts(filters)
├── productsAPI.searchProducts(query)
├── productsAPI.getCategories()
└── mlAPI.getPersonalizedProducts()

Components Used:
├── ProductCard.js
├── FilterSidebar.js
├── SearchBar.js
├── SortDropdown.js
└── Pagination.js
```

##### ProductDetail.js - Single Product View
```javascript
ProductDetail.js Flow:
├── Product Data Fetching (by slug)
├── Image Gallery Display
├── Product Information
├── Add to Cart/Wishlist/Compare
├── Similar Products (ML-powered)
├── Reviews & Ratings
└── Product Recommendations

API Connections:
├── productsAPI.getProduct(slug)
├── mlAPI.getSimilarProducts(productId)
├── userAPI.addToWishlist()
└── ordersAPI.addReview()

Components Used:
├── ImageGallery.js
├── ProductInfo.js
├── AddToCartButton.js
├── ProductCard.js (similar products)
└── ReviewSection.js
```

##### CartBootstrap.js - Shopping Cart
```javascript
CartBootstrap.js Flow:
├── Cart Items Display
├── Quantity Updates
├── Price Calculations
├── Coupon/Discount Application
├── Shipping Options
└── Checkout Navigation

Context Connections:
├── CartContext → Cart state management
└── AuthContext → User authentication

Components Used:
├── CartItem.js
├── PriceBreakdown.js
├── CouponInput.js
└── CheckoutButton.js
```

##### Checkout.js - Order Placement
```javascript
Checkout.js Flow:
├── Address Selection/Addition
├── Payment Method Selection
├── Order Summary Display
├── Final Price Calculation
├── Order Placement
└── Payment Processing

API Connections:
├── userAPI.getAddresses()
├── userAPI.addAddress()
├── ordersAPI.checkout()
└── Payment Gateway Integration

Components Used:
├── AddressForm.js
├── PaymentMethods.js
├── OrderSummary.js
└── PlaceOrderButton.js
```

#### 5. **Component Architecture**

##### Navbar.js - Navigation Component
```javascript
Navbar.js Structure:
├── Brand Logo & Navigation
├── Search Bar Integration
├── User Authentication State
├── Cart/Wishlist/Compare Counters
├── User Profile Dropdown
└── Mobile Responsive Menu

Context Connections:
├── AuthContext → User state, logout
├── CartContext → Cart count
└── CompareContext → Compare count

Components Used:
├── SmartSearchBar.js
├── UserDropdown.js
├── CartIcon.js
└── MobileMenu.js
```

##### ProductCard.js - Product Display Component
```javascript
ProductCard.js Structure:
├── Product Image Display
├── Product Information
├── Price & Discount Display
├── Rating & Reviews
├── Action Buttons
│   ├── Add to Cart
│   ├── Add to Wishlist
│   └── Add to Compare
└── ML Score Display (if available)

Context Connections:
├── CartContext → addToCart
├── AuthContext → User authentication
└── CompareContext → addToCompare

Props Received:
├── product → Product data object
├── showMLScore → Display ML recommendation score
└── variant → Card display variant
```

#### 6. **Custom Hooks** - Reusable Logic

##### useAuth.js
```javascript
useAuth Hook:
├── Authentication State Management
├── Login/Logout Functions
├── Token Validation
├── User Profile Updates
└── Protected Route Logic

Used By:
├── All protected pages
├── Navbar component
├── Profile forms
└── Order pages
```

##### useCart.js
```javascript
useCart Hook:
├── Cart State Management
├── Add/Remove/Update Items
├── Price Calculations
├── Local Storage Sync
└── Checkout Preparation

Used By:
├── Product pages
├── Cart page
├── Checkout page
└── Navbar
```

---

## 🔧 Backend Architecture

### Django Project Structure

#### 1. **Main Project Configuration**

##### settings.py - Core Configuration
```python
Settings Configuration:
├── Database Configuration (PostgreSQL/SQLite)
├── REST Framework Setup
├── CORS Configuration
├── JWT Authentication
├── Media/Static Files
├── ML Model Paths
└── Third-party Integrations
    ├── Stripe Configuration
    ├── Email Settings
    └── Redis/Celery (if used)
```

##### urls.py - URL Routing
```python
URL Configuration:
├── Admin Panel (/admin/)
├── API Routes (/api/)
│   ├── Authentication (/api/auth/)
│   ├── Products (/api/products/)
│   ├── Orders (/api/orders/)
│   ├── Users (/api/users/)
│   ├── ML Endpoints (/api/ml/)
│   └── Analytics (/api/analytics/)
├── Media Files (/media/)
└── Static Files (/static/)
```

#### 2. **Database Models** - Data Structure

##### models/product.py
```python
Product Model:
├── Basic Information
│   ├── name, description, price
│   ├── category, brand, sku
│   └── images, specifications
├── Inventory Management
│   ├── stock_quantity
│   ├── is_active, is_featured
│   └── created_at, updated_at
├── SEO & Marketing
│   ├── slug, meta_description
│   └── tags, keywords
└── ML Features
    ├── ml_score (recommendation score)
    ├── popularity_score
    └── feature_vector (for ML algorithms)

Related Models:
├── Category → ForeignKey relationship
├── ProductImage → One-to-Many
├── ProductReview → One-to-Many
└── ProductVariant → One-to-Many
```

##### models/user.py
```python
User Model (Extended):
├── Django User (built-in)
├── Profile Extension
│   ├── phone, address, city, state
│   ├── date_of_birth, gender
│   ├── profile_image
│   └── preferences (JSON field)
├── ML User Data
│   ├── behavior_vector
│   ├── purchase_history
│   └── recommendation_preferences
└── Timestamps
    ├── created_at, updated_at
    └── last_login_at

Related Models:
├── UserAddress → One-to-Many
├── UserWishlist → Many-to-Many with Product
├── UserBehavior → One-to-Many
└── Order → One-to-Many
```

##### models/order.py
```python
Order Model:
├── Order Information
│   ├── order_id (unique)
│   ├── user (ForeignKey)
│   ├── status, payment_status
│   └── total_amount, final_amount
├── Address & Shipping
│   ├── shipping_address
│   ├── billing_address
│   └── shipping_method
├── Payment Details
│   ├── payment_method
│   ├── payment_id (Stripe)
│   └── transaction_details
└── Timestamps
    ├── created_at, updated_at
    ├── shipped_at, delivered_at
    └── estimated_delivery

Related Models:
├── OrderItem → One-to-Many
├── OrderTracking → One-to-Many
└── OrderPayment → One-to-One
```

#### 3. **API Views** - Business Logic

##### views/product_views.py
```python
Product API Endpoints:
├── ProductListView
│   ├── GET /api/products/
│   ├── Filtering, Searching, Pagination
│   ├── ML-powered sorting
│   └── Category-based filtering
├── ProductDetailView
│   ├── GET /api/products/{slug}/
│   ├── Product details with reviews
│   └── Similar products (ML-powered)
├── ProductSearchView
│   ├── GET /api/products/search/
│   ├── Text-based search
│   └── ML-enhanced results
└── CategoryListView
    ├── GET /api/categories/
    └── Category hierarchy

ML Integration:
├── Recommendation scoring
├── Personalized product ranking
├── Similar product suggestions
└── Search result optimization
```

##### views/order_views.py
```python
Order API Endpoints:
├── OrderCreateView (Checkout)
│   ├── POST /api/orders/checkout/
│   ├── Cart validation
│   ├── Payment processing
│   ├── Order creation
│   └── Email notifications
├── OrderListView
│   ├── GET /api/orders/
│   ├── User's order history
│   └── Order status filtering
├── OrderDetailView
│   ├── GET /api/orders/{id}/
│   ├── Order details with items
│   └── Tracking information
└── OrderTrackingView
    ├── GET /api/orders/{id}/track/
    └── Real-time tracking updates

Payment Integration:
├── Stripe payment processing
├── Payment status updates
├── Refund handling
└── Payment method storage
```

##### views/ml_views.py
```python
ML API Endpoints:
├── RecommendationView
│   ├── GET /api/recommendations/home/
│   ├── Personalized recommendations
│   ├── Popular products
│   └── ML algorithm results
├── SimilarProductsView
│   ├── GET /api/recommendations/similar/{id}/
│   ├── Content-based filtering
│   └── Collaborative filtering
├── UserBehaviorView
│   ├── POST /api/analytics/track/
│   ├── User interaction tracking
│   └── Behavior data collection
└── PersonalizedSearchView
    ├── GET /api/search/personalized/
    └── ML-enhanced search results

ML Models Used:
├── KNN (K-Nearest Neighbors)
├── Content-based filtering
├── Collaborative filtering
└── Hybrid recommendation system
```

#### 4. **Machine Learning Module**

##### ml/models/knn_model.py
```python
KNN Recommendation System:
├── User-based Collaborative Filtering
├── Item-based Collaborative Filtering
├── Similarity Calculations
│   ├── Cosine similarity
│   ├── Euclidean distance
│   └── Pearson correlation
├── Model Training Pipeline
├── Prediction Generation
└── Performance Evaluation

Data Processing:
├── User-item interaction matrix
├── Feature vector creation
├── Data normalization
└── Missing value handling
```

##### ml/algorithms/content_filter.py
```python
Content-Based Filtering:
├── Product Feature Extraction
│   ├── Category, brand, price range
│   ├── Product descriptions (TF-IDF)
│   └── Specifications analysis
├── User Profile Building
│   ├── Purchase history analysis
│   ├── Preference learning
│   └── Behavior pattern recognition
├── Similarity Scoring
└── Recommendation Generation

Feature Engineering:
├── Text processing (NLP)
├── Categorical encoding
├── Numerical normalization
└── Feature selection
```

##### ml/training/train_models.py
```python
Model Training Pipeline:
├── Data Collection & Preprocessing
├── Feature Engineering
├── Model Training
│   ├── KNN model training
│   ├── Content filter training
│   ├── Collaborative filter training
│   └── Hybrid model ensemble
├── Model Evaluation
│   ├── Accuracy metrics
│   ├── Precision/Recall
│   └── A/B testing results
├── Model Serialization
└── Deployment Preparation

Scheduled Tasks:
├── Daily model retraining
├── Performance monitoring
├── Data drift detection
└── Model version management
```

---

## 🔄 Data Flow & Integration

### Complete User Journey Flow

#### 1. **User Registration/Login Flow**
```
Frontend (Register.js) 
    ↓ [POST /api/auth/register/]
Backend (AuthView.register) 
    ↓ [User model creation]
Database (User table) 
    ↓ [JWT token generation]
Frontend (AuthContext) 
    ↓ [Token storage]
LocalStorage & State Update
    ↓ [Redirect to home]
Home.js (Authenticated state)
```

#### 2. **Product Browsing Flow**
```
Frontend (Home.js) 
    ↓ [GET /api/recommendations/home/]
Backend (MLView.get_recommendations) 
    ↓ [ML model inference]
ML Engine (KNN + Content filtering) 
    ↓ [Product scoring]
Database (Product queries) 
    ↓ [Recommended products]
Frontend (Product display) 
    ↓ [User interaction tracking]
Backend (Analytics tracking)
```

#### 3. **Add to Cart Flow**
```
Frontend (ProductCard.js) 
    ↓ [addToCart() function]
CartContext (State update) 
    ↓ [LocalStorage sync]
Browser Storage 
    ↓ [Cart count update]
Navbar (Cart icon update) 
    ↓ [Real-time UI update]
CartBootstrap.js (Cart page)
```

#### 4. **Checkout & Payment Flow**
```
Frontend (Checkout.js) 
    ↓ [Address & payment selection]
Frontend (StripePaymentPage.js) 
    ↓ [Stripe payment processing]
Stripe API 
    ↓ [Payment confirmation]
Frontend (Payment success) 
    ↓ [POST /api/orders/checkout/]
Backend (OrderView.create) 
    ↓ [Order creation]
Database (Order & OrderItem tables) 
    ↓ [Email notification]
Email Service 
    ↓ [Order confirmation]
Frontend (Orders.js)
```

#### 5. **ML Recommendation Flow**
```
User Interaction 
    ↓ [Behavior tracking]
Backend (Analytics API) 
    ↓ [Data collection]
ML Training Pipeline 
    ↓ [Model updates]
ML Models (KNN, Content, Collaborative) 
    ↓ [Recommendation generation]
Backend (ML API) 
    ↓ [Personalized results]
Frontend (Home.js, Products.js) 
    ↓ [Dynamic content display]
User Experience Enhancement
```

---

## 🔧 Key Integrations

### 1. **Authentication System**
```
JWT Token Flow:
├── Login → Token generation
├── Token storage (localStorage)
├── API request headers
├── Token validation (backend)
├── Token refresh mechanism
└── Logout → Token cleanup

Files Involved:
├── Frontend: AuthContext.js, api.js
├── Backend: authentication/views.py
└── Middleware: JWT authentication
```

### 2. **Payment Integration**
```
Stripe Payment Flow:
├── Frontend: Stripe Elements
├── Payment intent creation
├── Payment confirmation
├── Backend order processing
├── Payment status updates
└── Order completion

Files Involved:
├── Frontend: StripePaymentPage.js, StripeCheckout.js
├── Backend: payment/views.py, orders/views.py
└── External: Stripe API
```

### 3. **ML Recommendation System**
```
Recommendation Pipeline:
├── Data Collection (user behavior)
├── Feature Engineering
├── Model Training (scheduled)
├── Real-time Inference
├── API Response
└── Frontend Display

Files Involved:
├── Frontend: Home.js, Products.js
├── Backend: ml/views.py, ml/models/
├── Training: ml/training/
└── Data: User behavior, Product features
```

---

## 📊 Database Schema Relationships

```sql
-- Core Relationships
User (1) ←→ (Many) Order
User (1) ←→ (Many) UserBehavior  
User (Many) ←→ (Many) Product (Wishlist)

Product (1) ←→ (Many) OrderItem
Product (1) ←→ (Many) ProductReview
Product (Many) ←→ (1) Category

Order (1) ←→ (Many) OrderItem
Order (1) ←→ (1) OrderPayment
Order (1) ←→ (Many) OrderTracking

-- ML Relationships
UserBehavior → ML Training Data
Product Features → Content Filtering
User-Product Interactions → Collaborative Filtering
```

---

## 🚀 Deployment & Environment

### Development Environment
```
Frontend Development:
├── npm start (React dev server)
├── Hot reloading enabled
├── Development API endpoints
└── Debug mode active

Backend Development:
├── python manage.py runserver
├── Debug mode enabled
├── SQLite database
├── Development settings
└── ML model training scripts
```

### Production Environment
```
Frontend Production:
├── npm run build
├── Static file generation
├── Production API endpoints
└── Optimized bundles

Backend Production:
├── Gunicorn/uWSGI server
├── PostgreSQL database
├── Redis caching
├── Celery background tasks
├── ML model serving
└── Production settings
```

---

## 🔍 Key Features Implementation

### 1. **Real-time Search**
- **Frontend**: SmartSearchBar.js with debounced input
- **Backend**: Search API with ML ranking
- **ML**: Personalized search results

### 2. **Product Recommendations**
- **Frontend**: Home.js recommendation sections
- **Backend**: ML API endpoints
- **ML**: KNN, Content-based, Collaborative filtering

### 3. **Shopping Cart**
- **Frontend**: CartContext with localStorage
- **Backend**: Session-based cart (optional)
- **Persistence**: Local storage + database sync

### 4. **Order Management**
- **Frontend**: Orders.js, TrackOrder.js
- **Backend**: Order API with status tracking
- **Integration**: Email notifications, payment processing

### 5. **Admin Dashboard**
- **Frontend**: Dashboard.js, AdminAnalytics.js
- **Backend**: Admin API endpoints
- **Features**: Analytics, ML insights, order management

This documentation provides a complete overview of the E-Mart system architecture, showing how each component connects and works together to create a comprehensive e-commerce platform with AI-powered features.