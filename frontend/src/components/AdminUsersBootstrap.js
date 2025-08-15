import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import Loader from './Loader';

const AdminUsersBootstrap = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Username and email are required');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      } else {
        const response = await adminAPI.createUser(formData);
        toast.success('User created successfully');
        setUsers([...users, response.data]);
      }
      setShowModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Save user error:', error);
      toast.error(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Delete user error:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      try {
        await adminAPI.banUser(userId);
        toast.success('User banned successfully');
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
      } catch (error) {
        console.error('Ban user error:', error);
        toast.error('Failed to ban user');
      }
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <style>{`
        .user-management-container {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 2rem 0;
        }
        .user-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: none;
          overflow: hidden;
        }
        .user-header {
          background: #2563eb;
          color: white;
          padding: 2rem;
        }
        .search-filter-section {
          background: white;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .user-table {
          margin: 0;
          white-space: nowrap;
        }
        .user-table th {
          background: #2563eb;
          color: white;
          font-weight: 600;
          border: none;
          padding: 0.75rem;
          font-size: 0.85rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .user-table td {
          padding: 0.75rem;
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
          background: white;
        }
        .user-table tbody tr {
          transition: all 0.2s ease;
        }
        .user-table tbody tr:hover {
          background-color: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .action-btn {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          margin: 0 0.1rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .form-control, .form-select {
          border-radius: 10px;
          border: 2px solid #e9ecef;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .btn-primary {
          background: #2563eb;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }
        .pagination {
          justify-content: center;
          margin-top: 2rem;
        }
        .page-link {
          border-radius: 10px;
          margin: 0 0.2rem;
          border: 2px solid #e9ecef;
          color: #2563eb;
          transition: all 0.3s ease;
        }
        .page-link:hover, .page-item.active .page-link {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .user-header {
            padding: 1.5rem;
          }
          .user-header h4 {
            font-size: 1.5rem;
          }
          .search-filter-section {
            padding: 1rem;
          }
          .user-table {
            font-size: 0.8rem;
          }
          .user-table th, .user-table td {
            padding: 0.5rem 0.25rem;
          }
          .user-avatar {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }
          .action-btn {
            width: 28px;
            height: 28px;
            font-size: 0.7rem;
          }
        }
        @media (max-width: 576px) {
          .user-management-container {
            padding: 1rem 0;
          }
          .user-card {
            border-radius: 15px;
            margin: 0 0.25rem;
          }
          .table-responsive {
            font-size: 0.75rem;
            border-radius: 0;
          }
          .user-table th, .user-table td {
            padding: 0.4rem 0.2rem;
          }
          .status-badge {
            font-size: 0.65rem;
            padding: 0.2rem 0.5rem;
          }
        }
      `}</style>

      <div className="user-management-container">
        <div className="container-fluid">
          <div className="user-card">
            {/* Header */}
            <div className="user-header">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">
                    <i className="fas fa-users me-3"></i>User Management
                  </h4>
                  <p className="mb-0 opacity-75">Manage all registered users efficiently</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-users me-1"></i>
                    Total: {users.length}
                  </span>
                  <span className="badge bg-success px-3 py-2">
                    <i className="fas fa-check-circle me-1"></i>
                    Active: {users.filter(u => u.is_active).length}
                  </span>
                  <button className="btn btn-light btn-sm shadow" onClick={handleAddUser}>
                    <i className="fas fa-user-plus me-2"></i>Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-section">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0" style={{borderRadius: '25px 0 0 25px'}}>
                      <i className="fas fa-search" style={{color: '#6B7280'}}></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0" 
                      placeholder="Search users..."
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
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
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
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name_asc">Name A-Z</option>
                      <option value="name_desc">Name Z-A</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-12 col-md-2">
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{borderRadius: '25px 0 0 25px'}}>
                      <i className="fas fa-users" style={{color: '#6B7280'}}></i>
                    </span>
                    <select 
                      className="form-select border-start-0" 
                      style={{borderRadius: '0 25px 25px 0', height: '46px', fontSize: '14px', color: '#6B7280'}}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="super">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {currentUsers.length} of {filteredUsers.length} users
                </small>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              {currentUsers.length > 0 ? (
                <table className="table table-responsive user-table">
                  <thead>
                    <tr>
                      <th style={{minWidth: '200px'}}>User</th>
                      <th style={{minWidth: '220px'}}>Contact</th>
                      <th style={{minWidth: '100px'}}>Status</th>
                      <th style={{minWidth: '120px'}}>Joined</th>
                      <th style={{minWidth: '100px'}}>Role</th>
                      <th className="text-center" style={{minWidth: '150px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="user-avatar">
                              {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-truncate" style={{maxWidth: '150px'}}>
                              <div className="fw-bold text-truncate">
                                {user.first_name} {user.last_name}
                              </div>
                              <small className="text-muted text-truncate d-block">@{user.username}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{maxWidth: '200px'}}>
                            <div className="fw-medium text-truncate">{user.email}</div>
                            <small className="text-muted">
                              <i className="fas fa-envelope me-1"></i>
                              Contact
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                            <i className={`fas ${user.is_active ? 'fa-check' : 'fa-times'} me-1`}></i>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium" style={{fontSize: '0.85rem'}}>
                              {new Date(user.date_joined).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </div>
                            <small className="text-muted">
                              {Math.floor((new Date() - new Date(user.date_joined)) / (1000 * 60 * 60 * 24))}d ago
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            user.is_superuser ? 'bg-danger text-white' :
                            user.is_staff ? 'bg-warning text-dark' : 'bg-info'
                          } px-2 py-1`}>
                            <i className={`fas ${
                              user.is_superuser ? 'fa-shield-alt' :
                              user.is_staff ? 'fa-crown' : 'fa-user'
                            } me-1`}></i>
                            {user.is_superuser ? 'Super' : user.is_staff ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button 
                              className="btn btn-sm btn-outline-primary action-btn"
                              onClick={() => handleEditUser(user)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-warning action-btn"
                              onClick={() => handleBanUser(user.id)}
                              title="Ban"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger action-btn"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-5">
                  <div className="p-5">
                    <i className="fas fa-users fa-4x text-muted mb-3"></i>
                    <h4 className="text-muted">No Users Found</h4>
                    <p className="text-muted mb-4">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No users match your search criteria' 
                        : 'Start by adding your first user to the system'
                      }
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                      <button className="btn btn-primary btn-lg" onClick={handleAddUser}>
                        <i className="fas fa-user-plus me-2"></i>Add First User
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-top bg-light">
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div style={{width: '100%', maxWidth: '600px', maxHeight: '90vh'}}>
            <div style={{backgroundColor: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', maxHeight: '100%', overflow: 'hidden'}}>
              <div style={{background: '#2563eb', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h5 style={{margin: 0, fontSize: '1.1rem'}}>
                  <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
              </div>
              <div style={{flex: 1, overflowY: 'auto', padding: '1.5rem'}}>
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-user me-1"></i>Username *
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-envelope me-1"></i>Email *
                      </label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-id-card me-1"></i>First Name
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-id-card me-1"></i>Last Name
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                    {!editingUser && (
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="fas fa-lock me-1"></i>Password *
                        </label>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="userStatus"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        />
                        <label className="form-check-label fw-bold" htmlFor="userStatus">
                          <i className="fas fa-toggle-on me-1"></i>Active User
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div style={{padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}
                >
                  <i className="fas fa-times me-1"></i>Cancel
                </button>
                <button 
                  onClick={handleSaveUser}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}
                >
                  <i className={`fas ${editingUser ? 'fa-save' : 'fa-plus'} me-1`}></i>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsersBootstrap;