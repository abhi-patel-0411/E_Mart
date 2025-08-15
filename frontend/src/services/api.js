import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          localStorage.setItem('access_token', response.data.access);
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}/`),
  getCategories: () => api.get('/categories/'),
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  add: (productId) => api.post(`/cart/add/${productId}/`),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}/`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}/`),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist/'),
  add: (productId) => api.post(`/wishlist/add/${productId}/`),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}/`),
};

export const compareAPI = {
  get: () => api.get('/compare/'),
  add: (productId) => api.post(`/compare/add/${productId}/`),
  remove: (productId) => api.delete(`/compare/remove/${productId}/`),
  clear: () => api.delete('/compare/clear/'),
};

export const ordersAPI = {
  checkout: (data) => api.post('/checkout/', data),
  getHistory: () => api.get('/orders/'),
  getDetail: (orderId) => api.get(`/orders/${orderId}/`),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel/`),
};

export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/reviews/`),
  add: (productId, data) => api.post(`/products/${productId}/reviews/add/`, data),
};

export const userAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (data) => api.put('/profile/', data),
  getAnalytics: () => api.get('/analytics/'),
};

export const analyticsAPI = {
  getSalesPrediction: () => api.get('/admin/analytics/sales-prediction/'),
  getRevenueAnalytics: () => api.get('/admin/analytics/revenue/'),
  getRefundAnalytics: () => api.get('/admin/analytics/refunds/'),
  getAdminStats: () => api.get('/admin/analytics/stats/'),
  getDashboardStats: () => api.get('/admin/analytics/dashboard/'),
};

export const adminAPI = {
  // Products
  createProduct: (data) => api.post('/admin/products/create/', data),
  updateProduct: (id, data) => {
    console.log('Updating product:', id, 'with data:', data);
    return api.put(`/admin/products/update/${id}/`, data);
  },
  toggleProductStatus: (id) => api.put(`/admin/products/toggle/${id}/`),
  getProducts: () => api.get('/admin/products/'),
  deleteProduct: (id) => api.delete(`/admin/products/delete/${id}/`),
  
  // Categories
  getCategories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/admin/categories/create/', data),
  updateCategory: (id, data) => api.put(`/admin/categories/update/${id}/`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/delete/${id}/`),
  
  // Users
  getUsers: () => api.get('/admin/users/'),
  createUser: (data) => api.post('/admin/users/create/', data),
  banUser: (id) => api.put(`/admin/users/ban/${id}/`),
  updateUser: (id, data) => api.put(`/admin/users/update/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/delete/${id}/`),
  removeWishlist: (id) => api.delete(`/admin/wishlists/remove/${id}/`),
  
  // Orders
  getOrders: () => api.get('/admin/orders/'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/update/${id}/`, { status }),
  
  // Wishlists
  getWishlists: () => api.get('/admin/wishlists/'),
  removeWishlist: (id) => api.delete(`/admin/wishlists/remove/${id}/`),
  
  // Compares
  getCompares: () => api.get('/admin/compares/'),
  removeCompare: (id) => api.delete(`/admin/compares/remove/${id}/`),
};

export default api;