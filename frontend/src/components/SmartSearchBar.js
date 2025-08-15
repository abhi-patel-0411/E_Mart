import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SmartSearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({
    products: [],
    brands: [],
    categories: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
    
    // Load popular searches
    fetchPopularSearches();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions({ products: [], brands: [], categories: [] });
    }
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search/suggestions/?q=${encodeURIComponent(query)}`);
      setSuggestions(response.data || { products: [], brands: [], categories: [] });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({ products: [], brands: [], categories: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const response = await api.get('/search/popular/');
      setPopularSearches(response.data);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Track search
    try {
      await api.post('/search/track/', {
        query: searchQuery,
        results_count: 0 // Will be updated after search
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updatedRecent = [searchQuery, ...recent.filter(s => s !== searchQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    setRecentSearches(updatedRecent);

    // Navigate to search results
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    if (searchQuery !== query) {
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion, type) => {
    if (type === 'category') {
      const category = suggestion.toLowerCase().replace(/\s+/g, '-');
      navigate(`/products?category=${category}`);
    } else if (type === 'brand') {
      navigate(`/products?brand=${encodeURIComponent(suggestion)}`);
    } else {
      handleSearch(suggestion);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <>
      <style>
        {`
          .smart-search-container {
            position: relative;
            width: 100%;
          }
          .search-input-wrapper {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 25px;
            padding: 0;
            transition: all 0.3s ease;
          }
          .search-input-wrapper:focus-within {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .search-input {
            flex: 1;
            border: none;
            outline: none;
            padding: 0.75rem 1rem;
            background: transparent;
            color: #374151;
            font-size: 0.875rem;
          }
          .search-input::placeholder {
            color: #9ca3af;
          }
          .search-btn {
            background: none;
            border: none;
            padding: 0.75rem 1rem;
            color: #6b7280;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .search-btn:hover {
            color: #6366f1;
          }
          .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
            margin-top: 0.5rem;
          }
          .suggestion-item {
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            color: #374151;
            font-size: 0.875rem;
          }
          .suggestion-item:hover {
            background-color: #f8fafc;
          }
          .suggestion-header {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background-color: #f9fafb;
          }
          .btn-clear {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.25rem;
          }
          .no-suggestions {
            padding: 2rem;
            text-align: center;
            color: #6b7280;
          }
        `}
      </style>
      <div className={`smart-search-container ${className}`} ref={searchRef}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search products, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <button className="search-btn" onClick={() => handleSearch()}>
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-search"></i>
            )}
          </button>
        </div>

      {showSuggestions && (
        <div className="search-suggestions">
          {/* Search Suggestions */}
          {(suggestions.products.length > 0 || suggestions.brands.length > 0 || suggestions.categories.length > 0) && (
            <div className="suggestions-section">
              {suggestions.products.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-header">
                    <i className="fas fa-box me-2"></i>Products
                  </div>
                  {suggestions.products.map((product, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(product, 'product')}
                    >
                      <i className="fas fa-search me-2"></i>
                      {product}
                    </div>
                  ))}
                </div>
              )}

              {suggestions.brands.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-header">
                    <i className="fas fa-tag me-2"></i>Brands
                  </div>
                  {suggestions.brands.map((brand, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(brand, 'brand')}
                    >
                      <i className="fas fa-trademark me-2"></i>
                      {brand}
                    </div>
                  ))}
                </div>
              )}

              {suggestions.categories.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-header">
                    <i className="fas fa-th-large me-2"></i>Categories
                  </div>
                  {suggestions.categories.map((category, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(category, 'category')}
                    >
                      <i className="fas fa-folder me-2"></i>
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestion-group">
                <div className="suggestion-header d-flex justify-content-between align-items-center">
                  <span><i className="fas fa-history me-2"></i>Recent Searches</span>
                  <button className="btn-clear" onClick={clearRecentSearches}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSearch(search)}
                  >
                    <i className="fas fa-clock me-2"></i>
                    {search}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && popularSearches.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestion-group">
                <div className="suggestion-header">
                  <i className="fas fa-fire me-2"></i>Trending Searches
                </div>
                {popularSearches.slice(0, 5).map((search, index) => (
                  <div
                    key={index}
                    className="suggestion-item trending"
                    onClick={() => handleSearch(search)}
                  >
                    <i className="fas fa-trending-up me-2"></i>
                    {search}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && 
           suggestions.products.length === 0 && 
           suggestions.brands.length === 0 && 
           suggestions.categories.length === 0 && (
            <div className="no-suggestions">
              <i className="fas fa-search-minus mb-2"></i>
              <p>No suggestions found for "{query}"</p>
              <button className="btn btn-sm btn-primary" onClick={() => handleSearch()}>
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default SmartSearchBar;