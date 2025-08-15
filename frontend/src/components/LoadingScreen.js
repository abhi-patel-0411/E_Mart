import React from "react";

const LoadingScreen = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <style>
        {`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            overflow: hidden;
            animation: fadeOut 0.8s ease-in-out 4.2s forwards;
          }
          
          /* Hide default browser loading indicators */
          .loading-screen * {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          /* Ensure custom animations work */
          .loading-screen {
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
          }
          
          .loading-screen::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }
          
          .logo-container {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: logoEntrance 2s ease-out;
            opacity: 1;
            visibility: visible;
            z-index: 10000;
          }
          
          .icon-wrapper {
            position: relative;
            margin-bottom: 1.5rem;
            animation: iconFloat 3s ease-in-out infinite;
          }
          
          .microchip-icon {
            font-size: 4rem;
            color: #1f2937;
            filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.8));
            animation: iconPulse 2s ease-in-out infinite;
          }
          
          .icon-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: glowPulse 2s ease-in-out infinite;
          }
          
          .brand-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 3rem;
            font-weight: 800;
            color: #1f2937;
            text-align: center;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #1f2937 0%, #6366f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: textShimmer 2s ease-in-out infinite;
          }
          
          .brand-subtitle {
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            color: rgba(31, 41, 55, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 2rem;
          }
          
          .loading-text {
            color: rgba(31, 41, 55, 0.9);
            font-size: 1.1rem;
            font-weight: 400;
            font-family: 'Inter', sans-serif;
            opacity: 0;
            animation: textFadeIn 0.8s ease-out 1.5s forwards;
          }
          
          .loading-dots {
            display: inline-block;
            animation: dots 1.5s infinite;
          }
          

          
          @keyframes logoEntrance {
            0% {
              transform: scale(0.3) rotateY(-180deg);
              opacity: 0;
              visibility: visible;
            }
            50% {
              transform: scale(1.1) rotateY(0deg);
              opacity: 1;
              visibility: visible;
            }
            100% {
              transform: scale(1) rotateY(0deg);
              opacity: 1;
              visibility: visible;
            }
          }
          
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes iconPulse {
            0%, 100% { 
              transform: scale(1);
              filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.8));
            }
            50% { 
              transform: scale(1.05);
              filter: drop-shadow(0 0 30px rgba(99, 102, 241, 1));
            }
          }
          
          @keyframes glowPulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.3;
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.6;
            }
          }
          
          @keyframes textShimmer {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          @keyframes textFadeIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          
          @keyframes fadeOut {
            to {
              opacity: 0;
              visibility: hidden;
            }
          }
          
          @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
          }
          

          
          @media (max-width: 768px) {
            .microchip-icon { font-size: 3rem; }
            .brand-text { font-size: 2.5rem; }
            .icon-glow { width: 100px; height: 100px; }
          }
        `}
      </style>

      <div className="logo-container">
        <div className="icon-wrapper">
          <div className="icon-glow"></div>
          <i className="fas fa-microchip microchip-icon"></i>
        </div>

        <div className="brand-text">E-Mart</div>
        <div className="brand-subtitle">Electronics & Technology</div>
      </div>

      <div className="loading-text">
        Initializing your experience<span className="loading-dots"></span>
      </div>
    </div>
  );
};

export default LoadingScreen;
