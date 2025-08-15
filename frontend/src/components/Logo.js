import React from 'react';

const Logo = ({ size = 'medium', variant = 'default', className = '', type = 'standard' }) => {
  const sizes = {
    small: { icon: '1rem', text: '0.9rem' },
    medium: { icon: '1.5rem', text: '1.25rem' },
    large: { icon: '2rem', text: '1.5rem' },
    xl: { icon: '2.5rem', text: '2rem' }
  };

  const variants = {
    default: { color: 'var(--color-primary, #6366f1)' },
    white: { color: '#ffffff' },
    dark: { color: '#1f2937' },
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  // Professional Logo with custom icon
  if (type === 'professional') {
    return (
      <div className={`d-flex align-items-center ${className}`}>
        <div 
          className="me-2 d-flex align-items-center justify-content-center"
          style={{
            width: currentSize.icon === '1rem' ? '24px' : currentSize.icon === '1.5rem' ? '32px' : '40px',
            height: currentSize.icon === '1rem' ? '24px' : currentSize.icon === '1.5rem' ? '32px' : '40px',
            background: variant === 'white' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            border: variant === 'white' ? '2px solid rgba(255,255,255,0.3)' : 'none'
          }}
        >
          <svg 
            width={currentSize.icon === '1rem' ? '14' : currentSize.icon === '1.5rem' ? '18' : '22'} 
            height={currentSize.icon === '1rem' ? '14' : currentSize.icon === '1.5rem' ? '18' : '22'} 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              fill={variant === 'white' ? '#ffffff' : '#ffffff'} 
              fillOpacity="0.9"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke={variant === 'white' ? '#ffffff' : '#ffffff'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke={variant === 'white' ? '#ffffff' : '#ffffff'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h5 
            className="mb-0" 
            style={{ 
              fontWeight: '700', 
              fontSize: currentSize.text,
              color: variant === 'gradient' ? undefined : currentVariant.color,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.02em',
              ...currentVariant
            }}
          >
            E-Mart
          </h5>
          {size !== 'small' && (
            <div 
              style={{
                fontSize: currentSize.icon === '1.5rem' ? '0.65rem' : '0.7rem',
                color: variant === 'white' ? 'rgba(255,255,255,0.8)' : '#6b7280',
                fontWeight: '500',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Electronics
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Logo
  return (
    <div className={`d-flex align-items-center ${className}`}>
      <i 
        className="fas fa-microchip me-2" 
        style={{ 
          fontSize: currentSize.icon, 
          color: variant === 'gradient' ? '#667eea' : currentVariant.color,
          ...currentVariant
        }}
      ></i>
      <h5 
        className="mb-0" 
        style={{ 
          fontWeight: 'bold', 
          fontSize: currentSize.text,
          color: variant === 'gradient' ? undefined : currentVariant.color,
          ...currentVariant
        }}
      >
        E-Mart
      </h5>
    </div>
  );
};

export default Logo;