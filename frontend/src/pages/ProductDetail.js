import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsAPI, reviewsAPI, wishlistAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { toast } from "react-toastify";

import { getDisplayPrice, formatCurrency } from "../utils/priceUtils";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [thumbnail, setThumbnail] = useState(0);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToCompare, isInCompare } = useCompare();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        productsAPI.getBySlug(slug),
        reviewsAPI.getByProduct(slug).catch(() => ({ data: [] })),
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);

      // Fetch offers for this product
      if (productRes.data && productRes.data.id) {
        try {
          const offersRes = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/products/${productRes.data.id}/offers/`
          );
          if (offersRes.ok) {
            const offersData = await offersRes.json();
            setOffers(offersData.offers || []);
          }
        } catch (offersError) {
          console.error("Error fetching product offers:", offersError);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to add items to cart");
      return;
    }

    const result = await addToCart(product.id);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.warning("Please login to add items to wishlist");
      return;
    }

    try {
      await wishlistAPI.add(product.id);
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  const handleAddToCompare = async () => {
    const result = await addToCompare(product.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const isProductInCompare = product ? isInCompare(product.id) : false;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Please login to add a review");
      return;
    }

    try {
      await reviewsAPI.add(product.id, reviewForm);
      toast.success("Review added successfully!");
      setReviewForm({ rating: 5, comment: "" });
      fetchProduct(); // Refresh to get updated reviews
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${
            i <= rating ? "text-warning" : "text-muted"
          }`}
        ></i>
      );
    }
    return stars;
  };

  const getProductImages = () => {
    const images = [];

    // Use image_urls array if available (new structure)
    if (
      product?.image_urls &&
      Array.isArray(product.image_urls) &&
      product.image_urls.length > 0
    ) {
      images.push(...product.image_urls.filter((img) => img && img.trim()));
    }
    // Fallback to single image_url if no image_urls array
    else if (product?.image_url) {
      images.push(product.image_url);
    }

    // Add placeholder images if we have less than 4
    const placeholders = [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    ];

    while (images.length < 4) {
      images.push(placeholders[images.length % placeholders.length]);
    }

    return images.slice(0, 5); // Allow up to 5 images
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", paddingTop: "100px" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Product...</h4>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Product not found</h2>
      </div>
    );
  }

  const productImages = getProductImages();

  return (
    <div style={{ paddingTop: "100px" }}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none">
                Products
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link
                to={`/products?category=${product?.category?.slug}`}
                className="text-decoration-none"
              >
                {product?.category?.name}
              </Link>
            </li>
            <li
              className="breadcrumb-item active text-primary"
              aria-current="page"
            >
              {product?.name}
            </li>
          </ol>
        </nav>

        {/* Product Layout */}
        <div className="row g-4">
          {/* Image Gallery */}
          <div className="col-md-6">
            {/* Desktop Layout */}
            <div className="d-none d-md-flex gap-3">
              {/* Thumbnail Column */}
              <div className="d-flex flex-column gap-3">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setThumbnail(index)}
                    className={`border rounded overflow-hidden cursor-pointer ${
                      thumbnail === index
                        ? "border-primary border-3"
                        : "border-secondary"
                    }`}
                    style={{ width: "96px", height: "96px", cursor: "pointer" }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div
                className="border border-secondary rounded overflow-hidden flex-grow-1"
                style={{ maxWidth: "400px" }}
              >
                <img
                  src={productImages[thumbnail]}
                  alt="Selected product"
                  className="w-100 h-100"
                  style={{ objectFit: "cover", height: "500px" }}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="d-md-none">
              {/* Thumbnail Row */}
              <div className="d-flex gap-3 mb-3" style={{ overflowX: "auto" }}>
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setThumbnail(index)}
                    className={`border rounded overflow-hidden cursor-pointer flex-shrink-0 ${
                      thumbnail === index
                        ? "border-primary border-3"
                        : "border-secondary"
                    }`}
                    style={{ width: "96px", height: "96px", cursor: "pointer" }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

              {/* Main Image Display */}
              <div
                className="border border-secondary rounded overflow-hidden"
                style={{ width: "100%" }}
              >
                <img
                  src={productImages[thumbnail]}
                  alt="Selected product"
                  className="w-100"
                  style={{ objectFit: "cover", height: "300px" }}
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="col-md-6">
            <div className="h-100">
              <h1 className="display-5 fw-medium mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex">
                  {Array(5)
                    .fill("")
                    .map((_, i) =>
                      (product.average_rating || 4) > i ? (
                        <svg
                          key={i}
                          width="14"
                          height="13"
                          viewBox="0 0 18 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z"
                            fill="#615fff"
                          />
                        </svg>
                      ) : (
                        <svg
                          key={i}
                          width="14"
                          height="13"
                          viewBox="0 0 18 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z"
                            fill="#615fff"
                            fillOpacity="0.35"
                          />
                        </svg>
                      )
                    )}
                </div>
                <p className="mb-0 ms-2">({product.average_rating || 4})</p>
              </div>

              {/* Price */}
              <div className="mt-4 mb-4">
                {product.actual_price &&
                product.actual_price > product.price ? (
                  <>
                    <p className="text-muted text-decoration-line-through mb-1">
                      MRP: ₹{parseFloat(product.actual_price).toFixed(0)}
                    </p>
                    <p className="display-6 fw-medium mb-1 text-success">
                      Offer Price: ₹{parseFloat(product.price).toFixed(0)}
                    </p>
                    <span className="badge bg-danger me-2">
                      {product.discount_percentage}% OFF
                    </span>
                  </>
                ) : (
                  <p className="display-6 fw-medium mb-1">
                    MRP: ₹{parseFloat(product.price).toFixed(0)}
                  </p>
                )}
                <span className="text-muted">(inclusive of all taxes)</span>
              </div>

              {/* About Product */}
              <div className="mb-4">
                <p className="fw-medium mb-3">About Product</p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-1">• {product.description}</li>
                  {product.brand && (
                    <li className="mb-1">• Brand: {product.brand}</li>
                  )}
                  {product.warranty_months && (
                    <li className="mb-1">
                      • {product.warranty_months} months warranty
                    </li>
                  )}
                  {product.specifications &&
                    Object.entries(product.specifications)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <li key={key} className="mb-1">
                          • {key.replace("_", " ")}: {value}
                        </li>
                      ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center mt-5 gap-3">
                <button
                  className="btn btn-outline-secondary flex-fill py-3 fw-medium"
                  onClick={handleAddToCart}
                  disabled={!product.available || product.stock === 0}
                  style={{ transition: "all 0.2s" }}
                >
                  Add to Cart
                </button>
                <button
                  className="btn btn-primary flex-fill py-3 fw-medium"
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => navigate("/cart"), 500);
                  }}
                  disabled={!product.available || product.stock === 0}
                  style={{ transition: "all 0.2s" }}
                >
                  Buy now
                </button>
              </div>

              {/* Additional Actions */}
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleAddToWishlist}
                >
                  <i className="fas fa-heart me-1"></i>Wishlist
                </button>
                <button
                  className={`btn btn-sm ${
                    isProductInCompare ? "btn-success" : "btn-outline-info"
                  }`}
                  onClick={handleAddToCompare}
                  disabled={isProductInCompare}
                >
                  <i
                    className={`fas ${
                      isProductInCompare ? "fa-check" : "fa-balance-scale"
                    } me-1`}
                  ></i>
                  {isProductInCompare ? "In Compare" : "Compare"}
                </button>
              </div>

              {/* Stock & Offers */}
              {product.available ? (
                product.stock > 0 ? (
                  <div className="alert alert-success mt-3 py-2">
                    <i className="fas fa-check-circle me-2"></i>
                    <strong>In Stock</strong> - {product.stock} units available
                  </div>
                ) : (
                  <div className="alert alert-danger mt-3 py-2">
                    <i className="fas fa-times-circle me-2"></i>
                    <strong>Out of Stock</strong>
                  </div>
                )
              ) : (
                <div className="alert alert-danger mt-3 py-2">
                  <i className="fas fa-ban me-2"></i>
                  <strong>Currently Unavailable</strong>
                </div>
              )}

              {product.offer_text && (
                <div className="alert alert-warning mt-2 py-2">
                  <i className="fas fa-gift me-2"></i>
                  <strong>Special Offer:</strong> {product.offer_text}
                </div>
              )}

              {/* Product Video Section */}
              {(product.video_url || product.video_file) && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Product Video</h6>
                  {product.video_url ? (
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          product.video_url.includes("watch?v=")
                            ? product.video_url
                                .split("watch?v=")[1]
                                .split("&")[0]
                            : product.video_url.split("/").pop()
                        }`}
                        title="Product Video"
                        allowFullScreen
                        style={{ borderRadius: "10px" }}
                      ></iframe>
                    </div>
                  ) : (
                    product.video_file && (
                      <video
                        controls
                        style={{ width: "100%", borderRadius: "10px" }}
                        src={product.video_file}
                      ></video>
                    )
                  )}
                </div>
              )}

              {/* Product Offers Section */}
              <div className="mt-3">
                {/* Display offers */}
                {offers && offers.length > 0 && (
                  <div className="card border-success mb-3">
                    <div className="card-header bg-success text-white">
                      <i className="fas fa-tags me-2"></i>
                      Available Offers
                    </div>
                    <div className="card-body p-3">
                      {offers.map((offer) => (
                        <div key={offer.id} className="mb-3 pb-3 border-bottom">
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-primary me-2">
                              {offer.offer_type === "category_offer"
                                ? "CATEGORY"
                                : offer.offer_type === "discount"
                                ? "DISCOUNT"
                                : offer.offer_type === "flat"
                                ? "FLAT"
                                : offer.offer_type.toUpperCase()}
                            </span>
                            <h6 className="mb-0">{offer.name}</h6>
                          </div>
                          <p className="small text-muted mb-1">
                            {offer.description}
                          </p>

                          {offer.offer_type === "category_offer" &&
                            offer.categories &&
                            offer.categories.length > 0 && (
                              <div className="bg-light p-2 rounded small">
                                <div className="fw-bold mb-1">
                                  Applies to categories:
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                  {offer.categories.map((category) => (
                                    <span
                                      key={category.id}
                                      className="badge bg-info text-dark"
                                    >
                                      {category.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="mt-2 d-flex justify-content-between align-items-center">
                            <div>
                              <span className="badge bg-success">
                                {offer.badge_text}
                              </span>
                              <span className="ms-2 small">
                                Code: <strong>{offer.code}</strong>
                              </span>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                // Copy code to clipboard
                                navigator.clipboard.writeText(offer.code);
                                toast.success(
                                  `Offer code ${offer.code} copied to clipboard!`
                                );
                              }}
                            >
                              <i className="fas fa-copy me-1"></i>
                              Copy Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {product.exchange_available && (
                <div className="alert alert-info mt-2 py-2">
                  <i className="fas fa-exchange-alt me-2"></i>
                  <strong>Exchange Available</strong>
                  {product.exchange_discount > 0 && (
                    <span className="text-success ms-2">
                      + Extra ₹
                      {parseFloat(product.exchange_discount).toFixed(0)} off
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Customer Reviews</h2>
            <p className="text-muted">
              What our customers say about this product
            </p>
          </div>

          {/* Add Review Form */}
          {isAuthenticated && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-dark">Rating</label>
                      <select
                        className="form-control border-dark"
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            rating: parseInt(e.target.value),
                          })
                        }
                        style={{ color: "#333" }}
                      >
                        {[5, 4, 3, 2, 1].map((num) => (
                          <option key={num} value={num}>
                            {num} Star{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-dark">Comment</label>
                      <textarea
                        className="form-control border-dark"
                        rows="4"
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            comment: e.target.value,
                          })
                        }
                        style={{ color: "#333" }}
                        placeholder="Share your experience with this product..."
                        required
                      ></textarea>
                    </div>
                    <div className="col-12 text-center">
                      <button
                        type="submit"
                        className="btn btn-dark btn-lg px-5 py-3"
                      >
                        <i className="fas fa-star me-2"></i>Submit Review
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="row g-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">
                            {review.user?.first_name} {review.user?.last_name}
                          </h6>
                          <div className="mb-2">
                            <div className="d-flex">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="text-muted mb-0">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-5 text-center">
                    <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h5 className="fw-bold mb-3">No Reviews Yet</h5>
                    <p className="text-muted mb-0">
                      Be the first to review this product and help other
                      customers!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
