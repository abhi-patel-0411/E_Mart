import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

const MobileBottomNav = () => {
  const { isAuthenticated, user } = useAuth();
  const { getCartItemCount } = useCart();
  const { getCompareItemCount } = useCompare();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '1rem 0',
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
  };

  const navItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem',
    transition: 'all 0.3s ease',
    minWidth: '60px'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: '#6366f1',
    transform: 'translateY(-2px)'
  };

  const iconStyle = {
    fontSize: '1.25rem',
    marginBottom: '0.25rem',
    transition: 'all 0.3s ease'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };

  return (
    <div style={navStyle} className="d-xl-none">
      <Link 
        to="/" 
        style={isActive('/') ? activeNavItemStyle : navItemStyle}
        onMouseEnter={(e) => {
          if (!isActive('/')) {
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/')) {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <i className="fas fa-home" style={iconStyle}></i>
        <span>Home</span>
      </Link>
      
      <Link 
        to="/products" 
        style={isActive('/products') ? activeNavItemStyle : navItemStyle}
        onMouseEnter={(e) => {
          if (!isActive('/products')) {
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/products')) {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <i className="fas fa-th-large" style={iconStyle}></i>
        <span>Products</span>
      </Link>
      
      <Link 
        to="/cart" 
        style={isActive('/cart') ? activeNavItemStyle : navItemStyle}
        onMouseEnter={(e) => {
          if (!isActive('/cart')) {
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/cart')) {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <div style={{position: 'relative'}}>
          <i className="fas fa-shopping-cart" style={iconStyle}></i>
          {getCartItemCount() > 0 && (
            <span style={badgeStyle}>{getCartItemCount()}</span>
          )}
        </div>
        <span>Cart</span>
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link 
            to="/about" 
            style={isActive('/about') ? activeNavItemStyle : navItemStyle}
            onMouseEnter={(e) => {
              if (!isActive('/about')) {
                e.currentTarget.style.color = '#6366f1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/about')) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <i className="fas fa-info-circle" style={iconStyle}></i>
            <span>About</span>
          </Link>
          
          <Link 
            to="/contact" 
            style={isActive('/contact') ? activeNavItemStyle : navItemStyle}
            onMouseEnter={(e) => {
              if (!isActive('/contact')) {
                e.currentTarget.style.color = '#6366f1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/contact')) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <i className="fas fa-envelope" style={iconStyle}></i>
            <span>Contact</span>
          </Link>
          
          <Link 
            to="/profile" 
            style={isActive('/profile') ? activeNavItemStyle : navItemStyle}
            onMouseEnter={(e) => {
              if (!isActive('/profile')) {
                e.currentTarget.style.color = '#6366f1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/profile')) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <i className="fas fa-user" style={iconStyle}></i>
            <span>Profile</span>
          </Link>
        </>
      ) : (
        <Link 
          to="/login" 
          style={isActive('/login') ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (!isActive('/login')) {
              e.currentTarget.style.color = '#6366f1';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/login')) {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <i className="fas fa-sign-in-alt" style={iconStyle}></i>
          <span>Login</span>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomNav;