import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ProductOffers = ({ product }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product?.id) {
      fetchProductOffers();
      // Check for expired offers every 5 seconds
      const interval = setInterval(() => {
        filterExpiredOffers();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product]);

  const fetchProductOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${product.id}/offers/`);
      const validOffers = filterValidOffers(response.data.offers || []);
      setOffers(validOffers);
    } catch (error) {
      console.error('Error fetching product offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterValidOffers = (offersList) => {
    const now = new Date();
    return offersList.filter(offer => {
      if (!offer.end_date) return true;
      const endDate = new Date(offer.end_date);
      return now < endDate && offer.is_active;
    });
  };

  const filterExpiredOffers = () => {
    const validOffers = filterValidOffers(offers);
    if (validOffers.length !== offers.length) {
      setOffers(validOffers);
    }
  };

  if (loading) return (
    <div className="offer-placeholder">
      <div className="small text-muted">Loading offers...</div>
    </div>
  );
  
  // Filter expired offers in real-time
  const validOffers = filterValidOffers(offers);
  
  if (!validOffers.length) return (
    <div className="offer-placeholder">
      <div className="no-offers-space"></div>
    </div>
  );

  const getOfferIcon = (offerType) => {
    switch (offerType) {
      case 'discount': return 'fa-percent';
      case 'flat': return 'fa-tag';
      case 'combo': return 'fa-box';
      case 'category_offer': return 'fa-folder';
      case 'first_time': return 'fa-star';
      default: return 'fa-gift';
    }
  };

  const getOfferBadgeClass = (offerType) => {
    switch (offerType) {
      case 'discount': return 'bg-success';
      case 'flat': return 'bg-info';
      case 'combo': return 'bg-warning text-dark';
      case 'category_offer': return 'bg-primary';
      case 'first_time': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Group offers by type
  const comboOffers = offers.filter(o => o.offer_type === 'combo');
  const discountOffers = offers.filter(o => o.offer_type === 'discount' || o.offer_type === 'flat');
  const categoryOffers = offers.filter(o => o.offer_type === 'category_offer');
  const otherOffers = offers.filter(o => 
    o.offer_type !== 'combo' && 
    o.offer_type !== 'discount' && 
    o.offer_type !== 'flat' && 
    o.offer_type !== 'category_offer'
  );

  const hasOffers = validOffers.length > 0;
  
  return (
    <div className="product-offers-overlay">
      {hasOffers && (
        <span className="offers-count-span">
          offers{validOffers.length}
        </span>
      )}
    </div>
  );
};

export default ProductOffers;

// Add CSS styles
const styles = `
.product-offers-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 8px;
}

.offers-count-span {
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  backdrop-filter: blur(2px);
  white-space: nowrap;
}

@media (max-width: 576px) {
  .offers-count-span {
    font-size: 0.6rem;
    padding: 3px 6px;
  }
  
  .product-offers-overlay {
    padding: 6px;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.querySelector('#product-offers-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'product-offers-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}