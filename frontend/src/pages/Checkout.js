import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';
import StripePayment from '../components/StripePaymentPro';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import AOS from 'aos';
import 'aos/dist/aos.css';

const stripePromise = loadStripe('pk_test_51RieweIC3UmOEaMXPBVq9aot6qEpna0JMfLxvy0pAxeB7RGCrFnVV1HO26YKt29jYC8yQtqwHgS8SX8gXvclB5da00GwpznZUx');

const Checkout = () => {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const totalAmount = parseFloat(cart.discounted_total || cart.total_price || 0);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all shipping details');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        payment_method: 'COD',
        applied_offers: cart.applied_offers || []
      };
      
      const response = await ordersAPI.checkout(orderData);
      clearCart();
      toast.success(`Order ${response.data.order_id} placed successfully!`);
      navigate('/orders');
    } catch (error) {
      toast.error('Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    try {
      const orderData = {
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        payment_method: paymentResult.payment_method || 'credit_card',
        payment_id: paymentResult.id,
        payment_status: 'completed',
        applied_offers: cart.applied_offers || []
      };
      
      const response = await ordersAPI.checkout(orderData);
      clearCart();
      setShowPayment(false);
      toast.success(`Payment successful! Order ${response.data.order_id} placed.`);
      navigate('/orders');
    } catch (error) {
      toast.error('Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    toast.error(error);
  };

  if (!isAuthenticated) {
    return (
      <div>
        {/* Hero Section */}
        <div className="hero-slide" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="container text-center text-white">
            <h1 className="display-2 fw-bold mb-4" data-aos="fade-up">Access Required</h1>
            <p className="lead mb-5" data-aos="fade-up" data-aos-delay="200">Please login to proceed with checkout</p>
            <Link to="/login" className="btn btn-primary btn-lg px-5 py-3">
              <i className="fas fa-sign-in-alt me-2"></i>Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div>
        {/* Hero Section */}
        <div className="hero-slide" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&h=800&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="container text-center text-white">
            <h1 className="display-2 fw-bold mb-4" data-aos="fade-up">Cart is Empty</h1>
            <p className="lead mb-5" data-aos="fade-up" data-aos-delay="200">Add some items to proceed with checkout</p>
            <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
              <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-slide" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '70vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container text-center text-white">
          <h1 className="display-2 fw-bold mb-4" data-aos="fade-up">Secure Checkout</h1>
          <p className="lead mb-5" data-aos="fade-up" data-aos-delay="200">Complete your order with confidence</p>
          <div className="d-flex justify-content-center gap-4" data-aos="fade-up" data-aos-delay="400">
            <div className="d-flex align-items-center">
              <i className="fas fa-shield-alt fa-2x me-2"></i>
              <span>Secure Payment</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-shipping-fast fa-2x me-2"></i>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="text-center mb-5" data-aos="fade-up">
                <h2 className="fw-bold text-dark mb-3">Complete Your Order</h2>
                <p className="text-muted fs-5">Fill in your shipping details to proceed with the checkout</p>
              </div>
              
              <div className="card border-0 shadow-lg" data-aos="fade-up" data-aos-delay="200" style={{borderRadius: '20px'}}>
                <div className="card-body p-4 p-md-5">
                  <form className="needs-validation" onSubmit={handleSubmit} noValidate>
                    <div className="row g-4">
                      <div className="col-12">
                        <h4 className="text-dark mb-4">
                          <i className="fas fa-shipping-fast me-2"></i>Shipping Information
                        </h4>
                      </div>
                      
                      <div className="col-12">
                        <div className="form-floating">
                          <textarea 
                            className="form-control" 
                            id="address" 
                            name="address"
                            placeholder="Address" 
                            required 
                            style={{borderRadius: '12px', border: '2px solid #e9ecef', minHeight: '120px'}}
                            value={formData.address}
                            onChange={handleChange}
                          ></textarea>
                          <label htmlFor="address" className="text-muted"><i className="fas fa-map-marker-alt me-2"></i>Complete Address</label>
                          <div className="invalid-feedback">Please provide your complete address.</div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="text" 
                            className="form-control" 
                            id="city" 
                            name="city"
                            placeholder="City" 
                            required 
                            style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            value={formData.city}
                            onChange={handleChange}
                          />
                          <label htmlFor="city" className="text-muted"><i className="fas fa-city me-2"></i>City</label>
                          <div className="invalid-feedback">Please provide your city.</div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="text" 
                            className="form-control" 
                            id="state" 
                            name="state"
                            placeholder="State" 
                            required 
                            style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            value={formData.state}
                            onChange={handleChange}
                          />
                          <label htmlFor="state" className="text-muted"><i className="fas fa-map me-2"></i>State</label>
                          <div className="invalid-feedback">Please provide your state.</div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="text" 
                            className="form-control" 
                            id="pincode" 
                            name="pincode"
                            placeholder="Pincode" 
                            required 
                            style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            value={formData.pincode}
                            onChange={handleChange}
                          />
                          <label htmlFor="pincode" className="text-muted"><i className="fas fa-mail-bulk me-2"></i>Pincode</label>
                          <div className="invalid-feedback">Please provide your pincode.</div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="card bg-light border-0" style={{borderRadius: '12px'}}>
                          <div className="card-body">
                            <h5 className="text-dark mb-3">
                              <i className="fas fa-receipt me-2"></i>Order Summary
                            </h5>
                            
                            <div className="order-items mb-4">
                              {cart.items?.map(item => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                  <div>
                                    <h6 className="mb-0 text-dark">{item.product.name.length > 30 ? item.product.name.substring(0, 30) + '...' : item.product.name}</h6>
                                    <small className="text-muted">Qty: {item.quantity} × ₹{parseFloat(item.product.price).toFixed(0)}</small>
                                  </div>
                                  <span className="text-dark fw-bold">₹{parseFloat(item.cost || item.product.price * item.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="summary-totals">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-dark">Subtotal:</span>
                                <span className="text-dark">₹{parseFloat(cart.total_price || 0).toFixed(0)}</span>
                              </div>
                              {cart.applied_offers && cart.applied_offers.length > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                  <span className="text-success">Discount:</span>
                                  <span className="text-success">-₹{(parseFloat(cart.total_price || 0) - parseFloat(cart.discounted_total || 0)).toFixed(0)}</span>
                                </div>
                              )}
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-dark">Shipping:</span>
                                <span className="text-success">Free</span>
                              </div>
                              <div className="d-flex justify-content-between mb-3 pt-2 border-top">
                                <h5 className="text-dark">Total:</h5>
                                <h4 className="text-success fw-bold">₹{totalAmount.toFixed(0)}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="alert alert-info border-0" style={{borderRadius: '12px'}}>
                          <i className="fas fa-info-circle me-2"></i>
                          Choose your preferred payment method below
                        </div>
                      </div>
                      
                      <div className="col-12 text-center">
                        <div className="d-grid gap-3">
                          <button
                            type="submit"
                            className="btn btn-success btn-lg py-3 shadow-lg"
                            disabled={loading}
                            style={{borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600'}}
                          >
                            <i className="fas fa-money-bill-wave me-2"></i>
                            {loading ? 'Processing...' : `Cash on Delivery (₹${totalAmount.toFixed(0)})`}
                          </button>
                          
                          <button
                            type="button"
                            className="btn btn-primary btn-lg py-3 shadow-lg"
                            onClick={() => navigate('/payment', { 
                              state: { 
                                amount: totalAmount, 
                                address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}` 
                              } 
                            })}
                            disabled={!formData.address || !formData.city || !formData.state || !formData.pincode}
                            style={{borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600'}}
                          >
                            <i className="fas fa-credit-card me-2"></i>
                            Pay with Card (₹{totalAmount.toFixed(0)})
                          </button>
                        </div>
                        <p className="text-muted mt-3 small">
                          <i className="fas fa-shield-alt me-1"></i>
                          Your payment information is secure and encrypted
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-5" style={{background: '#f8f9fa'}}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-dark">Why Shop With Us?</h2>
            <p className="text-muted">Your security and satisfaction are our priorities</p>
          </div>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: 'var(--color-primary)', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-shield-alt text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Secure Payment</h6>
                <small className="text-muted">SSL Encrypted</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#28a745', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-shipping-fast text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Fast Delivery</h6>
                <small className="text-muted">Same Day</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#dc3545', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-undo text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Easy Returns</h6>
                <small className="text-muted">30 Days</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="400">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#6f42c1', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-headset text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">24/7 Support</h6>
                <small className="text-muted">Always Here</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPayment && (
        <Elements stripe={stripePromise}>
          <StripePayment
            amount={totalAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={() => setShowPayment(false)}
          />
        </Elements>
      )}
    </div>
  );
};

export default Checkout;

// Add responsive styles and form validation
const styles = `
@media (max-width: 768px) {
  .hero-slide {
    height: 50vh !important;
  }
  .display-2 {
    font-size: 2rem !important;
  }
  .card-body {
    padding: 2rem 1.5rem !important;
  }
}

@media (max-width: 576px) {
  .hero-slide {
    height: 40vh !important;
  }
  .display-2 {
    font-size: 1.75rem !important;
  }
  .lead {
    font-size: 1rem !important;
  }
  .card-body {
    padding: 1.5rem 1rem !important;
  }
  .btn-lg {
    padding: 0.75rem 2rem !important;
    font-size: 1rem !important;
  }
}

.form-control:focus, .form-select:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
}

.form-floating > label {
  color: #6c757d !important;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.btn:hover {
  transform: translateY(-2px);
}
`;

// Inject styles and form validation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Form validation
  setTimeout(() => {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, 1000);
}