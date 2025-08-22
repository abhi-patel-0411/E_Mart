import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OfferBadge from '../components/OfferBadge';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const fetchActiveOffers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/offers/active/`);
      if (response.ok) {
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading offers...</h5>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '80px', paddingBottom: '80px'}}>
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-5 mb-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            <i className="fas fa-tags me-3"></i>Special Offers
          </h1>
          <p className="lead">Discover amazing deals and save big on your favorite products!</p>
        </div>
      </div>

      <div className="container">
        {offers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-tags fa-4x text-muted mb-4"></i>
            <h3 className="text-muted mb-3">No Active Offers</h3>
            <p className="text-muted mb-4">Check back later for exciting deals and discounts!</p>
            <Link to="/products" className="btn btn-primary">
              <i className="fas fa-shopping-bag me-2"></i>Browse Products
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {offers.map((offer) => (
              <div key={offer.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title text-dark fw-bold">{offer.name}</h5>
                      <OfferBadge offer={offer} />
                    </div>
                    
                    <p className="card-text text-muted mb-3">{offer.description}</p>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Offer Code:</span>
                        <code className="bg-light px-2 py-1 rounded">{offer.code}</code>
                      </div>
                      
                      {offer.valid_until && (
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Valid Until:</span>
                          <span className="text-dark fw-bold">
                            {new Date(offer.valid_until).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      to="/products" 
                      className="btn btn-primary w-100"
                    >
                      <i className="fas fa-shopping-bag me-2"></i>Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;