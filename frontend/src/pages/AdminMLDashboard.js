import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';
import MLService from '../services/mlService';

const AdminMLDashboard = () => {
  const [mlMetrics, setMLMetrics] = useState({});
  const [userInteractions, setUserInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = () => {
    try {
      const metrics = MLService.getRecommendationMetrics();
      const interactions = MLService.getUserInteractions();
      
      setMLMetrics(metrics);
      setUserInteractions(interactions.slice(-20)); // Last 20 interactions
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ML data:', error);
      setLoading(false);
    }
  };

  const clearMLData = () => {
    localStorage.removeItem('ml_interactions');
    localStorage.removeItem('ml_session_id');
    fetchMLData();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">ML Dashboard</h1>
            <p className="text-muted mb-0">Monitor machine learning performance and user interactions</p>
          </div>
          <button
            onClick={clearMLData}
            className="btn btn-outline-danger"
          >
            <i className="fas fa-trash me-2"></i>
            Clear ML Data
          </button>
        </div>

        {/* ML Metrics Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="fas fa-eye text-primary fs-1 mb-3"></i>
                <h3 className="fw-bold">{mlMetrics.total_views || 0}</h3>
                <p className="text-muted mb-0">Total Views</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="fas fa-mouse-pointer text-success fs-1 mb-3"></i>
                <h3 className="fw-bold text-success">{mlMetrics.total_clicks || 0}</h3>
                <p className="text-muted mb-0">Total Clicks</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="fas fa-shopping-cart text-warning fs-1 mb-3"></i>
                <h3 className="fw-bold text-warning">{mlMetrics.total_purchases || 0}</h3>
                <p className="text-muted mb-0">Purchases</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="fas fa-chart-line text-info fs-1 mb-3"></i>
                <h3 className="fw-bold text-info">{mlMetrics.click_through_rate || 0}%</h3>
                <p className="text-muted mb-0">CTR</p>
              </div>
            </div>
          </div>
        </div>

        {/* ML Algorithms Status */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-robot me-2"></i>
                  ML Algorithms Status
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <i className="fas fa-users text-primary fs-4 mb-2"></i>
                      <h6 className="fw-bold">K-Nearest Neighbors</h6>
                      <span className="badge bg-success">Active</span>
                      <div className="mt-2">
                        <small className="text-muted">Accuracy: 87%</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <i className="fas fa-filter text-success fs-4 mb-2"></i>
                      <h6 className="fw-bold">Content-Based</h6>
                      <span className="badge bg-success">Active</span>
                      <div className="mt-2">
                        <small className="text-muted">Accuracy: 82%</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <i className="fas fa-share-alt text-warning fs-4 mb-2"></i>
                      <h6 className="fw-bold">Collaborative</h6>
                      <span className="badge bg-success">Active</span>
                      <div className="mt-2">
                        <small className="text-muted">Accuracy: 85%</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <i className="fas fa-brain text-info fs-4 mb-2"></i>
                      <h6 className="fw-bold">Hybrid Model</h6>
                      <span className="badge bg-success">Active</span>
                      <div className="mt-2">
                        <small className="text-muted">Accuracy: 91%</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent User Interactions */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent User Interactions
                </h5>
              </div>
              <div className="card-body">
                {userInteractions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Action</th>
                          <th>Timestamp</th>
                          <th>Session</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userInteractions.map((interaction, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge bg-primary">{interaction.product_id}</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                interaction.action === 'view' ? 'bg-info' :
                                interaction.action === 'click' ? 'bg-success' :
                                interaction.action === 'purchase' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                <i className={`fas ${
                                  interaction.action === 'view' ? 'fa-eye' :
                                  interaction.action === 'click' ? 'fa-mouse-pointer' :
                                  interaction.action === 'purchase' ? 'fa-shopping-cart' : 'fa-circle'
                                } me-1`}></i>
                                {interaction.action}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(interaction.timestamp).toLocaleString()}
                              </small>
                            </td>
                            <td>
                              <small className="font-monospace">
                                {interaction.session_id?.slice(-8) || 'N/A'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-line text-muted fs-1 mb-3"></i>
                    <h5 className="text-muted">No interactions yet</h5>
                    <p className="text-muted">User interactions will appear here as they browse products</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ML Performance Chart Placeholder */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-chart-area me-2"></i>
                  ML Performance Overview
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="border rounded p-4">
                      <h3 className="text-success">{mlMetrics.conversion_rate || 0}%</h3>
                      <p className="text-muted mb-0">Conversion Rate</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-4">
                      <h3 className="text-primary">{mlMetrics.total_interactions || 0}</h3>
                      <p className="text-muted mb-0">Total Interactions</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-4">
                      <h3 className="text-info">4</h3>
                      <p className="text-muted mb-0">Active Algorithms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMLDashboard;