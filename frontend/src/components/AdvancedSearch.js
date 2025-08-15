import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdvancedSearch = ({ onClose }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: '',
    sortBy: 'name'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    priceRange: { min_price: 0, max_price: 100000 }
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/search/filters/');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'search') searchParams.set('search', value);
        else if (key === 'minPrice') searchParams.set('min_price', value);
        else if (key === 'maxPrice') searchParams.set('max_price', value);
        else if (key === 'minRating') searchParams.set('min_rating', value);
        else if (key === 'inStock') searchParams.set('in_stock', value);
        else if (key === 'sortBy') searchParams.set('sort_by', value);
        else searchParams.set(key, value);
      }
    });

    navigate(`/products?${searchParams.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: '',
      sortBy: 'name'
    });
  };

  return (
    <div className="advanced-search-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4><i className="fas fa-search me-2"></i>Advanced Search</h4>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {/* Search Input */}
          <div className="form-group mb-3">
            <label>Search Keywords</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search products, brands, categories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="row">
            {/* Category Filter */}
            <div className="col-md-6 mb-3">
              <label>Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="col-md-6 mb-3">
              <label>Brand</label>
              <select
                className="form-select"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Min Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Max Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="100000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            {/* Rating Filter */}
            <div className="col-md-6 mb-3">
              <label>Minimum Rating</label>
              <select
                className="form-select"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div className="col-md-6 mb-3">
              <label>Availability</label>
              <select
                className="form-select"
                value={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.value)}
              >
                <option value="">All Products</option>
                <option value="true">In Stock Only</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="form-group mb-3">
            <label>Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline-secondary" onClick={clearFilters}>
            <i className="fas fa-eraser me-2"></i>Clear All
          </button>
          <button className="btn btn-primary" onClick={handleSearch}>
            <i className="fas fa-search me-2"></i>Search Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;