import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

const Compare = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { 
    compareItems, 
    loading, 
    removeFromCompare, 
    clearCompare, 
    fetchCompareItems 
  } = useCompare();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompareItems();
    }
  }, [isAuthenticated]);

  const handleRemoveFromCompare = async (productId) => {
    const result = await removeFromCompare(productId);
    if (result.success) {
      toast.success('Product removed from compare');
    } else {
      toast.error(result.error);
    }
  };

  const handleClearCompare = async () => {
    const result = await clearCompare();
    if (result.success) {
      toast.success('Compare list cleared');
    } else {
      toast.error(result.error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product.id);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-muted"></i>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', paddingTop: '100px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white">Loading Compare...</h4>
        </div>
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div style={{paddingTop: '100px', minHeight: '100vh'}}>
        <div className="container py-5">
          <div className="text-center">
            <div className="modern-product-card mx-auto" style={{maxWidth: '600px'}}>
              <div className="product-content p-5">
                <div className="mb-4">
                  <i className="fas fa-balance-scale" style={{fontSize: '4rem', color: '#667eea'}}></i>
                </div>
                <h1 className="product-title display-5 mb-4">Compare Products</h1>
                <p className="text-muted mb-4 lead">Compare features, specifications, and prices to make the best choice</p>
                <div className="alert alert-info d-flex align-items-center mb-4">
                  <i className="fas fa-info-circle me-3"></i>
                  <div className="text-start">
                    <strong>How to compare:</strong>
                    <div className="small mt-1">Browse products and click the compare button to add up to 4 products for comparison</div>
                  </div>
                </div>
                <Link to="/products" className="btn btn-gradient btn-lg px-5 py-3">
                  <i className="fas fa-shopping-bag me-2"></i>Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSpecificationKeys = () => {
    const allKeys = new Set();
    compareItems.forEach(item => {
      if (item.product.specifications) {
        Object.keys(item.product.specifications).forEach(key => allKeys.add(key));
      }
    });
    return Array.from(allKeys);
  };

  const specKeys = getSpecificationKeys();

  return (
    <div style={{paddingTop: '100px', minHeight: '100vh'}}>
      {/* Hero Section */}
      <section className="py-5 bg-gradient-primary">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold text-white mb-3">
                <i className="fas fa-balance-scale me-3"></i>
                Product Comparison
              </h1>
              <p className="lead text-white-50 mb-0">
                Compare {compareItems.length} product{compareItems.length > 1 ? 's' : ''} side by side
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              {compareItems.length > 1 && (
                <button
                  onClick={handleClearCompare}
                  className="btn btn-outline-light btn-lg"
                >
                  <i className="fas fa-trash me-2"></i>Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table - All Devices */}
      <div>
        <div className="container py-5">
          <div className="modern-product-card">
            <div className="table-responsive">
              <table className="table table-borderless mb-0" style={{minWidth: '600px', fontSize: '0.9rem'}}>
                <thead>
                  <tr className="border-bottom">
                    <th className="p-2 p-md-4 fw-bold" style={{minWidth: '120px', background: '#f8f9fa', fontSize: '0.8rem'}}>Features</th>
                    {compareItems.map(item => (
                      <th key={item.id} className="p-2 p-md-4 text-center position-relative" style={{minWidth: '150px'}}>
                        <button
                          onClick={() => handleRemoveFromCompare(item.product.id)}
                          className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 rounded-circle"
                          style={{width: '30px', height: '30px'}}
                        >
                          <i className="fas fa-times small"></i>
                        </button>
                        <div className="mb-2">
                          <img
                            src={item.product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop'}
                            alt={item.product.name}
                            className="img-fluid rounded"
                            style={{width: '80px', height: '60px', objectFit: 'cover'}}
                          />
                        </div>
                        <h6 className="fw-bold mb-1 small">{item.product.name}</h6>
                        <div className="product-category small">{item.product.category.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Price</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center">
                        <div className="current-price text-success fw-bold" style={{fontSize: '1.2rem'}}>
                          ₹{(parseFloat(item.product.discounted_price || item.product.price) * 83).toFixed(0)}
                        </div>
                        {item.product.actual_price && item.product.actual_price > item.product.price && (
                          <div>
                            <small className="text-muted text-decoration-line-through">
                              ₹{(parseFloat(item.product.actual_price) * 83).toFixed(0)}
                            </small>
                            {item.product.discount_percentage > 0 && (
                              <span className="badge bg-danger ms-1 small">{item.product.discount_percentage}% OFF</span>
                            )}
                          </div>
                        )}
                        {item.product.offer_text && (
                          <div className="small text-warning mt-1">
                            <i className="fas fa-gift me-1"></i>{item.product.offer_text}
                          </div>
                        )}
                        {item.product.exchange_available && (
                          <div className="small text-info mt-1">
                            <i className="fas fa-exchange-alt me-1"></i>Exchange available
                          </div>
                        )}
                        <small className="text-muted d-none d-md-block">Best Price</small>
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Rating</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center">
                        <div className="d-flex align-items-center justify-content-center mb-1">
                          <div className="stars me-2">
                            {renderStars(item.product.average_rating)}
                          </div>
                          <span className="fw-bold">{(item.product.average_rating || 0).toFixed(1)}</span>
                        </div>
                        <small className="text-muted">({item.product.review_count || 0} reviews)</small>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Brand</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center">
                        <span className="badge bg-secondary px-3 py-2">
                          {item.product.brand || 'Generic'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Model</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center small">
                        {item.product.model_number || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Stock</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center">
                        <span className={`badge px-3 py-2 ${
                          item.product.stock > 0 ? 'bg-success' : 'bg-danger'
                        }`}>
                          <i className={`fas ${item.product.stock > 0 ? 'fa-check' : 'fa-times'} me-1`}></i>
                          {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-bottom">
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Warranty</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center small">
                        <i className="fas fa-shield-alt text-info me-2"></i>
                        {item.product.warranty_months} months
                      </td>
                    ))}
                  </tr>

                  {specKeys.map(specKey => (
                    <tr key={specKey} className="border-bottom">
                      <td className="p-2 p-md-4 fw-semibold text-capitalize small" style={{background: '#f8f9fa'}}>
                        {specKey.replace(/_/g, ' ')}
                      </td>
                      {compareItems.map(item => (
                        <td key={item.id} className="p-2 p-md-4 text-center small">
                          {item.product.specifications?.[specKey] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <td className="p-2 p-md-4 fw-semibold small" style={{background: '#f8f9fa'}}>Actions</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 p-md-4 text-center">
                        <div className="d-grid gap-2">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="btn btn-outline-primary"
                          >
                            <i className="fas fa-eye me-2"></i>View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(item.product)}
                            className="btn btn-success"
                            disabled={!item.product.available || item.product.stock === 0}
                          >
                            <i className="fas fa-cart-plus me-2"></i>Add to Cart
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <section className="py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-lightbulb text-warning" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold text-dark">Smart Comparison</h5>
                <p className="text-muted">Compare up to 4 products side by side to make informed decisions</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-chart-line text-success" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold text-dark">Detailed Analysis</h5>
                <p className="text-muted">View specifications, ratings, and prices in one comprehensive view</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-shopping-cart text-primary" style={{fontSize: '2.5rem'}}></i>
                </div>
                <h5 className="fw-bold text-dark">Quick Purchase</h5>
                <p className="text-muted">Add your preferred products directly to cart from comparison</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compare;