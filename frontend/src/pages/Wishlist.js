import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistItems(items => items.filter(item => item.product.id !== productId));
      toast.success('Item removed from wishlist!');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 bg-light">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-user-lock fa-4x text-primary mb-3"></i>
                  <h2 className="h4 fw-bold text-dark">Access Required</h2>
                  <p className="text-muted">Please login to view your wishlist and save your favorite items</p>
                </div>
                <Link to="/login" className="btn btn-primary btn-lg px-4 py-2 rounded-pill">
                  <i className="fas fa-sign-in-alt me-2"></i>Login to Continue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 bg-light">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-muted">Loading your wishlist...</h4>
          </div>
        </div>
      </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div style={{paddingTop: '100px'}}>
        <div className="container py-5 bg-light">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-heart fa-4x text-muted mb-3"></i>
                  <h2 className="h4 fw-bold text-dark">Your wishlist is empty</h2>
                  <p className="text-muted">Discover amazing products and save your favorites here!</p>
                </div>
                <Link to="/products" className="btn btn-primary btn-lg px-4 py-2 rounded-pill">
                  <i className="fas fa-shopping-bag me-2"></i>Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop: '100px'}}>
      <div className="container py-5 bg-light">
      {/* Header Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="text-center mb-4">
            <h1 className="h2 fw-bold text-dark mb-2">
              <i className="fas fa-heart text-danger me-2"></i>
              My Wishlist
            </h1>
            <p className="text-muted">Your saved favorites - {wishlistItems.length} items</p>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="row g-3 g-md-4">
        {wishlistItems.map(item => (
          <div key={item.id} className="col-6 col-sm-6 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm hover-card">
              <div className="position-relative">
                <Link to={`/products/${item.product.slug}`}>
                  <img
                    src={item.product.image_url || '/api/placeholder/300/250'}
                    className="card-img-top"
                    alt={item.product.name}
                    style={{ height: '200px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                  />
                </Link>
                <button
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  style={{ width: '36px', height: '36px' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="card-body d-flex flex-column">
                <h6 className="card-title fw-semibold" style={{fontSize: '0.9rem'}}>
                  <Link to={`/products/${item.product.slug}`} className="text-decoration-none text-dark hover-link">
                    {item.product.name.length > 40 ? item.product.name.substring(0, 40) + '...' : item.product.name}
                  </Link>
                </h6>
                <p className="card-text text-muted small flex-grow-1 d-none d-md-block">
                  {item.product.description?.substring(0, 80)}...
                </p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="text-success mb-0 fw-bold">₹{(parseFloat(item.product.price) * 83).toFixed(0)}</h5>
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/products/${item.product.slug}`}
                      className="btn btn-primary btn-sm px-3"
                    >
                      <i className="fas fa-eye me-1"></i>View
                    </Link>
                  </div>
                </div>
                <small className="text-muted">
                  <i className="fas fa-calendar me-1"></i>
                  Added on {new Date(item.added_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .hover-link:hover {
          color: var(--bs-primary) !important;
        }
      `}</style>
    </div>
    </div>
  );
};

export default Wishlist;