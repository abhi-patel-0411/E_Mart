import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const footerStyle = `
    .footer-white h1, .footer-white h2, .footer-white h3, .footer-white h4, .footer-white h5, .footer-white h6, .footer-white p, .footer-white span, .footer-white div {
      color: #fff !important;
    }
    .footer-white a {
      color: #ccc !important;
    }
    .footer-white {
      margin-top: auto;
      min-height: auto;
    }
    @media (max-width: 576px) {
      .footer-white {
        font-size: 0.85rem;
      }
      .footer-white .small {
        font-size: 0.75rem !important;
      }
      .footer-white h6 {
        font-size: 0.9rem !important;
      }
    }
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    #root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `;
  return (
    <>
      <style>{footerStyle}</style>
      <footer className="footer-white px-2 px-sm-3 px-md-5 pt-4 pt-md-5 w-100 mt-auto" style={{backgroundColor: '#000', color: '#fff'}}>
      <div className="container-fluid">
        <div className="row border-bottom pb-4 pb-md-5" style={{borderColor: '#333'}}>
          <div className="col-12 col-md-5 mb-4 mb-md-0">
            <div className="mb-3">
              <Logo size="medium" variant="white" />
            </div>
            <p className="mt-3 small" style={{lineHeight: '1.6'}}>
              Discover cutting-edge technology and premium electronics. Innovation, quality, and performance for modern life.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3">
              <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg" alt="google play" className="border rounded" style={{height: '35px', width: 'auto', borderColor: '#333'}} />
              <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg" alt="app store" className="border rounded" style={{height: '35px', width: 'auto', borderColor: '#333'}} />
            </div>
          </div>
          <div className="col-12 col-md-7">
            <div className="row">
              <div className="col-4 col-sm-4">
                <h6 className="fw-semibold mb-3">Company</h6>
                <ul className="list-unstyled small">
                  <li className="mb-2"><Link to="/" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Home</Link></li>
                  <li className="mb-2"><Link to="/about" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>About</Link></li>
                  <li className="mb-2"><Link to="/contact" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Contact</Link></li>
                  <li className="mb-2"><Link to="/products" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Products</Link></li>
                </ul>
              </div>
              <div className="col-4 col-sm-4">
                <h6 className="fw-semibold mb-3">Categories</h6>
                <ul className="list-unstyled small">
                  <li className="mb-2"><a href="#" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Phones</a></li>
                  <li className="mb-2"><a href="#" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Laptops</a></li>
                  <li className="mb-2"><a href="#" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Audio</a></li>
                  <li className="mb-2"><a href="#" className="text-decoration-none" style={{color: '#ccc'}} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#ccc'}>Gaming</a></li>
                </ul>
              </div>
              <div className="col-4 col-sm-4">
                <h6 className="fw-semibold mb-3">Contact</h6>
                <div className="small">
                  <p className="mb-2"><i className="fas fa-phone me-1"></i><span className="d-none d-sm-inline">+91 7016057005</span><span className="d-sm-none">Call</span></p>
                  <p className="mb-2"><i className="fas fa-envelope me-1"></i><span className="d-none d-sm-inline">abhiposhiya0104@emart.com</span><span className="d-sm-none">Email</span></p>
                  <p className="mb-2"><i className="fas fa-map-marker-alt me-1"></i><span className="d-none d-sm-inline">Tech Plaza, Ahmedabad</span><span className="d-sm-none">Location</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <p className="pt-3 text-center small pb-3 mb-0">
          Copyright {new Date().getFullYear()} © E-Mart. All Rights Reserved.
        </p>
      </div>
    </footer>
    </>
  );
};

export default Footer;