import React, { useState, useEffect } from 'react';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/offers/`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOffer = async (offerCode) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to apply offers');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/cart/apply-offer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer_code: offerCode }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Offer applied! Discount: ₹${data.discount_amount}`);
      } else {
        alert(data.error || 'Failed to apply offer');
      }
    } catch (error) {
      alert('Failed to apply offer');
    }
  };

  const getOfferIcon = (type) => {
    const icons = {
      'discount': '🏷️',
      'flat': '💰',
      'bogo': '🎁',
      'buy_x_get_y': '🛍️',
      'combo': '📦',
      'category_offer': '🏪',
      'first_time': '⭐'
    };
    return icons[type] || '🎯';
  };

  const getBadgeClass = (type) => {
    const classes = {
      'discount': 'bg-danger',
      'flat': 'bg-success',
      'bogo': 'bg-primary',
      'buy_x_get_y': 'bg-info',
      'combo': 'bg-warning',
      'category_offer': 'bg-secondary',
      'first_time': 'bg-dark'
    };
    return classes[type] || 'bg-primary';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">🎯 Special Offers</h1>
        <p className="lead text-muted">Grab these amazing deals before they expire!</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1">🎁</div>
          <h3 className="mt-3">No Offers Available</h3>
          <p className="text-muted">Check back later for exciting deals!</p>
        </div>
      ) : (
        <div className="row g-4">
          {offers.map((offer) => (
            <div key={offer.id} className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border-0 offer-card">
                <div className="card-header bg-gradient text-white text-center position-relative" 
                     style={{background: 'linear-gradient(45deg, #667eea, #764ba2)'}}>
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className={`badge ${getBadgeClass(offer.offer_type)} rounded-pill`}>
                      {offer.badge_text || offer.offer_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="py-3">
                    <div className="display-4">{getOfferIcon(offer.offer_type)}</div>
                    <h5 className="card-title mb-0">{offer.name}</h5>
                  </div>
                </div>
                
                <div className="card-body d-flex flex-column">
                  <p className="card-text text-muted mb-3">{offer.description}</p>
                  
                  <div className="mb-3">
                    <small className="text-muted">Offer Code:</small>
                    <div className="d-flex align-items-center mt-1">
                      <code className="bg-light px-2 py-1 rounded me-2 flex-grow-1">{offer.code}</code>
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigator.clipboard.writeText(offer.code)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {offer.first_time_only && (
                    <div className="alert alert-warning py-2 mb-3">
                      <small><i className="bi bi-star-fill me-1"></i>First-time users only</small>
                    </div>
                  )}

                  <div className="mt-auto">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => applyOffer(offer.code)}
                    >
                      Apply Offer
                    </button>
                  </div>
                </div>

                <div className="card-footer bg-light text-center">
                  <small className="text-muted">
                    Valid till {new Date(offer.end_date).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;