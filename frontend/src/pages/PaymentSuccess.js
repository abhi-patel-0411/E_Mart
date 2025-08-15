import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AOS from 'aos';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    const paymentIntentId = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentIntentId && redirectStatus === 'succeeded') {
      confirmPayment(paymentIntentId);
    } else {
      setError('Invalid payment confirmation');
      setLoading(false);
    }
  }, [searchParams]);

  const confirmPayment = async (paymentIntentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/confirm-advanced-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentDetails(data);
        toast.success('Payment completed successfully!');
        
        // Send confirmation email
        await sendConfirmationEmail(data);
      } else {
        setError(data.error || 'Payment confirmation failed');
        toast.error(data.error || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError('Failed to confirm payment');
      toast.error('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async (paymentData) => {
    try {
      // This would be implemented based on your email service
      console.log('Sending confirmation email for payment:', paymentData.payment_intent_id);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}}>
                <div className="card-body text-center p-5">
                  <div className="spinner-border text-primary mb-4" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3 className="text-primary mb-3">Confirming Payment...</h3>
                  <p className="text-muted">Please wait while we verify your payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}} data-aos="zoom-in">
                <div className="card-body text-center p-5">
                  <div className="error-icon mb-4" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#dc3545',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-times text-white" style={{fontSize: '2rem'}}></i>
                  </div>
                  
                  <h2 className="text-danger fw-bold mb-3">Payment Error</h2>
                  <p className="text-muted mb-4">{error}</p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-danger btn-lg"
                      onClick={() => navigate('/cart')}
                      style={{borderRadius: '50px'}}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Back to Cart
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/products')}
                      style={{borderRadius: '50px'}}
                    >
                      <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}} data-aos="zoom-in">
              <div className="card-body text-center p-5">
                {/* Success Animation */}
                <div className="success-animation mb-4">
                  <div className="checkmark-circle" style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'scaleIn 0.5s ease-out',
                    boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)'
                  }}>
                    <i className="fas fa-check text-white" style={{fontSize: '2.5rem'}}></i>
                  </div>
                </div>
                
                <h1 className="text-success fw-bold mb-3" data-aos="fade-up" data-aos-delay="200">
                  Payment Successful!
                </h1>
                
                <p className="text-muted mb-4 fs-5" data-aos="fade-up" data-aos-delay="300">
                  Thank you for your purchase. Your payment has been processed successfully.
                </p>
                
                {/* Payment Details */}
                {paymentDetails && (
                  <div className="payment-details bg-light p-4 rounded-3 mb-4" data-aos="fade-up" data-aos-delay="400">
                    <h4 className="text-dark mb-3">
                      <i className="fas fa-receipt me-2"></i>Payment Details
                    </h4>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="detail-item">
                          <strong className="text-muted">Payment ID:</strong>
                          <div className="text-dark">{paymentDetails.payment_intent_id}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <strong className="text-muted">Amount:</strong>
                          <div className="text-dark fs-5 fw-bold">₹{paymentDetails.amount.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <strong className="text-muted">Currency:</strong>
                          <div className="text-dark text-uppercase">{paymentDetails.currency}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <strong className="text-muted">Status:</strong>
                          <span className="badge bg-success fs-6">
                            <i className="fas fa-check-circle me-1"></i>
                            {paymentDetails.status}
                          </span>
                        </div>
                      </div>
                      {paymentDetails.payment_method?.card && (
                        <div className="col-12">
                          <div className="detail-item">
                            <strong className="text-muted">Payment Method:</strong>
                            <div className="text-dark">
                              <i className={`fab fa-cc-${paymentDetails.payment_method.card.brand} me-2`}></i>
                              •••• •••• •••• {paymentDetails.payment_method.card.last4}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* User Info */}
                {user && (
                  <div className="user-info bg-primary bg-opacity-10 p-3 rounded-3 mb-4" data-aos="fade-up" data-aos-delay="500">
                    <p className="mb-0 text-muted">
                      <i className="fas fa-envelope me-2"></i>
                      A confirmation email has been sent to <strong>{user.email}</strong>
                    </p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="action-buttons" data-aos="fade-up" data-aos-delay="600">
                  <div className="d-grid gap-3">
                    <button 
                      className="btn btn-success btn-lg"
                      onClick={() => navigate('/orders')}
                      style={{borderRadius: '50px'}}
                    >
                      <i className="fas fa-list-alt me-2"></i>View My Orders
                    </button>
                    
                    <div className="row g-2">
                      <div className="col-md-6">
                        <button 
                          className="btn btn-outline-primary w-100"
                          onClick={() => navigate('/products')}
                          style={{borderRadius: '50px'}}
                        >
                          <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button 
                          className="btn btn-outline-secondary w-100"
                          onClick={() => navigate('/profile')}
                          style={{borderRadius: '50px'}}
                        >
                          <i className="fas fa-user me-2"></i>My Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Security Notice */}
                <div className="security-notice mt-4 p-3 bg-light rounded-3" data-aos="fade-up" data-aos-delay="700">
                  <div className="row g-2 text-center">
                    <div className="col-md-4">
                      <i className="fas fa-shield-alt text-success fa-2x mb-2"></i>
                      <div className="small text-muted">Secure Payment</div>
                    </div>
                    <div className="col-md-4">
                      <i className="fas fa-lock text-primary fa-2x mb-2"></i>
                      <div className="small text-muted">SSL Encrypted</div>
                    </div>
                    <div className="col-md-4">
                      <i className="fab fa-stripe text-info fa-2x mb-2"></i>
                      <div className="small text-muted">Powered by Stripe</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

// Add styles for animations
const styles = `
@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.detail-item {
  text-align: left;
  padding: 0.5rem 0;
}

.detail-item strong {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.btn:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .container {
    padding-left: 15px;
    padding-right: 15px;
  }
  
  .card-body {
    padding: 2rem 1.5rem !important;
  }
  
  .checkmark-circle {
    width: 80px !important;
    height: 80px !important;
  }
  
  .checkmark-circle i {
    font-size: 2rem !important;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}