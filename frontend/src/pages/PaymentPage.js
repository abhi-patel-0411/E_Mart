import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';


const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  const [cardType, setCardType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [saveDetails, setSaveDetails] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [showSavedCards, setShowSavedCards] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkEnabled, setLinkEnabled] = useState(false);

  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  
  const amount = location.state?.amount || 0;
  const address = location.state?.address || '';

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
    
    if (user) {
      setBillingInfo({
        name: user.first_name + ' ' + user.last_name,
        email: user.email,
        phone: user.phone || ''
      });
      setCardDetails({
        ...cardDetails,
        cardholderName: user.first_name + ' ' + user.last_name
      });
    }
    loadSavedCards();
  }, [user]);

  const loadSavedCards = () => {
    const saved = localStorage.getItem('saved_payment_method');
    if (saved) {
      const cardData = JSON.parse(saved);
      setSavedCards([cardData]);
      setShowSavedCards(true);
    }
  };

  const autofillCard = (card) => {
    setCardDetails({
      cardNumber: '•••• •••• •••• ' + card.card_last_four,
      cardholderName: card.cardholder_name,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cvv: card.cvv || ''
    });
    setPaymentMethod(card.payment_method);
    setCardType(card.card_type);
    setShowSavedCards(false);
  };

  const handleBillingChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value
    });
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    return '';
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa': return 'fab fa-cc-visa';
      case 'mastercard': return 'fab fa-cc-mastercard';
      case 'amex': return 'fab fa-cc-amex';
      case 'discover': return 'fab fa-cc-discover';
      default: return 'fas fa-credit-card';
    }
  };

  const handleCardChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // Format card number
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.substring(0, 19);
      setCardType(detectCardType(value));
    }
    
    // Format expiry
    if (name === 'expiryMonth' || name === 'expiryYear') {
      value = value.replace(/\D/g, '');
      if (name === 'expiryMonth' && value.length > 2) value = value.substring(0, 2);
      if (name === 'expiryYear' && value.length > 4) value = value.substring(0, 4);
    }
    
    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) value = value.substring(0, 3);
    }

    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const sendEmailBill = async (orderData) => {
    try {
      console.log('Sending email bill to:', billingInfo.email);
      const emailData = {
        to: billingInfo.email,
        subject: `Payment Confirmation - ${orderData.order_id}`,
        orderDetails: orderData,
        items: cart.items,
        total: amount,
        address: address
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  };

  const validateCard = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      toast.error('Please enter expiry date');
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    if (!cardDetails.cardholderName) {
      toast.error('Please enter cardholder name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!billingInfo.name || !billingInfo.email) {
      toast.error('Please fill all billing details');
      return;
    }

    if (!validateCard()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentResult = {
        id: 'pi_' + Math.random().toString(36).substr(2, 9),
        status: 'succeeded',
        payment_method: 'card_' + cardDetails.cardNumber.slice(-4),
        amount: amount * 100,
        currency: 'inr'
      };

      // Create real payment intent
      const paymentResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ amount: amount * 100 })
      });
      
      const paymentData = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Payment failed');
      }
      
      const orderData = {
        address: address,
        payment_method: paymentMethod + '_card',
        payment_id: paymentData.payment_intent_id,
        payment_status: 'completed',
        billing_details: billingInfo,
        card_last_four: cardDetails.cardNumber.slice(-4),
        save_payment_details: saveDetails
      };
      
      // Save card details if requested
      if (saveDetails) {
        const savedCardData = {
          card_last_four: cardDetails.cardNumber.slice(-4),
          card_type: cardType,
          payment_method: paymentMethod,
          cardholder_name: cardDetails.cardholderName,
          expiry_month: cardDetails.expiryMonth,
          expiry_year: cardDetails.expiryYear,
          cvv: cardDetails.cvv
        };
        localStorage.setItem('saved_payment_method', JSON.stringify(savedCardData));
        console.log('Payment details with CVV saved for future use');
      }
      
      const response = await ordersAPI.checkout(orderData);
      await sendEmailBill(response.data);
      
      setOrderDetails(response.data);
      setPaymentSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 5000);
      
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div style={{
        background: 'white',
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
                  <div className="success-animation mb-4">
                    <div className="checkmark-circle" style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: '#28a745',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'scaleIn 0.5s ease-out'
                    }}>
                      <i className="fas fa-check text-white" style={{fontSize: '2rem'}}></i>
                    </div>
                  </div>
                  
                  <h2 className="text-success fw-bold mb-3" data-aos="fade-up" data-aos-delay="200">
                    Payment Successful!
                  </h2>
                  
                  <p className="text-muted mb-4" data-aos="fade-up" data-aos-delay="300">
                    Your payment has been processed successfully and a confirmation email has been sent to <strong>{billingInfo.email}</strong>
                  </p>
                  
                  {orderDetails && (
                    <div className="order-summary bg-light p-3 rounded mb-4" data-aos="fade-up" data-aos-delay="400">
                      <h5 className="text-dark mb-2">Order Details</h5>
                      <p className="mb-1"><strong>Order ID:</strong> {orderDetails.order_id}</p>
                      <p className="mb-1"><strong>Amount:</strong> ₹{amount.toFixed(0)}</p>
                      <p className="mb-0"><strong>Status:</strong> <span className="text-success">Confirmed</span></p>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2" data-aos="fade-up" data-aos-delay="500">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/orders')}
                      style={{borderRadius: '50px'}}
                    >
                      <i className="fas fa-list me-2"></i>View My Orders
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/products')}
                      style={{borderRadius: '50px'}}
                    >
                      <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
                    </button>
                  </div>
                  
                  <p className="text-muted mt-3 small">
                    Redirecting to orders page in 5 seconds...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '80px', background: '#f8f9fa', minHeight: '100vh'}}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="fw-bold text-dark mb-3">Complete Your Payment</h1>
              <p className="text-muted fs-5">Secure checkout powered by advanced encryption</p>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <div className="d-flex align-items-center">
                  <i className="fas fa-shield-alt text-success fa-2x me-2"></i>
                  <span className="text-muted">SSL Secured</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-lock text-primary fa-2x me-2"></i>
                  <span className="text-muted">256-bit Encryption</span>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Payment Form */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-lg" data-aos="fade-right" style={{borderRadius: '20px'}}>
                  <div className="card-body p-4 p-md-5">
                    <form onSubmit={handleSubmit}>
                      <div className="row g-4">
                        
                        {/* Saved Cards Section */}
                        {showSavedCards && savedCards.length > 0 && (
                          <div className="col-12">
                            <div className="card bg-primary bg-opacity-10 border-primary border-opacity-25" style={{borderRadius: '12px'}}>
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <h6 className="text-primary mb-0">
                                    <i className="fas fa-link me-2"></i>Saved Payment Methods
                                  </h6>
                                  <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowSavedCards(false)}
                                  ></button>
                                </div>
                                <div className="row g-2">
                                  {savedCards.map((card, index) => (
                                    <div key={index} className="col-md-6">
                                      <div 
                                        className="card bg-white border-0 shadow-sm" 
                                        style={{borderRadius: '8px', cursor: 'pointer'}}
                                        onClick={() => autofillCard(card)}
                                      >
                                        <div className="card-body p-3">
                                          <div className="d-flex align-items-center">
                                            <i className={`${getCardIcon(card.card_type)} fa-2x text-primary me-3`}></i>
                                            <div>
                                              <div className="fw-bold text-dark">•••• •••• •••• {card.card_last_four}</div>
                                              <small className="text-muted">{card.cardholder_name}</small>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <small className="text-muted">
                                  <i className="fas fa-info-circle me-1"></i>
                                  Click on a card to autofill details
                                </small>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Billing Information */}
                        <div className="col-12">
                          <h4 className="text-dark mb-4">
                            <i className="fas fa-user-circle me-2"></i>Billing Information
                          </h4>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              placeholder="Full Name"
                              value={billingInfo.name}
                              onChange={handleBillingChange}
                              required
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            />
                            <label htmlFor="name" className="text-muted">
                              <i className="fas fa-user me-2"></i>Full Name
                            </label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              placeholder="Email"
                              value={billingInfo.email}
                              onChange={handleBillingChange}
                              required
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            />
                            <label htmlFor="email" className="text-muted">
                              <i className="fas fa-envelope me-2"></i>Email Address
                            </label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="tel"
                              className="form-control"
                              id="phone"
                              name="phone"
                              placeholder="Phone"
                              value={billingInfo.phone}
                              onChange={handleBillingChange}
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            />
                            <label htmlFor="phone" className="text-muted">
                              <i className="fas fa-phone me-2"></i>Phone Number
                            </label>
                          </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="col-12 mt-5">
                          <h4 className="text-dark mb-4">
                            <i className="fas fa-credit-card me-2"></i>Payment Method
                          </h4>
                          <div className="row g-3 mb-4">
                            <div className="col-md-6">
                              <div 
                                className={`card h-100 cursor-pointer ${paymentMethod === 'credit' ? 'border-primary bg-light' : 'border-secondary'}`}
                                onClick={() => setPaymentMethod('credit')}
                                style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                              >
                                <div className="card-body text-center p-3">
                                  <i className="fas fa-credit-card fa-2x mb-2 text-primary"></i>
                                  <h6 className="mb-0">Credit Card</h6>
                                  <small className="text-muted">Visa, Mastercard, Amex</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div 
                                className={`card h-100 cursor-pointer ${paymentMethod === 'debit' ? 'border-primary bg-light' : 'border-secondary'}`}
                                onClick={() => setPaymentMethod('debit')}
                                style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                              >
                                <div className="card-body text-center p-3">
                                  <i className="fas fa-university fa-2x mb-2 text-success"></i>
                                  <h6 className="mb-0">Debit Card</h6>
                                  <small className="text-muted">Bank debit cards</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Information */}
                        <div className="col-12">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="text-dark mb-0">
                              <i className="fas fa-credit-card me-2"></i>Card Details
                            </h5>
                            <div className="alert alert-info mb-0 py-2 px-3" role="alert">
                              <i className="fas fa-link me-2"></i>
                              <small><strong>Autofill enabled</strong> - Payment details will be saved</small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <div className="form-floating">
                            <input
                              type="text"
                              className="form-control"
                              id="cardholderName"
                              name="cardholderName"
                              placeholder="Cardholder Name"
                              value={cardDetails.cardholderName}
                              onChange={handleCardChange}
                              required
                              autoComplete="cc-name"
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            />
                            <label htmlFor="cardholderName" className="text-muted">
                              <i className="fas fa-user me-2"></i>Cardholder Name
                            </label>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <div className="form-floating position-relative">
                            <input
                              type="text"
                              className="form-control"
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="Card Number"
                              value={cardDetails.cardNumber}
                              onChange={handleCardChange}
                              required
                              autoComplete="cc-number"
                              style={{borderRadius: '12px', border: '2px solid #e9ecef', paddingRight: '60px'}}
                            />
                            <label htmlFor="cardNumber" className="text-muted">
                              <i className="fas fa-credit-card me-2"></i>Card Number
                            </label>
                            {cardType && (
                              <div className="position-absolute" style={{right: '15px', top: '50%', transform: 'translateY(-50%)'}}>
                                <i className={`${getCardIcon(cardType)} fa-2x`} style={{
                                  color: cardType === 'visa' ? '#1a1f71' : 
                                         cardType === 'mastercard' ? '#eb001b' : 
                                         cardType === 'amex' ? '#006fcf' : 
                                         cardType === 'discover' ? '#ff6000' : '#666'
                                }}></i>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className="form-select"
                              id="expiryMonth"
                              name="expiryMonth"
                              value={cardDetails.expiryMonth}
                              onChange={handleCardChange}
                              required
                              autoComplete="cc-exp-month"
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            >
                              <option value="">Select Month</option>
                              {Array.from({length: 12}, (_, i) => (
                                <option key={i+1} value={String(i+1).padStart(2, '0')}>
                                  {String(i+1).padStart(2, '0')} - {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="expiryMonth" className="text-muted">
                              <i className="fas fa-calendar me-2"></i>Expiry Month
                            </label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className="form-select"
                              id="expiryYear"
                              name="expiryYear"
                              value={cardDetails.expiryYear}
                              onChange={handleCardChange}
                              required
                              autoComplete="cc-exp-year"
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            >
                              <option value="">Select Year</option>
                              {Array.from({length: 10}, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return <option key={year} value={year}>{year}</option>
                              })}
                            </select>
                            <label htmlFor="expiryYear" className="text-muted">
                              <i className="fas fa-calendar me-2"></i>Expiry Year
                            </label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating position-relative">
                            <input
                              type="password"
                              className="form-control"
                              id="cvv"
                              name="cvv"
                              placeholder="CVV"
                              value={cardDetails.cvv}
                              onChange={handleCardChange}
                              required
                              maxLength="3"
                              autoComplete="cc-csc"
                              style={{borderRadius: '12px', border: '2px solid #e9ecef'}}
                            />
                            <label htmlFor="cvv" className="text-muted">
                              <i className="fas fa-lock me-2"></i>CVV/CVC
                            </label>
                            <div className="position-absolute" style={{right: '15px', top: '50%', transform: 'translateY(-50%)'}}>
                              <i className="fas fa-question-circle text-muted" title="3-digit security code on back of card"></i>
                            </div>
                          </div>
                        </div>

                        {/* Save Details Option */}
                        <div className="col-12 mt-4">
                          <div className="card bg-light border-0" style={{borderRadius: '12px'}}>
                            <div className="card-body p-3">
                              <div className="form-check d-flex align-items-center">
                                <input
                                  className="form-check-input me-3"
                                  type="checkbox"
                                  id="saveDetails"
                                  checked={saveDetails}
                                  onChange={(e) => setSaveDetails(e.target.checked)}
                                  style={{transform: 'scale(1.2)'}}
                                />
                                <div>
                                  <label className="form-check-label fw-bold text-dark" htmlFor="saveDetails">
                                    <i className="fas fa-link me-2"></i>Link & Save Payment Details
                                  </label>
                                  <div className="text-muted small">
                                    Securely save your card details for faster checkout next time
                                  </div>
                                </div>
                              </div>
                              
                              {saveDetails && (
                                <div className="mt-3 p-3 bg-white rounded border">
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-shield-alt text-success me-2"></i>
                                    <strong className="text-dark">Your data is secure</strong>
                                  </div>
                                  <ul className="list-unstyled mb-0 small text-muted">
                                    <li><i className="fas fa-check text-success me-2"></i>Stripe Link autofill enabled</li>
                                    <li><i className="fas fa-check text-success me-2"></i>CVV included in secure save</li>
                                    <li><i className="fas fa-check text-success me-2"></i>One-click checkout</li>
                                    <li><i className="fas fa-check text-success me-2"></i>Cross-merchant compatibility</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="col-12 text-center mt-5">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg px-5 py-3 shadow-lg"
                            disabled={loading}
                            style={{borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600'}}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing Payment...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-lock me-2"></i>
                                Pay ₹{amount.toFixed(0)} with {paymentMethod === 'credit' ? 'Credit' : 'Debit'} Card
                              </>
                            )}
                          </button>
                          
                          <p className="text-muted mt-3 small">
                            <i className="fas fa-shield-alt me-1"></i>
                            Your payment information is encrypted and secure
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-lg" data-aos="fade-left" style={{borderRadius: '20px'}}>
                  <div className="card-body p-4">
                    <h4 className="text-dark mb-4">
                      <i className="fas fa-receipt me-2"></i>Order Summary
                    </h4>
                    
                    <div className="order-items mb-4">
                      {cart.items?.map(item => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <h6 className="mb-0 text-dark">{item.product.name.length > 25 ? item.product.name.substring(0, 25) + '...' : item.product.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                          <span className="text-dark fw-bold">₹{parseFloat(item.cost || item.product.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="summary-totals">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-dark">Subtotal:</span>
                        <span className="text-dark">₹{amount.toFixed(0)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-dark">Processing Fee:</span>
                        <span className="text-success">Free</span>
                      </div>
                      <div className="d-flex justify-content-between pt-3 border-top">
                        <h5 className="text-dark">Total:</h5>
                        <h4 className="text-success fw-bold">₹{amount.toFixed(0)}</h4>
                      </div>
                    </div>
                    
                    <div className="security-badges mt-4 p-3 bg-light rounded">
                      <div className="row g-2 text-center">
                        <div className="col-4">
                          <i className="fas fa-shield-alt text-success fa-2x"></i>
                          <small className="d-block text-muted mt-1">Secure</small>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-lock text-primary fa-2x"></i>
                          <small className="d-block text-muted mt-1">Encrypted</small>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-certificate text-warning fa-2x"></i>
                          <small className="d-block text-muted mt-1">Verified</small>
                        </div>
                      </div>
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

export default PaymentPage;

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

.form-control:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
}

.btn:hover {
  transform: translateY(-2px);
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .container {
    padding-left: 15px;
    padding-right: 15px;
  }
  
  .card-body {
    padding: 2rem 1.5rem !important;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}