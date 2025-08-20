import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import SmartSearchBar from './SmartSearchBar';
import AdvancedSearch from './AdvancedSearch';
import Logo from './Logo';
import './SearchStyles.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const { getCompareItemCount } = useCompare();
  const navigate = useNavigate();
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid #e5e7eb',
    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    transform: scrolled ? 'translateY(0)' : 'translateY(0)'
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scrolled ? '0.75rem 1.5rem' : '1rem 1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    transition: 'padding 0.3s ease'
  };

  const logoStyle = {
    textDecoration: 'none',
    transform: 'scale(1)',
    transition: 'transform 0.2s ease'
  };

  const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1',
    maxWidth: '500px',
    margin: '0 2rem'
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const cartStyle = {
    position: 'relative',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none'
  };

  const cartBadgeStyle = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite'
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.5rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .navbar-animate {
            animation: slideDown 0.5s ease-out;
          }
          
          .logo-hover:hover {
            transform: scale(1.05) !important;
          }
          
          .cart-hover:hover {
            background-color: #f3f4f6 !important;
            transform: translateY(-2px) !important;
          }
          
          .user-btn-hover:hover {
            background-color: #4f46e5 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4) !important;
          }
          
          .dropdown-modern {
            min-width: 280px;
            border: none;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            padding: 0.5rem;
            backdrop-filter: blur(10px);
            background: rgba(255,255,255,0.95);
          }
          
          .dropdown-item-modern {
            border-radius: 12px;
            margin: 0.25rem;
            padding: 0.75rem 1rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .dropdown-item-modern:hover {
            background-color: #f8fafc;
            transform: translateX(4px);
          }
          
          .dropdown-header-modern {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
            padding: 0.75rem 1rem 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
          }
          
          @media (min-width: 769px) {
            .mobile-only { display: none !important; }
          }
        `}
      </style>
      
      <nav style={navbarStyle} className="navbar-animate">
        <div style={containerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle} className="logo-hover">
            <Logo size="medium" variant="default" />
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="desktop-only d-none d-xl-flex" style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <Link to="/" style={{textDecoration: 'none', color: '#374151', fontWeight: '500', transition: 'color 0.3s ease'}} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#374151'}>Home</Link>
            <Link to="/products" style={{textDecoration: 'none', color: '#374151', fontWeight: '500', transition: 'color 0.3s ease'}} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#374151'}>Products</Link>
            <Link to="/about" style={{textDecoration: 'none', color: '#374151', fontWeight: '500', transition: 'color 0.3s ease'}} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#374151'}>About</Link>
            <Link to="/contact" style={{textDecoration: 'none', color: '#374151', fontWeight: '500', transition: 'color 0.3s ease'}} onMouseEnter={(e) => e.target.style.color = '#6366f1'} onMouseLeave={(e) => e.target.style.color = '#374151'}>Contact</Link>
          </div>

          {/* Search Bar - Medium+ screens only */}
          <div style={searchContainerStyle} className="d-none d-md-flex">
            <SmartSearchBar />
          </div>

          {/* Right Section */}
          <div style={rightSectionStyle}>
            {/* Mobile Search Icon */}
            <button 
              className="d-md-none"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <i className="fas fa-search" style={{fontSize: '1.1rem', color: '#374151'}}></i>
            </button>
            
            {/* Cart */}
            <Link to="/cart" style={cartStyle} className="cart-hover">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {getCartItemCount() > 0 && (
                <span style={cartBadgeStyle}>
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  style={userButtonStyle}
                  className="user-btn-hover dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <i className="fas fa-user"></i>
                    <span className="desktop-only">{user?.first_name || user?.username}</span>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-modern">
                  <li><span className="dropdown-header-modern">My Account</span></li>
                  <li>
                    <Link className="dropdown-item dropdown-item-modern" to="/profile">
                      <i className="fas fa-user" style={{width: '16px', color: '#6366f1'}}></i>
                      <span>Profile</span>
                      <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8'}}>⇧⌘P</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item dropdown-item-modern" to="/orders">
                      <i className="fas fa-receipt" style={{width: '16px', color: '#10b981'}}></i>
                      <span>Orders</span>
                      <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8'}}>⌘O</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item dropdown-item-modern" to="/wishlist">
                      <i className="fas fa-heart" style={{width: '16px', color: '#ef4444'}}></i>
                      <span>Wishlist</span>
                      <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8'}}>⌘W</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item dropdown-item-modern" to="/compare">
                      <i className="fas fa-balance-scale" style={{width: '16px', color: '#f59e0b'}}></i>
                      <span>Compare</span>
                      {getCompareItemCount() > 0 && (
                        <span style={{
                          marginLeft: 'auto',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getCompareItemCount()}
                        </span>
                      )}
                    </Link>
                  </li>
                  {user?.is_staff && (
                    <li>
                      <Link className="dropdown-item dropdown-item-modern" to="/dashboard">
                        <i className="fas fa-tachometer-alt" style={{width: '16px', color: '#8b5cf6'}}></i>
                        <span>Dashboard</span>
                        <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8'}}>⌘D</span>
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" style={{margin: '0.5rem 0', borderColor: '#e2e8f0'}} /></li>
                  <li>
                    <button 
                      className="dropdown-item dropdown-item-modern text-danger" 
                      onClick={handleLogout}
                      style={{border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
                    >
                      <i className="fas fa-sign-out-alt" style={{width: '16px', color: '#ef4444'}}></i>
                      <span>Logout</span>
                      <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8'}}>⇧⌘Q</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" style={userButtonStyle} className="user-btn-hover">
                <i className="fas fa-sign-in-alt"></i>
                <span className="desktop-only">Login</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search Collapse */}
        {showMobileSearch && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'slideDown 0.3s ease-out'
          }} className="d-md-none">
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <div style={{flex: 1}}>
                <SmartSearchBar />
              </div>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  color: '#6366f1',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6366f1';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.color = '#6366f1';
                }}
              >
                <i className="fas fa-sliders-h"></i>
              </button>
            </div>
          </div>
        )}
      </nav>

      {showAdvancedSearch && (
        <AdvancedSearch onClose={() => setShowAdvancedSearch(false)} />
      )}
    </>
  );
};

export default Navbar;