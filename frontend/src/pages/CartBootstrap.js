import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import OfferWidget from "../components/OfferWidget";

const CartBootstrap = () => {
  const { isAuthenticated } = useAuth();
  const { cart, updateCartItem, removeFromCart, loading, fetchCart } =
    useCart();
  const [showAddress, setShowAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (isAuthenticated && cart.items?.length > 0) {
      // Auto-apply offers when cart loads
      const autoApplyOffers = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/cart/auto-apply-offers/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            await fetchCart(); // Refresh cart to show applied offers
          }
        } catch (error) {
          console.error('Auto-apply offers failed:', error);
        }
      };
      
      autoApplyOffers();
    }
  }, [isAuthenticated, cart.items?.length, fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    const result = await updateCartItem(itemId, newQuantity);
    if (result.success) {
      toast.success("Cart updated!");
    } else {
      toast.error(result.error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success("Item removed from cart!");
    } else {
      toast.error(result.error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <i className="fas fa-user-lock fa-3x text-primary mb-3"></i>
            <h2>Access Required</h2>
            <p className="text-muted">Please login to view your cart</p>
            <Link to="/login" className="btn btn-primary btn-lg px-5 py-3">
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", paddingTop: "120px" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading Cart...</h4>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ paddingTop: "120px", minHeight: "100vh" }}>
        <section className="py-5 bg-light">
          <div className="container text-center">
            <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h2>Your Cart is Empty</h2>
            <p className="text-muted">Add some products to get started!</p>
            <Link to="/products" className="btn btn-dark btn-lg px-5 py-3">
              <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ paddingTop: "220px", minHeight: "100vh", marginBottom: "100px" }}
    >
      <div className="row mt-5">
        <div className="col-lg-8">
          <h1 className="h3 fw-medium mb-4">
            Shopping Cart{" "}
            <span className="badge bg-primary">
              {cart.items?.length || 0} Items
            </span>
          </h1>

          <div className="row text-muted fw-medium pb-3 border-bottom">
            <div className="col-6">Product Details</div>
            <div className="col-3 text-center">Subtotal</div>
            <div className="col-3 text-center">Action</div>
          </div>

          {cart.items.map((item) => (
            <div
              key={item.id}
              className="row align-items-center py-3 border-bottom"
            >
              <div className="col-6">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="border rounded overflow-hidden"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={
                        item.product.image_url ||
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop"
                      }
                      alt={item.product.name}
                    />
                  </div>
                  <div>
                    <p className="fw-semibold mb-1 d-none d-md-block">
                      {item.product.name}
                    </p>
                    <div className="text-muted small">
                      <p className="mb-1">
                        Category:{" "}
                        <span>{item.product.category?.name || "N/A"}</span>
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <span>Qty:</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "70px" }}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                        >
                          {Array(10)
                            .fill("")
                            .map((_, index) => (
                              <option key={index} value={index + 1}>
                                {index + 1}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-3 text-center">
                <div className="fw-medium">
                  ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </div>
                {item.product.actual_price && (
                  <div className="text-muted small text-decoration-line-through">
                    ₹
                    {(
                      parseFloat(item.product.actual_price) * item.quantity
                    ).toFixed(2)}
                  </div>
                )}
                {item.product.discount_percentage > 0 && (
                  <div className="text-success small">
                    {item.product.discount_percentage}% off
                  </div>
                )}
              </div>
              <div className="col-3 text-center">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}

          <OfferWidget
            onOfferApplied={fetchCart}
            key={cart.items?.length || 0}
          />

          <Link to="/products" className="btn btn-link text-primary mt-3 p-0">
            <i className="fas fa-arrow-left me-2"></i>
            Continue Shopping
          </Link>
        </div>

        <div className="col-lg-4">
          <div className="card bg-light border">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <hr />

              <div className="mb-4">
                <p className="small fw-medium text-uppercase mb-2">
                  Delivery Address
                </p>
                <div className="d-flex justify-content-between align-items-start">
                  <p className="text-muted mb-0">No address found</p>
                  <button
                    onClick={() => setShowAddress(!showAddress)}
                    className="btn btn-link btn-sm text-primary p-0"
                  >
                    Change
                  </button>
                </div>
                {showAddress && (
                  <div className="dropdown-menu show position-relative w-100 mt-2">
                    <button
                      onClick={() => setShowAddress(false)}
                      className="dropdown-item text-muted"
                    >
                      New York, USA
                    </button>
                    <button
                      onClick={() => setShowAddress(false)}
                      className="dropdown-item text-primary text-center"
                    >
                      Add address
                    </button>
                  </div>
                )}

                <p className="small fw-medium text-uppercase mt-4 mb-2">
                  Payment Method
                </p>
                <select className="form-select">
                  <option value="COD">Cash On Delivery</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              <hr />

              <div className="text-muted">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    ₹
                    {cart.items
                      ?.reduce((total, item) => {
                        const price = parseFloat(item.product.price);
                        return total + price * item.quantity;
                      }, 0)
                      .toFixed(2) || "0.00"}
                  </span>
                </div>

                {cart.applied_offers && cart.applied_offers.length > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Offer Discount:</span>
                    <span>
                      -₹
                      {cart.applied_offers
                        .reduce(
                          (total, offer) =>
                            total + parseFloat(offer.discount_amount || 0),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                )}

                {cart.items?.some(
                  (item) => item.product.actual_price > item.product.price
                ) && (
                  <div className="d-flex justify-content-between mb-2 text-info">
                    <span>Product Discounts:</span>
                    <span>
                      -₹
                      {cart.items
                        .reduce((total, item) => {
                          const actualPrice = parseFloat(
                            item.product.actual_price || item.product.price
                          );
                          const currentPrice = parseFloat(item.product.price);
                          return (
                            total + (actualPrice - currentPrice) * item.quantity
                          );
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>

                <div className="d-flex justify-content-between fs-5 fw-medium text-dark mt-3">
                  <span>Total:</span>
                  <span>
                    ₹
                    {(() => {
                      const subtotal =
                        cart.items?.reduce((total, item) => {
                          const price = parseFloat(item.product.price);
                          return total + price * item.quantity;
                        }, 0) || 0;

                      const offerDiscount = cart.applied_offers
                        ? cart.applied_offers.reduce(
                            (total, offer) =>
                              total + parseFloat(offer.discount_amount || 0),
                            0
                          )
                        : 0;

                      return Math.max(0, subtotal - offerDiscount).toFixed(2);
                    })()}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="btn btn-primary w-100 mt-4">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartBootstrap;
