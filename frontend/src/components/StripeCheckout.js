import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './StripeCheckout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onError, orderData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'inr'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.client_secret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onError(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Customer',
            email: user?.email || 'customer@example.com',
          },
        },
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess({
          paymentIntent,
          orderData
        });
      }
    } catch (err) {
      onError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="stripe-checkout">
      <div className="payment-header">
        <h3>
          <i className="fas fa-credit-card me-2"></i>
          Secure Payment
        </h3>
        <p className="text-muted">Pay safely with your card</p>
      </div>

      <div className="amount-display">
        <div className="amount-card">
          <span className="amount-label">Total Amount</span>
          <span className="amount-value">₹{amount}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-input-section">
          <label className="form-label">
            <i className="fas fa-credit-card me-2"></i>
            Card Information
          </label>
          <div className="card-element-container">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="security-info">
          <div className="security-badges">
            <span className="badge bg-success">
              <i className="fas fa-shield-alt me-1"></i>
              SSL Secured
            </span>
            <span className="badge bg-primary">
              <i className="fab fa-stripe me-1"></i>
              Powered by Stripe
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className="btn btn-primary btn-lg w-100 pay-button"
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-lock me-2"></i>
              Pay ₹{amount}
            </>
          )}
        </button>
      </form>

      <div className="payment-footer">
        <div className="security-text">
          <i className="fas fa-shield-alt text-success me-2"></i>
          Your payment information is encrypted and secure
        </div>
      </div>
    </div>
  );
};

const StripeCheckout = ({ amount, onSuccess, onError, orderData }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError}
        orderData={orderData}
      />
    </Elements>
  );
};

export default StripeCheckout;