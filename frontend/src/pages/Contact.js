import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div id="contactCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="hero-slide" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=800&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '70vh',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div className="container text-center text-white">
                <h1 className="display-2 fw-bold mb-4" data-aos="fade-up">Contact Us</h1>
                <p className="lead mb-5" data-aos="fade-up" data-aos-delay="200">Get in touch with our electronics experts</p>
                <Link to="/products" className="btn btn-primary btn-lg px-5 py-3">
                  Browse Products <i className="fas fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-dark">Get In Touch</h2>
            <p className="text-muted">We'd love to hear from you</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="modern-product-card text-center h-100">
                <div className="mb-4 p-4" style={{background: 'var(--color-primary)', borderRadius: '50%', width: '80px', height: '80px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-microchip fa-2x text-white"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Visit Our Store</h4>
                  <p className="text-dark">Electronics Hub<br/>Tech Plaza, Ahmedabad 380015</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="modern-product-card text-center h-100">
                <div className="mb-4 p-4" style={{background: '#28a745', borderRadius: '50%', width: '80px', height: '80px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-mobile-alt fa-2x text-white"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Call Us</h4>
                  <p className="text-dark">+91 9558135029<br/>Mon-Sat: 9AM-8PM</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="modern-product-card text-center h-100">
                <div className="mb-4 p-4" style={{background: '#dc3545', borderRadius: '50%', width: '80px', height: '80px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-at fa-2x text-white"></i>
                </div>
                <div className="product-content">
                  <h4 className="product-title" style={{color: '#333'}}>Email Us</h4>
                  <p className="text-dark">info@electronicsmart.com<br/>support@electronicsmart.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Electronics Features */}
      <section className="py-5" style={{background: '#f8f9fa'}}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-dark">Why Choose Our Electronics?</h2>
            <p className="text-muted">Premium quality with latest technology</p>
          </div>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: 'var(--color-primary)', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-shield-alt text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Warranty</h6>
                <small className="text-muted">2 Year Coverage</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#28a745', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-shipping-fast text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Fast Delivery</h6>
                <small className="text-muted">Same Day</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#dc3545', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-tools text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Support</h6>
                <small className="text-muted">24/7 Service</small>
              </div>
            </div>
            <div className="col-md-3 col-sm-6" data-aos="zoom-in" data-aos-delay="400">
              <div className="text-center p-4">
                <div className="mb-3" style={{background: '#6f42c1', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="fas fa-medal text-white"></i>
                </div>
                <h6 className="fw-bold text-dark">Quality</h6>
                <small className="text-muted">Certified</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="text-center mb-5" data-aos="fade-up">
                <h2 className="fw-bold text-dark mb-3">Get In Touch</h2>
                <p className="text-muted fs-5">Ready to start your next project with us? Send us a message and we will get back to you as soon as possible!</p>
              </div>
              
              <div className="card border-0 shadow-lg" data-aos="fade-up" data-aos-delay="200" style={{borderRadius: '20px'}}>
                <div className="card-body p-4 p-md-5">
                  <form className="needs-validation" noValidate>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="text" className="form-control" id="firstName" placeholder="First Name" required style={{borderRadius: '12px', border: '2px solid #e9ecef'}} />
                          <label htmlFor="firstName" className="text-muted"><i className="fas fa-user me-2"></i>First Name</label>
                          <div className="invalid-feedback">Please provide your first name.</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="text" className="form-control" id="lastName" placeholder="Last Name" required style={{borderRadius: '12px', border: '2px solid #e9ecef'}} />
                          <label htmlFor="lastName" className="text-muted"><i className="fas fa-user me-2"></i>Last Name</label>
                          <div className="invalid-feedback">Please provide your last name.</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="email" className="form-control" id="email" placeholder="Email" required style={{borderRadius: '12px', border: '2px solid #e9ecef'}} />
                          <label htmlFor="email" className="text-muted"><i className="fas fa-envelope me-2"></i>Email Address</label>
                          <div className="invalid-feedback">Please provide a valid email.</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input type="tel" className="form-control" id="phone" placeholder="Phone" style={{borderRadius: '12px', border: '2px solid #e9ecef'}} />
                          <label htmlFor="phone" className="text-muted"><i className="fas fa-phone me-2"></i>Phone Number</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating">
                          <select className="form-select" id="subject" required style={{borderRadius: '12px', border: '2px solid #e9ecef'}}>
                            <option value="">Choose...</option>
                            <option value="general">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="sales">Sales Question</option>
                            <option value="partnership">Partnership</option>
                          </select>
                          <label htmlFor="subject" className="text-muted"><i className="fas fa-tag me-2"></i>Subject</label>
                          <div className="invalid-feedback">Please select a subject.</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating">
                          <textarea className="form-control" id="message" placeholder="Message" required style={{borderRadius: '12px', border: '2px solid #e9ecef', minHeight: '120px'}}></textarea>
                          <label htmlFor="message" className="text-muted"><i className="fas fa-comment me-2"></i>Your Message</label>
                          <div className="invalid-feedback">Please enter your message.</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check mb-4">
                          <input className="form-check-input" type="checkbox" id="privacy" required />
                          <label className="form-check-label text-muted" htmlFor="privacy">
                            I agree to the <a href="#" className="text-decoration-none">Privacy Policy</a> and <a href="#" className="text-decoration-none">Terms of Service</a>
                          </label>
                          <div className="invalid-feedback">You must agree before submitting.</div>
                        </div>
                      </div>
                      <div className="col-12 text-center">
                        <button type="submit" className="btn btn-lg px-5 py-3 shadow-lg" style={{background: 'var(--color-primary)', border: 'none', color: 'white', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', transition: 'all 0.3s ease'}} onMouseOver={(e) => {e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)'}} onMouseOut={(e) => {e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'}}>
                          <i className="fas fa-paper-plane me-2"></i>Send Message
                        </button>
                        <p className="text-muted mt-3 small">We'll respond within 24 hours</p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-5" style={{background: '#f8f9fa'}}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold text-dark">Find Us</h2>
            <p className="text-muted">Visit our electronics showroom for the best experience</p>
          </div>
          <div className="modern-product-card" data-aos="fade-up" data-aos-delay="200">
            <div className="product-image-container">
              <div style={{position: 'relative', overflow: 'hidden', borderRadius: '15px', height: '400px', background: '#f8f9fa'}}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5234567890123!2d72.5234567890123!3d23.0234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f5b5b5b5b5%3A0xc5f6c3b7b5b5b5b5!2sElectronics%20Hub%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{border: 0}}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

// Add responsive styles and form validation
const styles = `
@media (max-width: 768px) {
  .hero-slide {
    height: 50vh !important;
  }
  .display-2 {
    font-size: 2rem !important;
  }
  .card-body {
    padding: 2rem 1.5rem !important;
  }
}

@media (max-width: 576px) {
  .hero-slide {
    height: 40vh !important;
  }
  .display-2 {
    font-size: 1.75rem !important;
  }
  .lead {
    font-size: 1rem !important;
  }
  .card-body {
    padding: 1.5rem 1rem !important;
  }
  .btn-lg {
    padding: 0.75rem 2rem !important;
    font-size: 1rem !important;
  }
}

.form-control:focus, .form-select:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
}

.form-floating > label {
  color: #6c757d !important;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
`;

// Inject styles and form validation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Form validation
  setTimeout(() => {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, 1000);
}