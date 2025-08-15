import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';
import { adminAPI } from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', icon: 'fas fa-clock' },
      confirmed: { class: 'bg-info text-white', icon: 'fas fa-check-circle' },
      shipped: { class: 'bg-primary text-white', icon: 'fas fa-shipping-fast' },
      delivered: { class: 'bg-success text-white', icon: 'fas fa-box-open' },
      cancelled: { class: 'bg-danger text-white', icon: 'fas fa-times-circle' }
    };
    return statusConfig[status] || { class: 'bg-secondary text-white', icon: 'fas fa-box' };
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'amount_high':
        return (b.final_amount || b.total_amount) - (a.final_amount || a.total_amount);
      case 'amount_low':
        return (a.final_amount || a.total_amount) - (b.final_amount || b.total_amount);
      default:
        return 0;
    }
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <style>{`
        .order-header {
          background: #2563eb;
          border-radius: 25px;
          color: white;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        .order-header::before {
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
        .filter-card {
          border-radius: 20px;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .filter-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
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
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
        }
        .order-id {
          color: #2563eb;
          font-weight: 700;
        }
        .customer-avatar {
          width: 45px;
          height: 45px;
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
        .customer-avatar:hover {
          transform: scale(1.1);
        }
        .amount-display {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .status-badge {
          border-radius: 25px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .status-badge:hover {
          transform: scale(1.05);
        }
        .action-select {
          border-radius: 15px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }
        .action-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          transform: translateY(-1px);
        }
        .search-input {
          border-radius: 20px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
        }
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .expandable-row {
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
          border-left: 4px solid #667eea;
        }
        .order-items {
          background: rgba(255,255,255,0.8);
          border-radius: 15px;
          padding: 1rem;
          margin: 0.5rem 0;
        }
        .item-card {
          background: white;
          border-radius: 10px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .view-details-btn {
          background: #667eea;
          border: none;
          border-radius: 20px;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }
        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          color: white;
        }
        @media (max-width: 768px) {
          .order-header h1 {
            font-size: 1.5rem;
          }
          .table-modern {
            font-size: 0.9rem;
          }
          .customer-avatar {
            width: 35px;
            height: 35px;
          }
          .stats-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
      
      <div className="container-fluid">
        {/* Header Section */}
        <div className="order-header p-4 mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3" style={{position: 'relative', zIndex: 2}}>
            <div>
              <h1 className="h2 fw-bold mb-2">
                <i className="fas fa-shopping-bag me-3"></i>
                Order Management
              </h1>
              <p className="mb-0 opacity-90">Monitor and manage customer orders efficiently</p>
            </div>
            <div className="d-flex gap-3 flex-wrap">
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">{orders.length}</div>
                <small className="opacity-75">Total Orders</small>
              </div>
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">₹{orders.reduce((sum, order) => sum + parseFloat(order.final_amount || order.total_amount || 0), 0).toFixed(0)}</div>
                <small className="opacity-75">Revenue</small>
              </div>
              <div className="text-center stats-card px-3 py-2">
                <div className="h3 mb-1">{orders.filter(o => o.status === 'delivered').length}</div>
                <small className="opacity-75">Delivered</small>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{borderRadius: '25px 0 0 25px'}}>
                <i className="fas fa-search" style={{color: '#6B7280'}}></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search orders..."
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
                <i className="fas fa-filter" style={{color: '#6B7280'}}></i>
              </span>
              <select 
                className="form-select border-start-0" 
                style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6B7280'}}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>
          </div>
          
          <div className="col-12 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                <i className="fas fa-calendar" style={{color: '#6B7280'}}></i>
              </span>
              <select 
                className="form-select border-start-0" 
                style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6B7280'}}
                defaultValue="all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card table-modern border-0">
          <div className="card-body p-0">
            {sortedOrders.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <i className="fas fa-shopping-bag fa-2x text-muted"></i>
                  </div>
                  <h4 className="text-muted mb-2">No Orders Found</h4>
                  <p className="text-muted mb-0">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'No orders have been placed yet'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th className="border-0 py-4 px-4">Order Details</th>
                      <th className="border-0 py-4 px-3 d-none d-md-table-cell">Customer</th>
                      <th className="border-0 py-4 px-3">Amount</th>
                      <th className="border-0 py-4 px-3">Status</th>
                      <th className="border-0 py-4 px-3 d-none d-lg-table-cell">Date</th>
                      <th className="border-0 py-4 px-3">Actions</th>
                      <th className="border-0 py-4 px-3">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((order) => {
                      const statusConfig = getStatusBadge(order.status);
                      return (
                        <React.Fragment key={order.id}>
                        <tr>
                          <td className="py-4 px-4">
                            <div className="d-flex align-items-center">
                              <div className="me-3 d-none d-sm-block">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                  <i className="fas fa-receipt text-primary"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="order-id">{order.order_id}</div>
                                <small className="text-muted">
                                  <i className="fas fa-box me-1"></i>
                                  {order.items_count || 0} items
                                </small>
                                <div className="d-md-none mt-1">
                                  <div className="d-flex align-items-center">
                                    <div className="customer-avatar me-2" style={{width: '30px', height: '30px'}}>
                                      {(order.user?.first_name?.[0] || order.user?.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="fw-semibold small">{order.user?.first_name} {order.user?.last_name}</div>
                                      <small className="text-muted">{order.user?.email}</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-lg-none mt-1">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 d-none d-md-table-cell">
                            <div className="d-flex align-items-center">
                              <div className="customer-avatar me-3">
                                {(order.user?.first_name?.[0] || order.user?.username?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-semibold">{order.user?.first_name} {order.user?.last_name}</div>
                                <small className="text-muted">{order.user?.email}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="amount-display">₹{parseFloat(order.final_amount || order.total_amount || 0).toFixed(0)}</div>
                            {order.discount_amount > 0 && (
                              <div className="d-flex align-items-center mt-1">
                                <i className="fas fa-tag text-success me-1" style={{fontSize: '0.7rem'}}></i>
                                <small className="text-success">₹{parseFloat(order.discount_amount).toFixed(0)} saved</small>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <span className={`status-badge ${statusConfig.class}`}>
                              <i className={`${statusConfig.icon} me-1`}></i>
                              <span className="d-none d-sm-inline">{order.status || 'pending'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-3 d-none d-lg-table-cell">
                            <div className="fw-medium">{new Date(order.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                            <small className="text-muted">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {Math.floor((new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24))} days ago
                            </small>
                          </td>
                          <td className="py-4 px-3">
                            <select 
                              className="form-select form-select-sm action-select"
                              value={order.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              style={{minWidth: '130px'}}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="confirmed">✅ Confirmed</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">📦 Delivered</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-3">
                            <div className="d-flex gap-1">
                              <button 
                                className="btn btn-sm view-details-btn"
                                onClick={() => toggleOrderExpansion(order.id)}
                                title="Toggle Items"
                              >
                                <i className={`fas ${expandedOrder === order.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                              </button>
                              <button 
                                className="btn btn-sm view-details-btn"
                                onClick={() => viewOrderDetails(order)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr className="expandable-row">
                            <td colSpan="7" className="py-3">
                              <div className="order-items">
                                <h6 className="mb-3"><i className="fas fa-box me-2"></i>Order Items</h6>
                                {order.items && order.items.length > 0 ? (
                                  <div className="row g-2">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="col-12 col-md-6 col-lg-4">
                                        <div className="item-card">
                                          <div className="d-flex align-items-center">
                                            <img 
                                              src={item.product?.image_url || 'https://via.placeholder.com/50'} 
                                              alt={item.product?.name}
                                              className="rounded me-3"
                                              style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                              onError={(e) => {e.target.src = 'https://via.placeholder.com/50?text=No+Image';}}
                                            />
                                            <div className="flex-grow-1">
                                              <h6 className="mb-1 small">{item.product?.name || 'Product'}</h6>
                                              <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">Qty: {item.quantity}</small>
                                                <span className="fw-bold text-success">₹{parseFloat(item.price).toFixed(0)}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-3">
                                    <i className="fas fa-box-open fa-2x text-muted mb-2"></i>
                                    <p className="text-muted mb-0">No items found</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {Math.ceil(sortedOrders.length / itemsPerPage) > 1 && (
            <div className="d-flex justify-content-center mt-4">
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
                  {[...Array(Math.ceil(sortedOrders.length / itemsPerPage))].map((_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(index + 1)}
                        style={{borderRadius: '0', backgroundColor: currentPage === index + 1 ? '#2563eb' : 'white', borderColor: '#2563eb', color: currentPage === index + 1 ? 'white' : '#2563eb'}}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.ceil(sortedOrders.length / itemsPerPage) ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === Math.ceil(sortedOrders.length / itemsPerPage)}
                      style={{borderRadius: '0 10px 10px 0'}}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
            <div style={{width: '100%', maxWidth: '800px', maxHeight: '90vh'}}>
              <div style={{backgroundColor: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', maxHeight: '100%', overflow: 'hidden'}}>
                <div style={{background: '#2563eb', color: 'white', borderRadius: '20px 20px 0 0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h5 style={{margin: 0, fontSize: '1.1rem'}}>
                    <i className="fas fa-receipt me-2"></i>
                    Order Details - {selectedOrder.order_id}
                  </h5>
                  <button onClick={() => setShowOrderModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
                </div>
                <div style={{flex: 1, overflowY: 'auto', padding: '1rem'}}>
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-primary mb-3">
                            <i className="fas fa-user me-2"></i>Customer
                          </h6>
                          <div className="d-flex align-items-center mb-3">
                            <div className="customer-avatar me-3" style={{width: '40px', height: '40px'}}>
                              {(selectedOrder.user?.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <h6 className="mb-1 small">{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</h6>
                              <small className="text-muted">{selectedOrder.user?.email}</small>
                            </div>
                          </div>
                          <div className="mb-2 small">
                            <strong>Address:</strong> {selectedOrder.shipping_address || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-success mb-3">
                            <i className="fas fa-credit-card me-2"></i>Payment
                          </h6>
                          <div className="mb-2 small">
                            <strong>Amount:</strong> 
                            <span className="amount-display ms-2">₹{parseFloat(selectedOrder.final_amount || selectedOrder.total_amount || 0).toFixed(0)}</span>
                          </div>
                          <div className="mb-2 small">
                            <strong>Method:</strong> {selectedOrder.payment_method || 'COD'}
                          </div>
                          <div className="mb-2 small">
                            <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}
                          </div>
                          <div className="mb-2 small">
                            <strong>Status:</strong> 
                            <span className={`status-badge ms-2 ${getStatusBadge(selectedOrder.status).class}`} style={{fontSize: '0.65rem', padding: '0.25rem 0.5rem'}}>
                              <i className={`${getStatusBadge(selectedOrder.status).icon} me-1`}></i>
                              {selectedOrder.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
                      <div className="card-body p-3">
                        <h6 className="card-title text-info mb-3">
                          <i className="fas fa-box me-2"></i>Items ({selectedOrder.items?.length || 0})
                        </h6>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          <div className="row g-2">
                            {selectedOrder.items.map((item, index) => (
                              <div key={index} className="col-12">
                                <div className="item-card" style={{padding: '0.5rem'}}>
                                  <div className="d-flex align-items-center">
                                    <img 
                                      src={item.product?.image_url || 'https://via.placeholder.com/50'} 
                                      alt={item.product?.name}
                                      className="rounded me-2"
                                      style={{width: '50px', height: '50px', objectFit: 'cover', flexShrink: 0}}
                                      onError={(e) => {e.target.src = 'https://via.placeholder.com/50?text=No+Image';}}
                                    />
                                    <div className="flex-grow-1 min-width-0">
                                      <h6 className="mb-1 small text-truncate">{item.product?.name || 'Product'}</h6>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">Qty: <strong>{item.quantity}</strong></small>
                                        <small className="text-muted">₹<strong>{parseFloat(item.price).toFixed(0)}</strong></small>
                                        <small className="text-success fw-bold">₹{item.total}</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <i className="fas fa-box-open fa-2x text-muted mb-2"></i>
                            <p className="text-muted mb-0 small">No items found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{padding: '1rem', display: 'flex', gap: '0.5rem'}}>
                  <button onClick={() => setShowOrderModal(false)} style={{padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer'}}>
                    Close
                  </button>
                  <select 
                    value={selectedOrder.status || 'pending'}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    }}
                    style={{flex: 1, padding: '0.5rem', borderRadius: '15px', border: '1px solid #ddd'}}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="shipped">🚚 Shipped</option>
                    <option value="delivered">📦 Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;