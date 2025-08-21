import React, { useState, useEffect } from 'react';
import AdminOfferFormModal from '../components/AdminOfferFormModal';
import OfferBadge from '../components/OfferBadge';
import AdminLayout from '../components/AdminLayout';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUsage, setFilterUsage] = useState('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  const refreshAllUsageStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const updatedOffers = await Promise.all(
        offers.map(async (offer) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/usage-stats/${offer.id}/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              return { ...offer, used_count: data.used_count };
            }
          } catch (error) {
            console.error(`Error refreshing stats for offer ${offer.id}:`, error);
          }
          return offer;
        })
      );
      
      setOffers(updatedOffers);
      alert('Usage statistics refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing all usage stats:', error);
      alert('Error refreshing usage statistics');
    }
  };

  const debugOfferUsage = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/debug-usage/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Debug Offer Usage Data:', data);
        alert(`Debug info logged to console. Total offers: ${data.total_offers}, Total orders: ${data.total_orders}`);
      } else {
        alert('Failed to get debug info');
      }
    } catch (error) {
      console.error('Error getting debug info:', error);
      alert('Error getting debug info');
    }
  };

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : []);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setShowModal(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setShowModal(true);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/delete/${offerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setOffers(offers.filter(offer => offer.id !== offerId));
        alert('Offer deleted successfully');
      } else {
        alert('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer');
    }
  };

  const handleRevokeOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to revoke this offer? This will deactivate it and remove it from all active carts.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/revoke/${offerId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(offers.map(offer => 
          offer.id === offerId ? {...offer, is_active: false} : offer
        ));
        alert(data.message || 'Offer revoked successfully');
      } else {
        alert('Failed to revoke offer');
      }
    } catch (error) {
      console.error('Error revoking offer:', error);
      alert('Failed to revoke offer');
    }
  };

  const refreshUsageStats = async (offerId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/usage-stats/${offerId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(offers.map(offer => 
          offer.id === offerId ? {...offer, used_count: data.used_count} : offer
        ));
      }
    } catch (error) {
      console.error('Error refreshing usage stats:', error);
    }
  };

  const handleToggleActive = async (offer) => {
    const newStatus = !offer.is_active;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/update/${offer.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (response.ok) {
        setOffers(offers.map(o => o.id === offer.id ? {...o, is_active: newStatus} : o));
      }
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleModalSave = (savedOffer) => {
    if (editingOffer) {
      setOffers(offers.map(o => o.id === savedOffer.id ? savedOffer : o));
    } else {
      setOffers([savedOffer, ...offers]);
    }
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  const getOfferTypeLabel = (offerType) => {
    const labels = {
      'discount': 'Percentage Discount',
      'flat': 'Flat Discount',
      'category_offer': 'Category Offer',
      'first_time': 'First Time Offer'
    };
    return labels[offerType] || 'Special Offer';
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || offer.offer_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && offer.is_active) ||
                         (filterStatus === 'inactive' && !offer.is_active);
    
    const usedCount = offer.used_count || 0;
    const matchesUsage = filterUsage === 'all' ||
                        (filterUsage === 'high' && usedCount > 10) ||
                        (filterUsage === 'low' && usedCount > 0 && usedCount <= 10) ||
                        (filterUsage === 'unused' && usedCount === 0);
    
    return matchesSearch && matchesType && matchesStatus && matchesUsage;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading offers...</h5>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        .admin-offers-page {
          background: #f8fafc;
          min-height: 100vh;
        }
        .header-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .stats-card {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #cbd5e1;
        }
        .stats-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          transition: all 0.2s ease;
        }
        .filter-card {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background: #ffffff;
        }
        .search-input {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          transition: all 0.2s ease;
          background: #ffffff;
          font-size: 0.95rem;
        }
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 0.9rem;
        }
        .offer-card {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          overflow: hidden;
          background: #ffffff;
        }
        .offer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #cbd5e1;
        }
        .offer-header {
          background: #f8fafc;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .offer-header.inactive {
          background: #f1f5f9;
        }
        .info-item {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .info-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .btn-gradient {
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          color: white;
        }
        .btn-gradient:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .empty-state {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .dropdown-menu {
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: #ffffff;
          padding: 0.5rem;
        }
        .dropdown-item {
          border-radius: 6px;
          margin: 0.125rem 0;
          padding: 0.5rem 0.75rem;
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: #f8fafc;
        }
        .hover-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
        .btn-outline-warning:hover {
          background: #ffc107;
          border-color: #ffc107;
          color: #000;
        }
        .btn-outline-info:hover {
          background: #0dcaf0;
          border-color: #0dcaf0;
          color: #000;
        }
        .btn-outline-danger:hover {
          background: #dc3545;
          border-color: #dc3545;
          color: #fff;
        }
        .btn-outline-success:hover {
          background: #198754;
          border-color: #198754;
          color: #fff;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .card {
          border-radius: 12px;
        }
        .btn {
          border-radius: 8px;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .offer-card { margin-bottom: 1.5rem; }
        }
        @media (max-width: 768px) {
          .admin-offers-page { padding: 0.5rem !important; }
          .header-card .card-body { padding: 1.5rem !important; }
          .stats-card .card-body { padding: 1.5rem !important; }
          .filter-card .card-body { padding: 1.5rem !important; }
          .offer-header { padding: 1rem !important; }
          .search-input { padding: 0.75rem 1rem 0.75rem 2.5rem !important; font-size: 0.9rem !important; }
          .btn-gradient { padding: 0.75rem 1.5rem !important; font-size: 0.9rem !important; }
          .h3 { font-size: 1.5rem !important; }
          .col-lg-4 { text-align: center !important; margin-top: 1rem; }
        }
        @media (max-width: 576px) {
          .admin-offers-page { padding: 0.25rem !important; }
          .header-card .card-body { padding: 1rem !important; }
          .stats-card .card-body { padding: 1rem !important; }
          .filter-card .card-body { padding: 1rem !important; }
          .offer-header { padding: 0.75rem !important; }
          .info-item { padding: 0.75rem !important; }
          .stats-icon { width: 50px !important; height: 50px !important; }
          .search-input { font-size: 0.85rem !important; }
          .offer-card .card-body { padding: 0.75rem !important; }
          .row.g-4 { --bs-gutter-x: 0.5rem; --bs-gutter-y: 0.5rem; }
          .row.g-3 { --bs-gutter-x: 0.25rem; --bs-gutter-y: 0.25rem; }
          .col-lg-5, .col-lg-3, .col-lg-2 { margin-bottom: 0.5rem; }
        }
      `}</style>

      <AdminLayout>
        <div className="admin-offers-page">


          {/* Header with Add Button */}
          <div className="card header-card mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h1 className="h3 fw-bold text-dark mb-2">Offers Management</h1>
                  <p className="text-muted mb-0">Create and manage promotional offers for your store</p>
                </div>
                <div className="col-lg-4 text-end">
                  <div className="d-flex gap-2 justify-content-end flex-wrap">
                    <button
                      onClick={debugOfferUsage}
                      className="btn btn-outline-secondary px-3 py-2"
                      style={{borderRadius: '8px'}}
                      title="Debug offer usage tracking"
                    >
                      <i className="fas fa-bug me-2"></i>
                      Debug
                    </button>
                    <button
                      onClick={refreshAllUsageStats}
                      className="btn btn-outline-info px-3 py-2"
                      style={{borderRadius: '8px'}}
                      title="Refresh all usage statistics"
                    >
                      <i className="fas fa-sync me-2"></i>
                      Refresh Stats
                    </button>
                    <button
                      onClick={handleCreateOffer}
                      className="btn btn-gradient px-4 py-2"
                      style={{borderRadius: '8px'}}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add New Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card stats-card h-100">
                <div className="card-body text-center p-4">
                  <div className="stats-icon bg-primary bg-opacity-10">
                    <i className="fas fa-tags text-primary fs-2"></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">{offers.length}</h2>
                  <p className="text-muted mb-0 fw-medium">Total Offers</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card stats-card h-100">
                <div className="card-body text-center p-4">
                  <div className="stats-icon bg-success bg-opacity-10">
                    <i className="fas fa-check-circle text-success fs-2"></i>
                  </div>
                  <h2 className="fw-bold text-success mb-1">{offers.filter(o => o.is_active).length}</h2>
                  <p className="text-muted mb-0 fw-medium">Active Offers</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card stats-card h-100">
                <div className="card-body text-center p-4">
                  <div className="stats-icon bg-warning bg-opacity-10">
                    <i className="fas fa-pause-circle text-warning fs-2"></i>
                  </div>
                  <h2 className="fw-bold text-warning mb-1">{offers.filter(o => !o.is_active).length}</h2>
                  <p className="text-muted mb-0 fw-medium">Inactive Offers</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card stats-card h-100">
                <div className="card-body text-center p-4">
                  <div className="stats-icon bg-info bg-opacity-10">
                    <i className="fas fa-chart-line text-info fs-2"></i>
                  </div>
                  <h2 className="fw-bold text-info mb-1">{offers.reduce((sum, o) => sum + (parseInt(o.used_count) || 0), 0)}</h2>
                  <p className="text-muted mb-0 fw-medium">Total Usage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4">
            <h2 className="h5 fw-medium mb-4">Filter & Search Offers - {filteredOffers.length} total offers</h2>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{borderRadius: '25px 0 0 25px'}}>
                    <i className="fas fa-search" style={{color: '#6b7280'}}></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="Search offers..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6b7280'}}
                  />
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                    <i className="fas fa-tag" style={{color: '#6b7280'}}></i>
                  </span>
                  <select 
                    className="form-select border-start-0" 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6b7280'}}
                  >
                    <option value="all">All Types</option>
                    <option value="discount">Percentage Discount</option>
                    <option value="flat">Flat Discount</option>
                    <option value="category_offer">Category Offer</option>
                    <option value="first_time">First Time Offer</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                    <i className="fas fa-toggle-on" style={{color: '#6b7280'}}></i>
                  </span>
                  <select 
                    className="form-select border-start-0" 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6b7280'}}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                    <i className="fas fa-chart-bar" style={{color: '#6b7280'}}></i>
                  </span>
                  <select 
                    className="form-select border-start-0" 
                    value={filterUsage}
                    onChange={(e) => setFilterUsage(e.target.value)}
                    style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6b7280'}}
                  >
                    <option value="all">All Usage</option>
                    <option value="high">High Usage (10+)</option>
                    <option value="low">Low Usage (1-10)</option>
                    <option value="unused">Unused (0)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Grid Section */}
          <section className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Your Promotional Offers</h2>
                <p className="text-muted">Manage and track all your marketing campaigns</p>
              </div>
              
              {filteredOffers.length === 0 ? (
                <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}}>
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <i className="fas fa-tags text-muted" style={{fontSize: '5rem', opacity: 0.3}}></i>
                    </div>
                    <h3 className="text-muted mb-3">No offers found</h3>
                    <p className="text-muted mb-4 fs-5">Create your first promotional offer to get started</p>
                    <button
                      onClick={handleCreateOffer}
                      className="btn btn-lg px-5 py-3 shadow-lg"
                      style={{background: 'var(--color-primary, #667eea)', border: 'none', color: 'white', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600'}}
                    >
                      <i className="fas fa-plus me-2"></i>Create First Offer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredOffers.map((offer) => (
                <div key={offer.id} className="col-12 mb-4">
                  <div className="card border-0 shadow-sm" style={{borderRadius: '15px', background: '#ffffff', border: '1px solid #e9ecef'}}>
                    <div className="card-body p-4">
                      <div className="row align-items-center g-3">
                        {/* Offer Info */}
                        <div className="col-12 col-md-5">
                          <div className="d-flex align-items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                   style={{width: '50px', height: '50px', background: offer.is_active ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#6c757d', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                                <i className="fas fa-percentage text-white fs-6"></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <h6 className="fw-bold mb-0 text-dark">{offer.name}</h6>
                                <span className={`badge ${offer.is_active ? 'bg-success' : 'bg-secondary'}`} style={{fontSize: '0.7rem'}}>
                                  {offer.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="text-muted small">Code:</span>
                                <code className="bg-light px-2 py-1 rounded border text-primary fw-medium" style={{fontSize: '0.8rem'}}>
                                  {offer.code}
                                </code>
                              </div>
                              <p className="text-muted small mb-0">{offer.description || 'Special promotional offer'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Offer Details */}
                        <div className="col-6 col-md-2">
                          <div className="text-center">
                            <div className="fw-bold text-primary mb-1" style={{fontSize: '1.1rem'}}>
                              {offer.offer_type === 'discount' || offer.offer_type === 'category_offer' || offer.offer_type === 'first_time' ? 
                                `${offer.discount_percentage}% OFF` : 
                                offer.offer_type === 'flat' ? `₹${offer.flat_discount} OFF` : 'Special Offer'
                              }
                            </div>
                            <div className="small text-muted">{getOfferTypeLabel(offer.offer_type)}</div>
                          </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="col-6 col-md-2">
                          <div className="text-center">
                            <div className="fw-bold text-info mb-1" style={{fontSize: '1.1rem'}}>{offer.used_count || 0}</div>
                            <div className="small text-muted">Times Used</div>
                            {offer.min_order_value > 0 && (
                              <div className="small text-success mt-1">Min: ₹{offer.min_order_value}</div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="col-12 col-md-3">
                          <div className="text-center text-md-start">
                            <div className="small mb-1">
                              <span className="text-muted">Expires:</span> 
                              <span className="fw-medium text-danger">{new Date(offer.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="small mb-2">
                              <span className="text-muted">Created:</span> 
                              <span className="fw-medium">{new Date(offer.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                              {offer.auto_apply && (
                                <span className="badge bg-primary text-white px-2 py-1" style={{fontSize: '0.75rem', fontWeight: '500'}}>
                                  Auto Apply
                                </span>
                              )}
                              {offer.first_time_only && (
                                <span className="badge bg-success text-white px-2 py-1" style={{fontSize: '0.75rem', fontWeight: '500'}}>
                                  First Time
                                </span>
                              )}
                              {(offer.used_count || 0) > 10 && (
                                <span className="badge bg-warning text-dark px-2 py-1" style={{fontSize: '0.75rem', fontWeight: '500'}}>
                                  Popular
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                          <button className="btn btn-primary btn-sm px-3 py-2" 
                                  onClick={() => handleEditOffer(offer)}
                                  style={{borderRadius: '8px', fontWeight: '500'}}>
                            <i className="fas fa-edit me-2"></i>Edit Offer
                          </button>
                          
                          <button className={`btn btn-sm px-3 py-2 ${offer.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                                  onClick={() => handleToggleActive(offer)}
                                  style={{borderRadius: '8px', fontWeight: '500'}}>
                            <i className={`fas ${offer.is_active ? 'fa-pause' : 'fa-play'} me-2`}></i>
                            {offer.is_active ? 'Pause' : 'Activate'}
                          </button>
                          
                          <button className="btn btn-outline-info btn-sm px-3 py-2" 
                                  onClick={() => refreshUsageStats(offer.id)}
                                  style={{borderRadius: '8px', fontWeight: '500'}}
                                  title="Refresh usage statistics">
                            <i className="fas fa-sync me-2"></i>Refresh
                          </button>
                          
                          {offer.is_active && (
                            <button className="btn btn-outline-warning btn-sm px-3 py-2" 
                                    onClick={() => handleRevokeOffer(offer.id)}
                                    style={{borderRadius: '8px', fontWeight: '500'}}>
                              <i className="fas fa-ban me-2"></i>Revoke
                            </button>
                          )}
                          
                          <button className="btn btn-outline-danger btn-sm px-3 py-2" 
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  style={{borderRadius: '8px', fontWeight: '500'}}>
                            <i className="fas fa-trash me-2"></i>Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <AdminOfferFormModal
            show={showModal}
            offer={editingOffer}
            onSave={handleModalSave}
            onCancel={handleModalCancel}
          />
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminOffers;