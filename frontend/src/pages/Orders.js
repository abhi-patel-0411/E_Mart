import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getHistory();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? You will receive 70% refund.')) {
      try {
        const response = await ordersAPI.cancelOrder(orderId);
        if (response.data.success) {
          alert(`Order cancelled successfully! Refund of ₹${response.data.refund_amount} will be processed within 3-5 business days.`);
          fetchOrders(); // Refresh orders
        }
      } catch (error) {
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info text-white',
      shipped: 'bg-primary text-white',
      delivered: 'bg-success text-white',
      cancelled: 'bg-danger text-white'
    };
    return `badge ${statusClasses[status] || 'bg-secondary text-white'}`;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: 'fas fa-clock',
      confirmed: 'fas fa-check-circle',
      shipped: 'fas fa-shipping-fast',
      delivered: 'fas fa-box-open',
      cancelled: 'fas fa-times-circle'
    };
    return statusIcons[status] || 'fas fa-box';
  };

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card border-0 shadow-lg">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-user-lock fa-4x text-primary mb-3"></i>
                      <h2 className="h4 fw-bold text-dark">Access Required</h2>
                      <p className="text-muted">Please login to view your order history and track your purchases</p>
                    </div>
                    <Link to="/login" className="btn btn-primary btn-lg px-4 py-2 rounded-pill">
                      <i className="fas fa-sign-in-alt me-2"></i>Login to Continue
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="text-muted">Loading your orders...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
                      <h2 className="h4 fw-bold text-dark">No Orders Yet</h2>
                      <p className="text-muted">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    </div>
                    <Link to="/products" className="btn btn-primary btn-lg px-4 py-2 rounded-pill">
                      <i className="fas fa-shopping-cart me-2"></i>Start Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      {/* Orders Header */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="h2 fw-bold text-dark mb-2">
              <i className="fas fa-shopping-cart text-primary me-2"></i>
              Order History
            </h1>
            <p className="text-muted">Track and manage your orders - {orders.length} total orders</p>
          </div>
          
          <div className="p-4">
        <h2 className="h5 fw-medium mb-4">Orders List</h2>
        <div className="d-flex flex-column gap-4">
          {orders.map((order, index) => (
            <div key={index} className="card border-0 shadow-sm hover-card">
              <div className="card-body">
                <div className="d-flex flex-column d-md-grid gap-4 p-2" style={{gridTemplateColumns: '2fr 1fr 1fr 1fr'}}>
                  <div className="d-flex gap-4">
                    {/* Updated image with responsive sizing */}
                    <div className="d-flex align-items-center justify-content-center">
                      <img 
                        className="opacity-50" 
                        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/boxIcon.svg" 
                        alt="boxIcon" 
                        style={{
                          width: '150px',
                          height: '120px',
                          objectFit: 'cover',
                          paddingLeft: '20px',
                          paddingTop: '20px',
                        }}
                      />
                    </div>
                    <div>
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="d-flex flex-column justify-content-center">
                          <p className="fw-medium mb-0">
                            {item.product?.name || 'Product'} 
                            {item.quantity > 1 && <span className="text-primary"> x {item.quantity}</span>}
                          </p>
                        </div>
                      )) || (
                        <div className="d-flex flex-column justify-content-center">
                          <p className="fw-medium mb-0">
                            Order #{order.order_id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="small">
                    <p className="fw-medium mb-1">Shipping Address</p>
                    <p className="mb-0">{order.shipping_address || 'Address not available'}</p>
                  </div>

                  <p className="fw-medium my-auto" style={{color: 'rgba(0,0,0,0.7)'}}>₹{parseFloat(order.final_amount || order.total_amount || 0).toFixed(0)}</p>

                  <div className="d-flex flex-column small gap-1">
                    <p className="mb-0">Method: {(() => {
                      const method = order.payment_method || 'COD';
                      const paymentType = order.payment_type;
                      
                      if (method.includes('stripe')) {
                        if (method === 'stripe_credit') return 'Credit Card (Stripe)';
                        if (method === 'stripe_debit') return 'Debit Card (Stripe)';
                        if (method === 'stripe_card') return 'Credit/Debit Card (Stripe)';
                        return paymentType || 'Card Payment (Stripe)';
                      }
                      
                      switch(method.toLowerCase()) {
                        case 'cod': return 'Cash on Delivery';
                        case 'visa_card': return 'Visa Card';
                        case 'mastercard': return 'Mastercard';
                        case 'amex_card': return 'American Express';
                        case 'debit_card': return 'Debit Card';
                        case 'credit_card': return 'Credit Card';
                        case 'discover_card': return 'Discover Card';
                        case 'diners_card': return 'Diners Club';
                        case 'jcb_card': return 'JCB Card';
                        case 'unionpay_card': return 'UnionPay Card';
                        default: return method.toUpperCase();
                      }
                    })()}</p>
                    <p className="mb-0">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="mb-0">Payment: <span className="badge bg-success">Paid</span></p>
                    <p className="mb-0">Status: <span className={`badge ${order.status === 'completed' || order.status === 'delivered' || order.status === 'confirmed' ? 'bg-success' : order.status === 'pending' ? 'bg-warning' : order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'}`}>{(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span></p>
                    <div className="mt-2">
                      <div className="d-flex flex-wrap gap-2">
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <i className="fas fa-times me-1"></i>Cancel
                          </button>
                        )}
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.open(`/track-order/${order.order_id}`, '_blank')}
                        >
                          <i className="fas fa-truck me-1"></i>Track
                        </button>
                      </div>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .card {
          border-radius: 12px;
        }
        .btn {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default Orders;