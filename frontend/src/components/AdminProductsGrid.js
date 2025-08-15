import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AdminProductsGrid.css';

const AdminProductsGrid = ({ products, onEdit, onDelete, onToggleStatus, onAdd }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const filteredProducts = Array.isArray(products) ? products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || product.category?.slug === filterCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return parseFloat(a.price) - parseFloat(b.price);
        case 'stock': return (a.stock || 0) - (b.stock || 0);
        case 'name': 
        default: return a.name.localeCompare(b.name);
      }
    }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy]);

  const categories = Array.isArray(products) ? [...new Set(products.map(p => p.category?.slug).filter(Boolean))] : [];
  
  // Add hardcoded categories as fallback
  const allCategories = [...new Set([
    ...categories,
    'smartphones', 'laptops', 'headphones', 'smart-watches', 'gaming', 'cameras', 'tablets', 'audio-systems'
  ])];

  return (
    <div className="card shadow-lg border-0" style={{borderRadius: '15px', overflow: 'hidden'}}>
      <div className="card-header text-white position-relative" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem'}}>
        <div className="position-absolute top-0 end-0 p-3 opacity-25">
          <i className="fas fa-boxes fa-3x"></i>
        </div>
        <div className="row align-items-center">
          <div className="col-12 col-md-6">
            <h4 className="mb-1 fw-bold" style={{fontSize: 'clamp(1.1rem, 3vw, 1.5rem)'}}>
              <i className="fas fa-store me-2"></i>
              <span className="d-none d-sm-inline">Product Management</span>
              <span className="d-inline d-sm-none">Products</span>
            </h4>
            <p className="mb-0 opacity-75" style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}>
              <span className="badge bg-white text-primary me-2">{filteredProducts.length}</span>
              <span className="d-none d-sm-inline">Total Products • Page {currentPage} of {totalPages}</span>
              <span className="d-inline d-sm-none">Page {currentPage}/{totalPages}</span>
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end mt-3 mt-md-0">
            <button 
              className="btn btn-light me-2 me-md-3 shadow-sm" 
              onClick={onAdd} 
              style={{borderRadius: '25px', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px)'}}
            >
              <i className="fas fa-plus me-1 me-md-2"></i>
              <span className="d-none d-sm-inline">Add New Product</span>
              <span className="d-inline d-sm-none">Add</span>
            </button>
            <div className="btn-group shadow-sm" role="group" style={{borderRadius: '25px', overflow: 'hidden'}}>
              <button 
                className={`btn ${viewMode === 'grid' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)'}}
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`btn ${viewMode === 'table' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)'}}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="card-body border-bottom" style={{background: 'linear-gradient(to right, #f8f9ff, #ffffff)'}}>
        <div className="row g-3 g-md-4">
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label fw-medium text-primary mb-2" style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}>
              <i className="fas fa-search me-1"></i>Search Products
            </label>
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-primary text-white border-0">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{borderRadius: '0 10px 10px 0', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}
              />
            </div>
          </div>
          <div className="col-6 col-md-3 col-lg-3">
            <label className="form-label fw-medium text-primary mb-2" style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}>
              <i className="fas fa-filter me-1"></i>Category
            </label>
            <select 
              className="form-select shadow-sm border-0"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{borderRadius: '10px', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('-', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-3">
            <label className="form-label fw-medium text-primary mb-2" style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}>
              <i className="fas fa-sort me-1"></i>Sort
            </label>
            <select 
              className="form-select shadow-sm border-0"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{borderRadius: '10px', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low-High)</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>
          <div className="col-12 col-md-12 col-lg-2 d-flex align-items-end">
            <div className="bg-light rounded p-2 p-md-3 w-100 text-center">
              <div className="fw-bold text-primary" style={{fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)'}}>{filteredProducts.length}</div>
              <small className="text-muted" style={{fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)'}}>of {products.length} products</small>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="card-body">
          {filteredProducts.length > 0 ? (
            <div className="row g-3 g-md-4">
              {paginatedProducts.map(product => (
                <div key={product.id} className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                  <div className="card h-100 shadow-sm border-0 product-card admin-product-card">
                    <div className="position-relative card-image-container" 
                         onClick={() => window.location.href = `/products/${product.slug}`}
                         style={{ cursor: 'pointer' }}>
                      <img 
                        src={product.image_url || '/api/placeholder/300/200'} 
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        alt={product.name}
                      />
                      <div className="card-overlay">
                        <div className="overlay-content">
                          <i className="fas fa-eye fa-2x text-white"></i>
                          <p className="text-white mt-2 mb-0">View Details</p>
                        </div>
                      </div>
                      <div className="position-absolute top-0 end-0 p-2">
                        <div className="form-check form-switch" onClick={(e) => e.stopPropagation()}>
                          <input 
                            className="form-check-input bg-primary" 
                            type="checkbox" 
                            checked={product.available}
                            onChange={(e) => onToggleStatus(product.id, e.target.checked)}
                            title={product.available ? 'Active' : 'Inactive'}
                          />
                        </div>
                      </div>
                      {(product.stock === 0 || !product.available) && (
                        <div className="position-absolute top-0 start-0 p-2">
                          <span className="badge bg-danger">
                            {!product.available ? 'Unavailable' : 'Out of Stock'}
                          </span>
                        </div>
                      )}
                      {product.actual_price && product.actual_price > product.price && (
                        <div className="position-absolute bottom-0 start-0 p-2">
                          <span className="badge bg-success">
                            {Math.round(((product.actual_price - product.price) / product.actual_price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title fw-bold text-truncate" title={product.name}
                          onClick={() => window.location.href = `/products/${product.slug}`}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => e.target.style.color = '#0d6efd'}
                          onMouseLeave={(e) => e.target.style.color = 'inherit'}>
                        {product.name}
                      </h6>
                      
                      <div className="mb-2">
                        <span className="badge bg-info me-1 d-inline-block text-truncate" style={{maxWidth: '80px'}}>
                          {product.category?.name || 'Uncategorized'}
                        </span>
                        {product.brand && (
                          <span className="badge bg-secondary d-inline-block text-truncate" style={{maxWidth: '60px'}}>
                            {product.brand}
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <div className="fw-bold text-primary" style={{fontSize: 'clamp(0.8rem, 2.5vw, 1.1rem)'}}>₹{parseFloat(product.price || 0).toFixed(0)}</div>
                        {product.actual_price && product.actual_price > product.price && (
                          <small className="text-muted text-decoration-line-through" style={{fontSize: 'clamp(0.7rem, 2vw, 0.85rem)'}}>
                            ₹{parseFloat(product.actual_price).toFixed(0)}
                          </small>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted" style={{fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)'}}>Stock:</small>
                          <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`} style={{fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)'}}>
                            {product.stock || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="admin-action-buttons">
                          <button 
                            className="btn btn-edit btn-sm flex-fill me-1"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                            title="Edit Product"
                          >
                            <div className="btn-icon-wrapper">
                              <i className="fas fa-edit"></i>
                            </div>
                            <span className="btn-text">Edit</span>
                            <div className="btn-ripple"></div>
                          </button>
                          <button 
                            className="btn btn-delete btn-sm flex-fill ms-1"
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            title="Delete Product"
                          >
                            <div className="btn-icon-wrapper">
                              <i className="fas fa-trash-alt"></i>
                            </div>
                            <span className="btn-text">Delete</span>
                            <div className="btn-ripple"></div>
                          </button>
                        </div>
                        <button 
                          className="btn btn-outline-info btn-sm w-100 mt-2 d-none d-sm-block"
                          onClick={() => window.location.href = `/products/${product.slug}`}
                          title="View Product Details"
                          style={{fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)'}}
                        >
                          <i className="fas fa-eye me-1"></i>
                          <span className="d-none d-md-inline">View Details</span>
                          <span className="d-inline d-md-none">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No products found</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="card-footer bg-light">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="text-muted text-center text-md-start" style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>
              <span className="d-none d-sm-inline">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </span>
              <span className="d-inline d-sm-none">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
              </span>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', padding: 'clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px)'}}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show fewer pages on mobile
                  const isMobile = window.innerWidth < 576;
                  const showPage = isMobile 
                    ? (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    : (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2));
                  
                  if (showPage) {
                    return (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page)}
                          style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', padding: 'clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px)'}}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  } else if ((page === currentPage - 2 || page === currentPage + 2) && !isMobile) {
                    return <li key={page} className="page-item disabled"><span className="page-link" style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)'}}>...</span></li>;
                  }
                  return null;
                })}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', padding: 'clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px)'}}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{width: 'clamp(60px, 15vw, 80px)', fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Image</th>
                <th style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Product</th>
                <th style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Price</th>
                <th style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Stock</th>
                <th style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Category</th>
                <th className="text-center" style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)'}}>Status</th>
                <th className="text-center" style={{fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)', width: 'clamp(100px, 20vw, 140px)'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.image_url || '/api/placeholder/60/60'} 
                      alt={product.name}
                      className="rounded"
                      style={{
                        width: 'clamp(35px, 10vw, 60px)', 
                        height: 'clamp(35px, 10vw, 60px)', 
                        objectFit: 'cover'
                      }}
                    />
                  </td>
                  <td>
                    <div className="fw-bold text-truncate" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                      maxWidth: 'clamp(100px, 25vw, 200px)'
                    }} title={product.name}>
                      {product.name}
                    </div>
                    <small className="text-muted d-none d-sm-block" style={{fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)'}}>
                      {product.brand || 'No Brand'}
                    </small>
                  </td>
                  <td>
                    <div className="fw-bold text-primary" style={{fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'}}>
                      ₹{parseFloat(product.price || 0).toFixed(0)}
                    </div>
                    {product.actual_price && product.actual_price > product.price && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1">
                        <small className="text-muted text-decoration-line-through" style={{fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)'}}>
                          ₹{parseFloat(product.actual_price).toFixed(0)}
                        </small>
                        <small className="badge bg-success" style={{fontSize: 'clamp(0.6rem, 1.4vw, 0.7rem)'}}>
                          {Math.round(((product.actual_price - product.price) / product.actual_price) * 100)}% OFF
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`} style={{fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)'}}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-info text-truncate d-inline-block" style={{
                      fontSize: 'clamp(0.6rem, 1.4vw, 0.7rem)',
                      maxWidth: 'clamp(60px, 15vw, 100px)'
                    }} title={product.category?.name || 'Uncategorized'}>
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="form-check form-switch d-flex justify-content-center">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={product.available}
                        onChange={(e) => onToggleStatus(product.id, e.target.checked)}
                        style={{transform: 'scale(clamp(0.8, 2vw, 1.2))'}}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="table-action-buttons" role="group">
                      <button 
                        className="table-btn table-btn-edit"
                        onClick={() => onEdit(product)}
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                        <div className="table-btn-ripple"></div>
                      </button>
                      <button 
                        className="table-btn table-btn-delete"
                        onClick={() => onDelete(product.id)}
                        title="Delete Product"
                      >
                        <i className="fas fa-trash-alt"></i>
                        <div className="table-btn-ripple"></div>
                      </button>
                      <button 
                        className="table-btn table-btn-view d-none d-sm-flex"
                        onClick={() => window.location.href = `/products/${product.slug}`}
                        title="View Product"
                      >
                        <i className="fas fa-eye"></i>
                        <div className="table-btn-ripple"></div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination for Table View */}
      {viewMode === 'table' && filteredProducts.length > itemsPerPage && (
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                    return (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                  }
                  return null;
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
        </div>
      )}
    </div>
  );
};

export default AdminProductsGrid;