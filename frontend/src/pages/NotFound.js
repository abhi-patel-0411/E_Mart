import React, { useState } from "react";
import { Link } from "react-router-dom";
// import LoadingScreen from '../components/LoadingScreen';

const NotFound = () => {
  // const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // if (showLoading) {
  //   return <LoadingScreen onComplete={handleLoadingComplete} />;
  // }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#ffffff" }}
    >
      <style>
        {`
          .error-404 {
            font-size: 8rem;
            font-weight: 900;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: glitch 2s infinite;
            text-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
          }
          
          @keyframes glitch {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-2px); }
            40% { transform: translateX(2px); }
            60% { transform: translateX(-1px); }
            80% { transform: translateX(1px); }
          }
          
          .bounce-icon {
            animation: bounce 2s infinite;
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          .fade-in {
            animation: fadeInUp 0.8s ease-out;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div className="text-center fade-in">
        <div className="mb-4">
          <i
            className="fas fa-microchip bounce-icon"
            style={{ fontSize: "4rem", color: "#6366f1", marginBottom: "1rem" }}
          ></i>
        </div>
        <h1 className="error-404 mb-3">404</h1>
        <h2 className="h4 mb-3" style={{ color: "#1f2937" }}>
          Page Not Found
        </h2>
        <p className="text-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <i className="fas fa-home me-2"></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
