import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({});

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, search, currentPage, appliedFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        ...(category && { category }),
        ...(search && { search }),
        ...appliedFilters
      };
      
      const response = await productsAPI.getAll(params);
      const data = response.data;
      
      let productList = [];
      if (data.results) {
        productList = data.results;
        setTotalPages(Math.ceil(data.count / 12));
      } else if (Array.isArray(data)) {
        productList = data;
        setTotalPages(1);
      }
      
      // Additional client-side filtering for search
      if (search && productList.length > 0) {
        const searchLower = search.toLowerCase();
        productList = productList.filter(product => 
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.category?.name?.toLowerCase().includes(searchLower)
        );
      }
      
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const data = response.data;
      
      // Handle paginated response
      let allCategories = [];
      if (data.results) {
        allCategories = data.results;
        
        // Fetch all pages if there are more
        let nextUrl = data.next;
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          const nextData = await nextResponse.json();
          allCategories = [...allCategories, ...nextData.results];
          nextUrl = nextData.next;
        }
      } else if (Array.isArray(data)) {
        allCategories = data;
      }
      
      if (allCategories.length > 0) {
        setCategories(allCategories);
      } else {
        // Fallback categories
        setCategories([
          { id: 1, name: 'Electronics', slug: 'electronics' },
          { id: 2, name: 'Smartphones', slug: 'smartphones' },
          { id: 3, name: 'Laptops', slug: 'laptops' },
          { id: 4, name: 'Audio', slug: 'audio' },
          { id: 5, name: 'Gaming', slug: 'gaming' },
          { id: 6, name: 'Cameras', slug: 'cameras' }
        ]);
      }
    } catch (error) {
      console.error('Categories fetch failed:', error);
      setCategories([
        { id: 1, name: 'Electronics', slug: 'electronics' },
        { id: 2, name: 'Smartphones', slug: 'smartphones' },
        { id: 3, name: 'Laptops', slug: 'laptops' },
        { id: 4, name: 'Audio', slug: 'audio' },
        { id: 5, name: 'Gaming', slug: 'gaming' },
        { id: 6, name: 'Cameras', slug: 'cameras' }
      ]);
    }
  };

  const handleCategoryFilter = (categorySlug) => {
    const newParams = new URLSearchParams();
    if (categorySlug) {
      newParams.set('category', categorySlug);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <Loader size="large" />;
  }

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="container py-4" style={{marginTop: '80px'}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white mb-1">
              {search ? `Search: "${search}"` : 
               category ? categories.find(c => c.slug === category)?.name || 'Products' : 
               'All Products'}
            </h2>
            <p className="text-muted mb-0">{products.length} products found</p>
          </div>
          
          {/* Category Dropdown */}
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{zIndex: 1050}}>
              <i className="fas fa-filter me-2"></i>
              {category ? categories.find(c => c.slug === category)?.name || 'Category' : 'All Categories'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" style={{zIndex: 1060, maxHeight: '300px', overflowY: 'auto'}}>
              <li>
                <button className="dropdown-item" onClick={() => handleCategoryFilter('')}>
                  <i className="fas fa-th-large me-2"></i>All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button className="dropdown-item" onClick={() => handleCategoryFilter(cat.slug)}>
                    <i className={`${cat.icon || 'fas fa-tag'} me-2`}></i>{cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="container mb-4">
        <div className="category-tabs-wrapper" style={{overflowX: 'auto', paddingBottom: '10px'}}>
          <div className="category-tabs d-flex gap-2" style={{minWidth: 'max-content'}}>
            <button 
              className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-secondary'} category-tab`}
              onClick={() => handleCategoryFilter('')}
              style={{whiteSpace: 'nowrap', flexShrink: 0}}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id || cat.slug}
                className={`btn btn-sm ${category === cat.slug ? 'btn-primary' : 'btn-secondary'} category-tab`}
                onClick={() => handleCategoryFilter(cat.slug)}
                style={{whiteSpace: 'nowrap', flexShrink: 0}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products by Category */}
      <section className="pb-5">
        <div className="container position-relative">
          {!category ? (
            // Show all products when no category is selected
            <div className="row g-3">
              {products
                .filter(product => product.available) // Only show available products
                .map(product => (
                  <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <ProductCard product={product} />
                  </div>
                ))
              }
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="fas fa-search fa-4x text-muted mb-4"></i>
                <h3 className="text-white mb-3">No Products Found</h3>
                <p className="text-muted mb-4">Try adjusting your search or browse different categories</p>
                <button 
                  className="btn btn-gradient px-4 py-2"
                  onClick={() => handleCategoryFilter('')}
                >
                  View All Products
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {products
                  .filter(product => product.available) // Only show available products
                  .map(product => (
                    <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <ProductCard product={product} />
                    </div>
                  ))
                }
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container mt-5">
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;