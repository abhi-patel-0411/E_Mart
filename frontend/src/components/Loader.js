import React from "react";

const Loader = ({ size = "medium" }) => {
  const sizes = {
    small: { width: "40px", height: "40px", center: "8px" },
    medium: { width: "60px", height: "60px", center: "12px" },
    large: { width: "80px", height: "80px", center: "16px" },
  };

  const currentSize = sizes[size];

  return (
    <div className="loader-container">
      <style>
        {`
          .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
            z-index: 10000;
          }
          
          .modern-loader {
            position: relative;
            width: ${currentSize.width};
            height: ${currentSize.height};
          }
          
          .loader-ring {
            position: absolute;
            border-radius: 50%;
            border: 2px solid transparent;
          }
          
          .loader-ring:nth-child(1) {
            width: 100%;
            height: 100%;
            border-top: 2px solid #6366f1;
            border-right: 2px solid rgba(99, 102, 241, 0.2);
            animation: spin 1.2s linear infinite;
          }
          
          .loader-ring:nth-child(2) {
            width: 75%;
            height: 75%;
            top: 12.5%;
            left: 12.5%;
            border-bottom: 2px solid #8b5cf6;
            border-left: 2px solid rgba(139, 92, 246, 0.2);
            animation: spin 1.8s linear infinite reverse;
          }
          
          .loader-ring:nth-child(3) {
            width: 50%;
            height: 50%;
            top: 25%;
            left: 25%;
            border-right: 2px solid #06b6d4;
            border-top: 2px solid rgba(6, 182, 212, 0.2);
            animation: spin 2.4s linear infinite;
          }
          
          .loader-center {
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${currentSize.center};
            height: ${currentSize.center};
            background: linear-gradient(45deg, #6366f1, #8b5cf6, #06b6d4);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: centerPulse 2s ease-in-out infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes centerPulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.3);
              opacity: 0.7;
            }
          }
        `}
      </style>

      <div className="modern-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-center"></div>
      </div>
    </div>
  );
};

export default Loader;
