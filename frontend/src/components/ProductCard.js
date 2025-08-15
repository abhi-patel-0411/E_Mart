import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { wishlistAPI } from "../services/api";
import { toast } from "react-toastify";
import ProductOffers from "./ProductOffers";
import './ProductCard.css';

// Add Poppins font
if (!document.querySelector('link[href*="Poppins"]')) {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  document.body.style.fontFamily = "Poppins, sans-serif";
}

const ProductCard = ({ product, compact = false }) => {
  // Add responsive image loading
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToCompare, isInCompare } = useCompare();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Please login to add items to cart");
      return;
    }
    
    if (!product.available) {
      toast.error("This product is currently unavailable");
      return;
    }
    
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    const result = await addToCart(product.id);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Please login to manage wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await wishlistAPI.remove(product.id);
        if (response.status === 200 || response.status === 204) {
          setIsInWishlist(false);
          toast.success(`${product.name} removed from wishlist!`);
        }
      } else {
        // Add to wishlist
        const response = await wishlistAPI.add(product.id);
        if (response.status === 201 || response.status === 200) {
          setIsInWishlist(true);
          toast.success(`${product.name} added to wishlist!`);
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.info("Item already in wishlist");
      } else {
        toast.error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
      }
    }
  };

  const handleAddToCompare = async (e) => {
    e.preventDefault();

    const result = await addToCompare(product.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const isProductInCompare = isInCompare(product.id);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(0)}`;
  };

  return (
    <div className={`product-card-modern h-100 ${compact ? 'compact' : ''}`}>
      <div className="product-image-wrapper position-relative">
        <Link to={`/products/${product.slug}`} className="d-block">
          <img
            src={(product.image_urls && product.image_urls[0]) || product.image_url || "/api/placeholder/300/250"}
            className="product-image"
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0.7 }}
          />
        </Link>
        
        {/* Action buttons */}
        <div className="product-actions">
          <button
            className={`action-btn wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <i className={`fas fa-heart ${isInWishlist ? 'text-danger' : ''}`}></i>
          </button>
          <button
            className={`action-btn compare-btn ${isProductInCompare ? 'active' : ''}`}
            onClick={handleAddToCompare}
            title={isProductInCompare ? "Already in Compare" : "Add to Compare"}
            disabled={isProductInCompare}
          >
            <i className={`fas ${isProductInCompare ? "fa-check" : "fa-balance-scale"}`}></i>
          </button>
        </div>

        {/* Status badges */}
        <div className="product-badges">
          {(product.stock === 0 || !product.available) && (
            <span className="product-badge badge-danger">
              {!product.available ? 'Unavailable' : 'Out of Stock'}
            </span>
          )}
          {product.actual_price && product.actual_price > product.price && (
            <span className="product-badge badge-success">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>
        
        {/* Offers overlay on image */}
        <ProductOffers product={product} />
      </div>

      <div className="product-content">
        {/* Product Title */}
        <h6 className="product-title">
          <Link
            to={`/products/${product.slug}`}
            className="product-link"
            title={product.name}
          >
            {product.name}
          </Link>
        </h6>

        {/* Rating */}
        <div className="product-rating">
          <div className="rating-stars">
            {renderStars(
              product.average_rating || (Math.random() * 1.5 + 3.5).toFixed(1)
            )}
          </div>
          <span className="rating-count">
            ({product.review_count || Math.floor(Math.random() * 8) + 2})
          </span>
        </div>

        {/* Category */}
        <div className="product-category-wrapper">
          <span className="product-category">
            {product.category?.name || "Electronics"}
          </span>
        </div>

        {/* Price */}
        <div className="product-price">
          {product.actual_price && product.actual_price > product.price ? (
            <div className="price-container">
              <span className="current-price">{formatPrice(product.price)}</span>
              <span className="original-price">{formatPrice(product.actual_price)}</span>
              <span className="discount-badge">{product.discount_percentage}% OFF</span>
            </div>
          ) : (
            <span className="current-price">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Additional Info */}
        <div className="product-info">
          {product.brand && (
            <div className="info-item">
              <i className="fas fa-tag"></i>
              <span>{product.brand}</span>
            </div>
          )}

          {product.offer_text && (
            <div className="info-item offer-text">
              <i className="fas fa-gift"></i>
              <span title={product.offer_text}>{product.offer_text}</span>
            </div>
          )}

          {product.exchange_available && (
            <div className="info-item exchange-info">
              <i className="fas fa-exchange-alt"></i>
              <span title={`Exchange available${product.exchange_discount > 0 ? ` + Extra ${formatPrice(product.exchange_discount)} off` : ''}`}>
                Exchange available
                {product.exchange_discount > 0 && (
                  <span className="exchange-discount">
                    + Extra {formatPrice(product.exchange_discount)} off
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-buttons">
          <button
            className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            disabled={!product.available || product.stock === 0}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <i className={`fas fa-heart ${isInWishlist ? 'text-danger' : ''}`}></i>
            <span className="btn-text">{isInWishlist ? 'Remove' : 'Wishlist'}</span>
          </button>
          <button
            className="btn-cart"
            onClick={handleAddToCart}
            disabled={!product.available || product.stock === 0}
            title={!product.available ? 'Unavailable' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <i className="fas fa-shopping-cart"></i>
            <span className="btn-text">
              {!product.available ? 'Unavailable' : product.stock === 0 ? 'Out of Stock' : 'Buy'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
