import React from 'react';

const SearchBar = ({ placeholder = "Search products...", value, onChange, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="position-relative">
      <div className="input-group" style={{maxWidth: '400px'}}>
        <span className="input-group-text bg-white border-end-0" style={{borderRadius: '25px 0 0 25px', paddingLeft: '1rem'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="#6B7280">
            <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
          </svg>
        </span>
        <input 
          type="text" 
          className="form-control border-start-0" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            borderRadius: '0 25px 25px 0',
            height: '46px',
            fontSize: '14px',
            color: '#6B7280',
            backgroundColor: 'transparent'
          }}
        />
      </div>
    </form>
  );
};

export default SearchBar;