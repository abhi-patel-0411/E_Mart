import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CompareProvider } from "./context/CompareContext";
import { ReactLenis } from "lenis/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import LoadingScreen from "./components/LoadingScreen";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
// import Cart from "./pages/Cart";
import CartBootstrap from "./pages/CartBootstrap";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import StripePaymentPage from "./pages/StripePaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Contact from "./pages/Contact";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import AdminOffers from "./pages/AdminOffers";
import AddProduct from "./pages/AddProduct";
import OffersPage from "./pages/OffersPage";
import AdminAnalytics from "./components/AdminAnalytics";
import AdminLayout from "./components/AdminLayout";
import AdminOrders from "./pages/AdminOrders";
import AdminWishlist from "./pages/AdminWishlist";
import AdminMLDashboard from "./pages/AdminMLDashboard";
import NotFound from "./pages/NotFound";

import "./App.css";
import "./responsive.css";
import "./components/HorizontalScroll.css";

function AppContent() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  const isNotFoundRoute = !["/", "/products", "/cart", "/wishlist", "/compare", "/checkout", "/payment", "/payment-legacy", "/payment-success", "/orders", "/profile", "/offers", "/contact", "/about", "/login", "/register", "/dashboard", "/admin/offers", "/admin/add-product", "/admin/products", "/admin/users", "/admin/orders", "/admin/wishlists", "/admin/analytics", "/admin/ml-dashboard"].some(route => 
      location.pathname === route || 
      location.pathname.startsWith("/products/") || 
      location.pathname.startsWith("/track-order/") ||
      location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/admin")
    );

  return (
    <ReactLenis root>
      <div className="App">
        {!isAdminRoute && !isAuthRoute && !isNotFoundRoute && <Navbar />}
        <main>
          <Routes>
            {/* Admin Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/admin/products" element={<Dashboard />} />
            <Route path="/admin/users" element={<Dashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/wishlists" element={<AdminWishlist />} />
            <Route
              path="/admin/analytics"
              element={
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              }
            />
            <Route path="/admin/ml-dashboard" element={<AdminMLDashboard />} />

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartBootstrap />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<StripePaymentPage />} />
            <Route
              path="/payment-legacy"
              element={
                <Elements
                  stripe={loadStripe(
                    "pk_test_51RieweIC3UmOEaMXPBVq9aot6qEpna0JMfLxvy0pAxeB7RGCrFnVV1HO26YKt29jYC8yQtqwHgS8SX8gXvclB5da00GwpznZUx"
                  )}
                >
                  <PaymentPage />
                </Elements>
              }
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && !isAuthRoute && !isNotFoundRoute && (
          <>
            <Footer />
            <MobileBottomNav />
          </>
        )}
        <ToastContainer position="top-right" autoClose={1000} />
      </div>
    </ReactLenis>
  );
}

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setShowLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasSeenLoading', 'true');
    setShowLoading(false);
    setIsInitialized(true);
  };

  if (showLoading || !isInitialized) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoadingScreen onComplete={handleLoadingComplete} />
      </Router>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CompareProvider>
        <AppContent />
      </CompareProvider>
    </Router>
  );
}

export default App;
