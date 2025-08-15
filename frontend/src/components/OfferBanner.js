import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './OfferStyles.css';

const OfferBanner = () => {
  const [offers, setOffers] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(0);

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOffer((prev) => (prev + 1) % offers.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  const fetchActiveOffers = async () => {
    try {
      const response = await api.get('/offers/');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  if (offers.length === 0) return null;

  const offer = offers[currentOffer];

  return (
    <div className="offer-banner text-white py-3 mb-0" style={{
      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite'
    }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-center text-center">
              <div className="me-3">
                <i className="fas fa-fire fa-lg" style={{animation: 'pulse 2s infinite'}}></i>
              </div>
              <div className="offer-content flex-grow-1">
                <div className="d-flex align-items-center justify-content-center flex-wrap">
                  <span className="badge bg-warning text-dark me-2 fw-bold px-3 py-2">
                    🔥 LIVE OFFER
                  </span>
                  <div className="offer-text">
                    <strong className="fs-5">{offer.name}</strong>
                    {offer.offer_type === 'buy_one_get_one' && (
                      <span className="ms-2">
                        <i className="fas fa-gift me-1"></i>
                        <strong>BUY 1 GET 1 ABSOLUTELY FREE!</strong>
                      </span>
                    )}
                  </div>
                  <span className="badge bg-success ms-2 fw-bold px-3 py-2">
                    💰 SAVE 50%
                  </span>
                </div>
                <div className="mt-1">
                  <small className="opacity-75">
                    <i className="fas fa-clock me-1"></i>
                    Limited Time • No Coupon Required • Auto Applied at Checkout
                  </small>
                </div>
              </div>
              <div className="ms-3">
                <i className="fas fa-bolt fa-lg" style={{animation: 'pulse 2s infinite'}}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default OfferBanner;