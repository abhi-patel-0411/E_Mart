import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../services/api";
import { toast } from "react-toastify";
import StripeCheckout from "../components/StripeCheckout";
import AOS from "aos";
import "aos/dist/aos.css";

const StripePaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const amount = location.state?.amount || 0;
  const address = location.state?.address || "";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Check if required data exists
    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount");
      navigate("/cart");
    }
  }, [amount, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);

    try {
      const orderData = {
        address: address,
        payment_method: "stripe",
        payment_id: paymentData.paymentIntent.id,
        payment_status: "completed",
        applied_offers: cart.applied_offers || [],
        billing_details: {
          name: user ? `${user.first_name} ${user.last_name}` : "Customer",
          email: user?.email || "customer@example.com",
        },
      };

      const response = await ordersAPI.checkout(orderData);

      setOrderDetails(response.data);
      clearCart();

      toast.success("Payment successful! Order placed.");

      // Direct redirect to orders page
      navigate("/orders");
    } catch (error) {
      toast.error("Order creation failed. Please contact support.");
      console.error("Order creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    toast.error(error || "Payment failed. Please try again.");
  };

  if (paymentSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div
                className="card border-0 shadow-lg"
                style={{ borderRadius: "20px" }}
                data-aos="zoom-in"
              >
                <div className="card-body text-center p-5">
                  <div className="success-animation mb-4">
                    <div
                      className="checkmark-circle"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="fas fa-check text-white"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                  </div>

                  <h2 className="text-success fw-bold mb-3">
                    Payment Successful!
                  </h2>

                  <p className="text-muted mb-4">
                    Your payment has been processed successfully.
                  </p>

                  {orderDetails && (
                    <div className="order-summary bg-light p-3 rounded mb-4">
                      <h5 className="text-dark mb-2">Order Details</h5>
                      <p className="mb-1">
                        <strong>Order ID:</strong> {orderDetails.order_id}
                      </p>
                      <p className="mb-1">
                        <strong>Amount:</strong> ₹{amount}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong>{" "}
                        <span className="text-success">Confirmed</span>
                      </p>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate("/orders")}
                      style={{ borderRadius: "50px" }}
                    >
                      <i className="fas fa-list me-2"></i>View My Orders
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/products")}
                      style={{ borderRadius: "50px" }}
                    >
                      <i className="fas fa-shopping-bag me-2"></i>Continue
                      Shopping
                    </button>
                  </div>

                  <p className="text-muted mt-3 small">
                    Redirecting to orders page in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div
        className="hero-slide"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "70vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container text-center text-white">
          <h1 className="display-2 fw-bold mb-4" data-aos="fade-up">
            Secure Payment
          </h1>
          <p className="lead mb-5" data-aos="fade-up" data-aos-delay="200">
            Complete your purchase with confidence
          </p>
        </div>
      </div>

      {/* Payment Form Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-dark mb-3">Complete Your Payment</h2>
            <p className="text-muted fs-5">
              Secure checkout powered by Stripe - Your payment information is
              protected
            </p>
          </div>

          <div className="row g-4">
            {/* Payment Form */}
            <div className="col-lg-8">
              <div
                className="card border-0 shadow-lg"
                data-aos="fade-right"
                style={{ borderRadius: "20px" }}
              >
                <div className="card-body p-4 p-md-5">
                  <h4 className="text-dark mb-4">
                    <i className="fas fa-credit-card me-2"></i>Payment Details
                  </h4>
                  {loading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary mb-3"
                        style={{ width: "3rem", height: "3rem" }}
                      ></div>
                      <h4 className="text-primary">Processing your order...</h4>
                      <p className="text-muted">
                        Please wait while we process your payment
                      </p>
                    </div>
                  ) : (
                    <div>
                      <StripeCheckout
                        amount={amount}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        orderData={{
                          address,
                          items: cart.items,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div
                className="card border-0 shadow-lg"
                data-aos="fade-left"
                style={{ borderRadius: "20px" }}
              >
                <div className="card-body p-4">
                  <h4 className="text-dark mb-4">
                    <i className="fas fa-receipt me-2"></i>Order Summary
                  </h4>

                  <div className="order-items mb-4">
                    {cart.items?.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <img
                              src={
                                item.product.image_url ||
                                "https://via.placeholder.com/40"
                              }
                              alt={item.product.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 text-dark"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {item.product.name.length > 20
                                ? item.product.name.substring(0, 20) + "..."
                                : item.product.name}
                            </h6>
                            <small className="text-muted">
                              Qty: {item.quantity}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="text-dark fw-bold">
                            ₹
                            {parseFloat(
                              item.cost || item.product.price * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-dark">Subtotal:</span>
                      <span className="text-dark">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-dark">Processing Fee:</span>
                      <span className="text-success fw-bold">Free</span>
                    </div>
                    <div className="d-flex justify-content-between pt-3 border-top">
                      <h5 className="text-dark">Total:</h5>
                      <h4 className="text-success fw-bold">
                        ₹{amount.toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="security-badges mt-4 p-3 bg-light rounded">
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <i className="fas fa-shield-alt text-success fa-2x"></i>
                        <small className="d-block text-muted mt-1">
                          Secure
                        </small>
                      </div>
                      <div className="col-4">
                        <i className="fas fa-lock text-primary fa-2x"></i>
                        <small className="d-block text-muted mt-1">
                          Encrypted
                        </small>
                      </div>
                      <div className="col-4">
                        <i className="fab fa-stripe text-info fa-2x"></i>
                        <small className="d-block text-muted mt-1">
                          Stripe
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StripePaymentPage;

// Add responsive styles
const styles = `
@media (max-width: 768px) {
  .hero-slide {
    height: 50vh !important;
  }
  .display-2 {
    font-size: 2rem !important;
  }
  .card-body {
    padding: 2rem 1.5rem !important;
  }
}

@media (max-width: 576px) {
  .hero-slide {
    height: 40vh !important;
  }
  .display-2 {
    font-size: 1.75rem !important;
  }
  .lead {
    font-size: 1rem !important;
  }
  .card-body {
    padding: 1.5rem 1rem !important;
  }
}

@media (max-width: 991px) {
  .col-lg-8, .col-lg-4 {
    margin-bottom: 2rem;
  }
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
