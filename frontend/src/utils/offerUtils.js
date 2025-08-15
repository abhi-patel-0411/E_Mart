import { toast } from 'react-toastify';

// Apply an offer to the cart
export const applyOfferToCart = async (offerId, offerCode) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to apply offers');
      return { success: false, error: 'Authentication required' };
    }
    
    const payload = {};
    if (offerId) payload.offer_id = offerId;
    if (offerCode) payload.offer_code = offerCode;
    
    if (!offerId && !offerCode) {
      return { success: false, error: 'Offer ID or code required' };
    }
    
    console.log('Applying offer with payload:', payload);
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/offers/apply/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Apply offer response:', data);
    
    if (response.ok) {
      // Handle multiple offers scenario
      if (data.multiple_offers_applied) {
        toast.success(`${data.multiple_offers_applied} offers applied successfully!`);
      } else if (data.replaced_offer) {
        toast.info(`Previous offer "${data.replaced_offer}" was replaced with "${data.message.split('"')[1]}"`);
      } else {
        toast.success(data.message || 'Offer applied successfully!');
      }
      return { success: true, data };
    } else {
      // Handle specific error cases
      if (data.error === 'OFFER_ALREADY_APPLIED') {
        toast.warning('This offer is already applied to your cart');
      } else if (data.error === 'MINIMUM_ORDER_NOT_MET') {
        toast.error(`Minimum order value of ₹${data.min_order_value} required`);
      } else {
        toast.error(data.error || 'Failed to apply offer');
      }
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error applying offer:', error);
    toast.error('Failed to apply offer');
    return { success: false, error: 'Network error' };
  }
};

// Remove an offer from the cart
export const removeOfferFromCart = async (offerId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to remove offers');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/offers/remove/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offer_id: offerId }),
    });

    const data = await response.json();
    
    if (response.ok) {
      toast.success('Offer removed successfully');
      return { success: true, data };
    } else {
      toast.error(data.error || 'Failed to remove offer');
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error removing offer:', error);
    toast.error('Failed to remove offer');
    return { success: false, error: 'Network error' };
  }
};

// Check if a combo offer can be applied (all required products in cart)
export const checkComboOfferEligibility = async (offer) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return { eligible: false, missingProducts: [] };
    
    // Use the dedicated endpoint to check eligibility
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/offers/check-combo-eligibility/${offer.id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) return { eligible: false, missingProducts: [] };
    
    const data = await response.json();
    return { 
      eligible: data.eligible,
      missingProducts: data.missing_products || []
    };
  } catch (error) {
    console.error('Error checking combo eligibility:', error);
    return { eligible: false, missingProducts: [] };
  }
};