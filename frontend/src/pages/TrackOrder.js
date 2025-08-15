import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getDetail(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: 'fas fa-shopping-cart' },
      { key: 'confirmed', label: 'Confirmed', icon: 'fas fa-check-circle' },
      { key: 'shipped', label: 'Shipped', icon: 'fas fa-shipping-fast' },
      { key: 'delivered', label: 'Delivered', icon: 'fas fa-box-open' }
    ];

    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const pageStyle = {
    backgroundColor: 'white',
    minHeight: '100vh',
    paddingTop: '100px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: '2rem',
    color: 'white'
  };

  const stepIconStyle = (step) => ({
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    ...(step.completed ? {
      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: 'white'
    } : step.active ? {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white'
    } : {
      background: '#f8fafc',
      color: '#9ca3af',
      border: '2px solid #e5e7eb'
    })
  });

  const infoCardStyle = {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0'
  };

  const itemCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    marginBottom: '0.75rem'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="text-center">
                <div className="spinner-border" style={{width: '3rem', height: '3rem', color: '#6366f1'}}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-3" style={{color: '#374151'}}>Loading order details...</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageStyle}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div style={cardStyle}>
                <div className="text-center p-5">
                  <i className="fas fa-search fa-4x text-muted mb-4"></i>
                  <h3 className="mb-3" style={{color: '#374151'}}>Order Not Found</h3>
                  <p className="text-muted mb-4">We couldn't find an order with this ID.</p>
                  <Link to="/orders" className="btn" style={{
                    backgroundColor: '#6366f1',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="fas fa-arrow-left me-2"></i>View All Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <>
      <style>
        {`
          .track-order-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          }
          
          .step-icon-animate {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
      
      <div style={pageStyle}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div style={cardStyle} className="track-order-hover">
                {/* Header */}
                <div style={headerStyle}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="fw-bold mb-2">
                        <i className="fas fa-shipping-fast me-2"></i>
                        Track Order
                      </h3>
                      <p className="mb-0" style={{opacity: 0.9}}>Order #{order.order_id}</p>
                    </div>
                    <div className="text-end">
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.875rem'
                      }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Status Timeline */}
                  <div className="mb-5">
                    <h5 className="fw-bold mb-4" style={{color: '#374151'}}>
                      <i className="fas fa-route me-2" style={{color: '#6366f1'}}></i>
                      Order Progress
                    </h5>
                    <div className="row">
                      {statusSteps.map((step, index) => (
                        <div key={step.key} className="col-6 col-md-3 mb-4">
                          <div className="text-center">
                            <div style={stepIconStyle(step)} className={step.active ? 'step-icon-animate' : ''}>
                              <i className={`${step.icon}`} style={{fontSize: '1.25rem'}}></i>
                            </div>
                            <h6 className="fw-semibold mb-1" style={{
                              color: step.completed ? '#10b981' : step.active ? '#6366f1' : '#9ca3af'
                            }}>
                              {step.label}
                            </h6>
                            {step.active && (
                              <span style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div style={infoCardStyle}>
                        <h5 className="fw-bold mb-3" style={{color: '#374151'}}>
                          <i className="fas fa-info-circle me-2" style={{color: '#6366f1'}}></i>
                          Order Information
                        </h5>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Order ID</span>
                          <span className="fw-bold" style={{color: '#374151'}}>#{order.order_id}</span>
                        </div>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Date</span>
                          <span style={{color: '#374151'}}>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Total</span>
                          <span className="fw-bold" style={{color: '#10b981'}}>₹{parseFloat(order.final_amount || order.total_amount).toFixed(0)}</span>
                        </div>
                        <div className="d-flex justify-content-between py-2">
                          <span className="text-muted">Status</span>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            ...(order.status === 'delivered' ? {background: '#dcfce7', color: '#166534'} :
                               order.status === 'shipped' ? {background: '#dbeafe', color: '#1d4ed8'} :
                               order.status === 'confirmed' ? {background: '#e0f2fe', color: '#0369a1'} :
                               order.status === 'cancelled' ? {background: '#fee2e2', color: '#dc2626'} : 
                               {background: '#fef3c7', color: '#d97706'})
                          }}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div style={infoCardStyle}>
                        <h5 className="fw-bold mb-3" style={{color: '#374151'}}>
                          <i className="fas fa-map-marker-alt me-2" style={{color: '#ef4444'}}></i>
                          Delivery Address
                        </h5>
                        <div style={{
                          padding: '1rem',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <p className="mb-0" style={{color: '#374151'}}>{order.shipping_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{color: '#374151'}}>
                      <i className="fas fa-box me-2" style={{color: '#f59e0b'}}></i>
                      Items ({order.items?.length || 0})
                    </h5>
                    {order.items?.map(item => (
                      <div key={item.id} style={itemCardStyle}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div style={{
                              background: 'rgba(99, 102, 241, 0.1)',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              marginRight: '1rem'
                            }}>
                              <i className="fas fa-cube" style={{color: '#6366f1'}}></i>
                            </div>
                            <div>
                              <h6 className="mb-1" style={{color: '#374151'}}>{item.product?.name || 'Product'}</h6>
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold" style={{color: '#10b981'}}>₹{parseFloat(item.price || 0).toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="text-center pt-3">
                    <Link to="/orders" style={{
                      backgroundColor: '#6366f1',
                      color: 'white',
                      padding: '0.75rem 2rem',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      marginRight: '1rem',
                      display: 'inline-block',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="fas fa-list me-2"></i>All Orders
                    </Link>
                    <Link to="/" style={{
                      backgroundColor: '#f8fafc',
                      color: '#374151',
                      padding: '0.75rem 2rem',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      border: '1px solid #e5e7eb',
                      display: 'inline-block',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="fas fa-home me-2"></i>Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackOrder;