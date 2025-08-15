import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLayoutStyles = `
    .admin-main-content {
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }
    @media (min-width: 768px) {
      .admin-main-content {
        margin-left: 256px;
      }
    }
    .admin-sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    @media (min-width: 768px) {
      .admin-sidebar {
        transform: translateX(0);
      }
    }
  `;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm16 14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2ZM4 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Zm16-2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6Z" />
    </svg>
  );

  const overviewicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M7.111 20A3.111 3.111 0 0 1 4 16.889v-12C4 4.398 4.398 4 4.889 4h4.444a.89.89 0 0 1 .89.889v12A3.111 3.111 0 0 1 7.11 20Zm0 0h12a.889.889 0 0 0 .889-.889v-4.444a.889.889 0 0 0-.889-.89h-4.389a.889.889 0 0 0-.62.253l-3.767 3.665a.933.933 0 0 0-.146.185c-.868 1.433-1.581 1.858-3.078 2.12Zm0-3.556h.009m7.933-10.927 3.143 3.143a.889.889 0 0 1 0 1.257l-7.974 7.974v-8.8l3.574-3.574a.889.889 0 0 1 1.257 0Z" />
    </svg>
  );

  const productsicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z"/>
    </svg>
  );

  const usersicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
    </svg>
  );

  const ordersicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-6 4h6m-6 4h6M6 3v18l2-2 2 2 2-2 2 2 2-2 2 2V3l-2 2-2-2-2 2-2-2-2 2-2-2Z"/>
    </svg>
  );

  const addicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  );

  const offersicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  );

  const mlicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  );

  const wishlisticon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"/>
    </svg>
  );

  const sidebarLinks = [
    { name: "Overview", path: "/dashboard", icon: overviewicon },
    { name: "Products", path: "/admin/products", icon: productsicon },
    { name: "Users", path: "/admin/users", icon: usersicon },
    { name: "Orders", path: "/admin/orders", icon: ordersicon },
    { name: "Wishlists", path: "/admin/wishlists", icon: wishlisticon },
    { name: "Analytics", path: "/admin/analytics", icon: mlicon },
    { name: "Offers", path: "/admin/offers", icon: offersicon },
  ];

  const isAnalyticsPage = location.pathname === '/admin/analytics';

  return (
    <>
      <style>{adminLayoutStyles}</style>
      <div className="min-vh-100 bg-light">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 bg-white position-fixed w-100 shadow-sm" style={{top: '0', zIndex: '1030', borderBottom: '1px solid #e9ecef', height: '70px'}}>
        <div className="d-flex align-items-center">
          <div>
            <Link to="/" className="text-decoration-none">
              <div className="d-flex align-items-center">
                <i className="fas fa-microchip me-2" style={{fontSize: '1.5rem', color: '#6366f1'}}></i>
                <h5 className="mb-0" style={{fontWeight: 'bold', fontSize: '1.25rem', color: '#6366f1'}}>E-Mart</h5>
              </div>
            </Link>
            <div><small className="text-muted">Admin Dashboard</small></div>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="dropdown">
            <button 
              className="btn d-flex align-items-center gap-2 dropdown-toggle border-0 bg-transparent"
              data-bs-toggle="dropdown"
              style={{padding: '0.5rem'}}
            >
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="rounded-circle" 
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                ) : (
                  <i className="fas fa-user text-white"></i>
                )}
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-medium text-dark" style={{fontSize: '0.9rem'}}>Hi, {user?.first_name || 'Admin'}!</div>
                <small className="text-muted">Administrator</small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" style={{minWidth: '250px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'}}>
              <li><span className="dropdown-header" style={{fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'}}>My Account</span></li>
              <li>
                <a className="dropdown-item d-flex align-items-center gap-3" href="/profile" style={{borderRadius: '8px', margin: '0.25rem', padding: '0.75rem 1rem'}}>
                  <i className="fas fa-user" style={{width: '16px', color: '#6366f1'}}></i>
                  <span>Profile</span>
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center gap-3" href="/orders" style={{borderRadius: '8px', margin: '0.25rem', padding: '0.75rem 1rem'}}>
                  <i className="fas fa-receipt" style={{width: '16px', color: '#10b981'}}></i>
                  <span>Orders</span>
                </a>
              </li>
              <li><hr className="dropdown-divider" style={{margin: '0.5rem 0'}} /></li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center gap-3 text-danger" 
                  onClick={handleLogout}
                  style={{borderRadius: '8px', margin: '0.25rem', padding: '0.75rem 1rem', border: 'none', background: 'none', width: '100%'}}
                >
                  <i className="fas fa-sign-out-alt" style={{width: '16px'}}></i>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="d-flex">
        {/* Sidebar */}
        <div className="d-none d-md-flex flex-column position-fixed admin-sidebar" 
             style={{
               width: '256px', 
               height: 'calc(100vh - 70px)', 
               top: '70px', 
               left: '0', 
               background: '#fff',
               borderRight: '1px solid #e9ecef',
               overflowY: 'auto',
               zIndex: '1020'
             }}>
          <div className="px-4 py-4">
            <h6 className="text-muted fw-bold mb-0" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>NAVIGATION</h6>
          </div>
          {sidebarLinks.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`d-flex align-items-center py-3 px-4 gap-3 text-decoration-none position-relative ${
                location.pathname === item.path
                  ? "text-primary bg-primary bg-opacity-10"
                  : "text-dark"
              }`}
              style={{
                transition: 'all 0.3s ease',
                borderLeft: location.pathname === item.path ? '4px solid #0d6efd' : '4px solid transparent',
                margin: '0 12px',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.closest('a').style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.closest('a').style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="me-2" style={{fontSize: '1.1rem'}}>
                {item.icon}
              </div>
              <span className="fw-medium">{item.name}</span>
              {location.pathname === item.path && (
                <div className="ms-auto">
                  <i className="fas fa-chevron-right text-primary" style={{fontSize: '0.8rem'}}></i>
                </div>
              )}
            </Link>
          ))}
          
          <div className="mt-auto p-4">
            <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-center border">
              <div className="text-primary mb-2">
                <i className="fas fa-crown fa-2x"></i>
              </div>
              <h6 className="text-dark fw-bold mb-1">Admin Panel</h6>
              <small className="text-muted">Full Control Access</small>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="d-md-none">
            <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{zIndex: 1040}} onClick={() => setSidebarOpen(false)}></div>
            <div className="position-fixed top-0 start-0 h-100 bg-white shadow-lg d-flex flex-column pt-4" style={{width: '256px', zIndex: 1050}}>
              <div className="d-flex justify-content-between align-items-center px-4 pb-3 border-bottom">
                <h5 className="mb-0">Admin Menu</h5>
                <button className="btn btn-sm" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {sidebarLinks.map((item, index) => (
                <Link
                  to={item.path}
                  key={index}
                  className={`d-flex align-items-center py-3 px-4 gap-3 text-decoration-none ${
                    location.pathname === item.path
                      ? "border-end border-primary border-4 bg-primary bg-opacity-10 text-primary"
                      : "text-secondary"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <p className="mb-0">{item.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="admin-main-content flex-grow-1 p-2 p-md-4" style={{
          minHeight: 'calc(100vh - 70px)', 
          paddingBottom: '80px', 
          overflowY: 'auto', 
          marginTop: '70px'
        }}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="d-md-none position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg" style={{zIndex: 1030}}>
        <div className="row g-0">
          {sidebarLinks.slice(0, 5).map((item, index) => (
            <div key={index} className="col">
              <Link
                to={item.path}
                className={`d-flex flex-column align-items-center justify-content-center py-2 text-decoration-none ${
                  location.pathname === item.path ? "text-primary" : "text-muted"
                }`}
                style={{fontSize: '0.75rem'}}
              >
                <div className="mb-1">{item.icon}</div>
                <span style={{fontSize: '0.65rem'}}>{item.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminLayout;