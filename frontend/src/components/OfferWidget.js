import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OfferWidget = ({ onOfferApplied }) => {
  const { isAuthenticated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartOffers();
    }
  }, [isAuthenticated]);

  // Fetch offers when component mounts or cart changes
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchCartOffers();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchCartOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/cart/offers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.available_offers || []);
        setAppliedOffers(data.applied_offers || []);
        // Auto-apply is now handled by the backend automatically
      }
    } catch (error) {
      console.error('Error fetching cart offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOffer = async (offerId, isAutoApply = false) => {
    try {
      setApplying(offerId);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/cart/apply-offer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer_id: offerId }),
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        if (!isAutoApply) {
          toast.success(`Offer applied! Saved ₹${data.discount_amount}`);
        }
        onOfferApplied && onOfferApplied();
        fetchCartOffers();
      } else {
        if (!isAutoApply) {
          toast.error(data.error || 'Failed to apply offer');
        }
      }
    } catch (error) {
      if (!isAutoApply) {
        toast.error('Failed to apply offer');
      }
    } finally {
      setApplying(null);
    }
  };

  const removeOffer = async (offerId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/cart/remove-offer/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer_id: offerId }),
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Offer removed');
        onOfferApplied && onOfferApplied();
        fetchCartOffers();
      } else {
        toast.error(data.error || 'Failed to remove offer');
      }
    } catch (error) {
      toast.error('Failed to remove offer');
    }
  };

  const getOfferIcon = (offerType) => {
    switch (offerType) {
      case 'discount':
      case 'category_offer':
      case 'first_time':
        return 'fa-percentage';
      case 'flat':
        return 'fa-tag';
      case 'combo':
        return 'fa-layer-group';
      default:
        return 'fa-star';
    }
  };

  const getOfferDescription = (offer) => {
    switch (offer.offer_type) {
      case 'discount':
      case 'category_offer':
      case 'first_time':
        return `Get ${offer.discount_percentage || 'Extra'}% OFF`;
      case 'flat':
        return `Save ₹${offer.discount_amount}`;
      case 'combo':
        return 'Special Combo Price!';
      default:
        return offer.description || 'Special Offer';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading offers...</span>
        </div>
      </div>
    );
  }

  const manualOffers = offers.filter(offer => !offer.auto_apply);
  const autoAppliedOffers = appliedOffers.filter(offer => offer.auto_apply);
  const manualAppliedOffers = appliedOffers.filter(offer => !offer.auto_apply);

  return (
    <div className="offer-widget mb-4">
      {/* Applied Offers Section */}
      {appliedOffers.length > 0 && (
        <div className="card border-success mb-3">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">
              <i className="fas fa-check-circle me-2"></i>
              Applied Offers ({appliedOffers.length})
              {autoAppliedOffers.length > 0 && (
                <small className="ms-2 opacity-75">
                  ({autoAppliedOffers.length} auto + {manualAppliedOffers.length} manual)
                </small>
              )}
            </h6>
          </div>
          <div className="card-body p-0">
            {/* Auto Applied Offers */}
            {autoAppliedOffers.length > 0 && (
              <div className="bg-light p-2">
                <small className="text-muted fw-bold">
                  <i className="fas fa-magic me-1"></i>
                  Auto Applied Offers
                </small>
              </div>
            )}
            {autoAppliedOffers.map((offer) => (
              <div key={offer.offer_id} className="border-bottom p-3 bg-light bg-opacity-50">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 text-success">
                      <i className={`fas ${getOfferIcon(offer.offer_type)} me-2`}></i>
                      {offer.offer_name}
                      <span className="badge bg-info ms-2">Auto Applied</span>
                    </h6>
                    <p className="text-muted mb-1 small">{getOfferDescription(offer)}</p>
                    <span className="badge bg-success">
                      Saved ₹{Math.round(offer.discount_amount)}
                    </span>
                  </div>
                  <div className="text-muted small">
                    <i className="fas fa-lock"></i>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Manual Applied Offers */}
            {manualAppliedOffers.length > 0 && (
              <div className="bg-primary bg-opacity-10 p-2">
                <small className="text-primary fw-bold">
                  <i className="fas fa-hand-pointer me-1"></i>
                  Your Selected Offer
                </small>
              </div>
            )}
            {manualAppliedOffers.map((offer) => (
              <div key={offer.offer_id} className="border-bottom p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 text-primary">
                      <i className={`fas ${getOfferIcon(offer.offer_type)} me-2`}></i>
                      {offer.offer_name}
                    </h6>
                    <p className="text-muted mb-1 small">{getOfferDescription(offer)}</p>
                    <span className="badge bg-success">
                      Saved ₹{Math.round(offer.discount_amount)}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeOffer(offer.offer_id)}
                  >
                    <i className="fas fa-times me-1"></i>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Manual Offers */}
      {manualOffers.length > 0 && (
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">
              <i className="fas fa-tags me-2"></i>
              Available Offers ({manualOffers.length})
              {manualAppliedOffers.length > 0 ? (
                <small className="ms-2 opacity-75">
                  (Replace current offer to select another)
                </small>
              ) : (
                <small className="ms-2 opacity-75">
                  (Select 1 offer)
                </small>
              )}
            </h6>
          </div>
          <div className="card-body p-0">
            {manualOffers.map((offer) => {
              const canApply = manualAppliedOffers.length === 0;
              return (
                <div key={offer.id} className="border-bottom p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <i className={`fas ${getOfferIcon(offer.offer_type)} text-primary me-2`}></i>
                        <h6 className="mb-0">{offer.name}</h6>
                        {offer.priority === 'high' && (
                          <span className="badge bg-danger ms-2">HOT</span>
                        )}
                      </div>
                      
                      <p className="text-muted mb-2 small">{getOfferDescription(offer)}</p>
                      
                      {offer.description && (
                        <p className="text-secondary mb-2 small">{offer.description}</p>
                      )}
                      
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success me-2">
                          Save ₹{Math.round(offer.estimated_discount || 0)}
                        </span>
                        {offer.min_order_value > 0 && (
                          <span className="badge bg-info me-2">
                            Min ₹{offer.min_order_value}
                          </span>
                        )}
                        <span className="badge bg-secondary">
                          Code: {offer.code}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-end">
                      <button
                        className={`btn btn-sm ${canApply ? 'btn-primary' : 'btn-warning'}`}
                        onClick={() => applyOffer(offer.id)}
                        disabled={applying === offer.id}
                        title={!canApply ? 'This will replace your current offer' : 'Apply this offer'}
                      >
                        {applying === offer.id ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            Applying...
                          </>
                        ) : canApply ? (
                          <>
                            <i className="fas fa-plus me-1"></i>
                            Apply
                          </>
                        ) : (
                          <>
                            <i className="fas fa-exchange-alt me-1"></i>
                            Replace
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {offers.length === 0 && appliedOffers.length === 0 && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No offers available for your cart items
        </div>
      )}
    </div>
  );
};

export default OfferWidget;