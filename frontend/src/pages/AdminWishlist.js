import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminWishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllWishlists();
  }, []);

  const fetchAllWishlists = async () => {
    try {
      const response = await adminAPI.getWishlists();
      setWishlists(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      toast.error('Failed to load wishlists');
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishlist = async (wishlistId) => {
    if (window.confirm('Are you sure you want to remove this wishlist item?')) {
      try {
        await adminAPI.removeWishlist(wishlistId);
        setWishlists(wishlists.filter(w => w.id !== wishlistId));
        toast.success('Wishlist item removed successfully');
      } catch (error) {
        console.error('Remove wishlist error:', error);
        toast.error('Failed to remove wishlist item');
      }
    }
  };

  const filteredWishlists = wishlists.filter(item => {
    const matchesSearch = 
      item.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.added_at);
      const today = new Date();
      const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const sortedWishlists = [...filteredWishlists].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.added_at) - new Date(a.added_at);
      case 'oldest':
        return new Date(a.added_at) - new Date(b.added_at);
      case 'user':
        return a.user?.first_name?.localeCompare(b.user?.first_name) || 0;
      case 'product':
        return a.product?.name?.localeCompare(b.product?.name) || 0;
      default:
        return 0;
    }
  });

  const paginatedWishlists = sortedWishlists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedWishlists.length / itemsPerPage);

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <style>{`
        .wishlist-header {
          background: #2563eb;
          border-radius: 25px;
          color: white;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        .wishlist-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        .stats-card {
          backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.15);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.2);
        }
        .table-modern {
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.95);
        }
        .table-modern thead {
          background: #2563eb;
          color: white;
        }
        .table-modern tbody tr {
          transition: all 0.3s ease;
          border: none;
        }
        .table-modern tbody tr:hover {
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.1);
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
        }
        .user-avatar:hover {
          transform: scale(1.1);
        }
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .product-image:hover {
          transform: scale(1.05);
        }
        .price-display {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .action-btn {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          margin: 0 2px;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .wishlist-card {
          border-radius: 20px;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .wishlist-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        @media (max-width: 767px) {
          .container-fluid {
            padding: 0 10px;
          }
          .wishlist-header {
            margin: 0 -10px 2rem -10px;
            border-radius: 0;
          }
          .wishlist-header h1 {
            font-size: 1.3rem;
          }
          .stats-card {
            padding: 8px 12px !important;
          }
          .table-responsive {
            border-radius: 15px;
            margin: 0 -10px;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .table-modern {
            font-size: 0.8rem;
            border-radius: 15px;
          }
          .user-avatar {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
          }
          .product-image {
            width: 45px;
            height: 45px;
          }
          .action-btn {
            width: 28px;
            height: 28px;
            font-size: 0.65rem;
          }
          .price-display {
            font-size: 0.9rem;
          }
          .pagination {
            font-size: 0.8rem;
          }
          .input-group {
            margin-bottom: 10px;
          }
        }
        @media (max-width: 576px) {
          .d-flex.gap-3 {
            flex-direction: column;
            gap: 10px !important;
          }
          .stats-card {
            flex: 1;
            text-align: center;
          }
          .table th, .table td {
            padding: 8px 4px;
          }
          .wishlist-card {
            border-radius: 10px;
            margin: 0 -5px;
          }
        }
      `}</style>

      <div className="container-fluid">
        {/* Header Section */}
        <div className="wishlist-header p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3" style={{position: 'relative', zIndex: 2}}>
            <div>
              <h1 className="h2 fw-bold mb-2">
                <i className="fas fa-heart me-3"></i>
                Wishlist Management
              </h1>
              <p className="mb-0 opacity-90">Monitor and manage customer wishlists</p>
            </div>
            <div className="d-flex gap-3 flex-wrap">
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">{wishlists.length}</div>
                <small className="opacity-75">Total Items</small>
              </div>
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">{new Set(wishlists.map(w => w.user?.username)).size}</div>
                <small className="opacity-75">Users</small>
              </div>
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">{new Set(wishlists.map(w => w.product?.id)).size}</div>
                <small className="opacity-75">Products</small>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{borderRadius: '25px 0 0 25px'}}>
                <i className="fas fa-search" style={{color: '#6B7280'}}></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search wishlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderRadius: '0 25px 25px 0',
                  height: '46px',
                  fontSize: '14px',
                  color: '#6B7280'
                }}
              />
            </div>
          </div>
          
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                <i className="fas fa-sort" style={{color: '#6B7280'}}></i>
              </span>
              <select 
                className="form-select border-start-0" 
                style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6B7280'}}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="user">By User Name</option>
                <option value="product">By Product Name</option>
              </select>
            </div>
          </div>
          
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                <i className="fas fa-calendar" style={{color: '#6B7280'}}></i>
              </span>
              <select 
                className="form-select border-start-0" 
                style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6B7280'}}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        <div className="wishlist-card">
          {sortedWishlists.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-heart fa-2x text-muted"></i>
                </div>
                <h4 className="text-muted mb-2">No Wishlist Items Found</h4>
                <p className="text-muted mb-0">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No users have added items to their wishlist yet'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{overflowX: 'auto'}}>
                <table className="table table-hover table-responsive mb-0" style={{minWidth: '800px'}}>
                  <thead>
                    <tr>
                      <th className="border-0 py-3 px-2 px-md-4">User</th>
                      <th className="border-0 py-3 px-2 px-md-3">Product</th>
                      <th className="border-0 py-3 px-2 px-md-3 d-none d-sm-table-cell">Price</th>
                      <th className="border-0 py-3 px-2 px-md-3 d-none d-lg-table-cell">Added Date</th>
                      <th className="border-0 py-3 px-2 px-md-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWishlists.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-2 px-md-4">
                          <div className="d-flex align-items-center">
                            <div className="user-avatar me-2 me-md-3">
                              {(item.user?.first_name?.[0] || item.user?.username?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="d-none d-md-block">
                              <h6 className="mb-1 fw-semibold">
                                {item.user?.first_name} {item.user?.last_name}
                              </h6>
                              <small className="text-muted">{item.user?.email}</small>
                            </div>
                            <div className="d-md-none">
                              <small className="fw-semibold">{item.user?.first_name}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 px-md-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={item.product?.image_url || 'https://via.placeholder.com/60x60?text=No+Image'}
                              alt={item.product?.name}
                              className="product-image me-2 me-md-3"
                              onError={(e) => {e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';}}
                            />
                            <div>
                              <h6 className="mb-1 fw-semibold text-primary" style={{fontSize: '0.9rem'}}>
                                {(item.product?.name || 'Unknown Product').length > 20 ? 
                                  (item.product?.name || 'Unknown Product').substring(0, 20) + '...' : 
                                  (item.product?.name || 'Unknown Product')
                                }
                              </h6>
                              <div className="d-sm-none">
                                <div className="price-display" style={{fontSize: '0.8rem'}}>₹{parseFloat(item.product?.price || 0).toFixed(0)}</div>
                              </div>
                              <small className="text-muted d-none d-md-block">ID: {item.product?.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 px-md-3 d-none d-sm-table-cell">
                          <div className="price-display">₹{parseFloat(item.product?.price || 0).toFixed(0)}</div>
                        </td>
                        <td className="py-3 px-2 px-md-3 d-none d-lg-table-cell">
                          <div className="fw-medium">{new Date(item.added_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                          <small className="text-muted">
                            {Math.floor((new Date() - new Date(item.added_at)) / (1000 * 60 * 60 * 24))} days ago
                          </small>
                        </td>
                        <td className="py-3 px-2 px-md-3 text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-outline-danger action-btn"
                              onClick={() => handleRemoveWishlist(item.id)}
                              title="Remove"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 p-3">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{borderRadius: '10px 0 0 10px'}}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                            style={{
                              borderRadius: '0', 
                              backgroundColor: currentPage === index + 1 ? '#2563eb' : 'white', 
                              borderColor: '#2563eb', 
                              color: currentPage === index + 1 ? 'white' : '#2563eb'
                            }}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{borderRadius: '0 10px 10px 0'}}
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
      </div>
    </AdminLayout>
  );
};

export default AdminWishlist;