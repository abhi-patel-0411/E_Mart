import React, { useState } from 'react';

const ProductFilters = ({ categories, onFilterChange, filters = {} }) => {
  const [showFilters, setShowFilters] = useState(false);

  const priceRanges = [
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
    { label: 'Above ₹25,000', min: 25000, max: null }
  ];

  const handleFilterChange = (type, value) => {
    onFilterChange && onFilterChange({ ...filters, [type]: value });
  };

  return (
    <div className="mb-4">
      {/* Mobile Filter Toggle */}
      <button 
        className="btn btn-outline-primary d-md-none mb-3 w-100"
        onClick={() => setShowFilters(!showFilters)}
      >
        <i className="fas fa-filter me-2"></i>
        Filters {showFilters ? '▲' : '▼'}
      </button>

      {/* Filters */}
      <div className={`${showFilters ? 'd-block' : 'd-none'} d-md-block`}>
        <div className="row g-3">
          {/* Category Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium small">Category</label>
            <select 
              className="form-select form-select-sm"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{borderRadius: '8px'}}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id || cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium small">Price Range</label>
            <select 
              className="form-select form-select-sm"
              value={filters.priceRange || ''}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              style={{borderRadius: '8px'}}
            >
              <option value="">All Prices</option>
              {priceRanges.map((range, index) => (
                <option key={index} value={`${range.min}-${range.max || 'max'}`}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium small">Sort By</label>
            <select 
              className="form-select form-select-sm"
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{borderRadius: '8px'}}
            >
              <option value="">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium small">Availability</label>
            <select 
              className="form-select form-select-sm"
              value={filters.availability || ''}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              style={{borderRadius: '8px'}}
            >
              <option value="">All Products</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {Object.keys(filters).some(key => filters[key]) && (
          <div className="mt-3">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => onFilterChange && onFilterChange({})}
              style={{borderRadius: '20px'}}
            >
              <i className="fas fa-times me-1"></i>Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;