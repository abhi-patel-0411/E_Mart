import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div style={{paddingTop: '80px'}}>
      {/* Hero Section */}
      <section className="position-relative overflow-hidden">
        <div
          className="hero-bg"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(79, 57, 246, 0.9), rgba(103, 126, 234, 0.8)), url(https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&h=1080&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div className="container text-center text-white">
            <div data-aos="fade-up">
              <h1 className="display-1 fw-bold mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
                Electronics<span className="text-warning">Hub</span>
              </h1>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <p className="lead mb-5 fs-3">
                Powering Innovation Since 2020 with Premium Electronics
              </p>
            </div>
            <div data-aos="fade-up" data-aos-delay="400">
              <Link
                to="/products"
                className="btn btn-warning btn-lg px-5 py-3 rounded-pill shadow-lg"
                style={{fontSize: '1.2rem', fontWeight: '600'}}
              >
                Explore Our Products <i className="fas fa-bolt ms-2"></i>
              </Link>
            </div>
          </div>
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
            <div className="animate-bounce">
              <i className="fas fa-chevron-down fa-2x text-white opacity-75"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="display-4 fw-bold text-dark mb-3">Our Story</h2>
            <div className="mx-auto" style={{width: '80px', height: '4px', background: 'linear-gradient(90deg, #4f39f6, #ffc107)'}}></div>
            <p className="text-muted mt-3 fs-5">4 Years of Powering Digital Innovation</p>
          </div>
          <div className="row g-5 align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="card border-0 shadow-lg h-100 overflow-hidden">
                <div className="position-relative">
                  <img
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop"
                    className="card-img-top"
                    alt="Electronics Store"
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{background: 'linear-gradient(45deg, rgba(79, 57, 246, 0.1), rgba(255, 193, 7, 0.1))'}}></div>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle p-2 me-3">
                      <i className="fas fa-bullseye text-white"></i>
                    </div>
                    <h3 className="card-title mb-0 text-dark">Our Mission</h3>
                  </div>
                  <p className="text-muted fs-6 lh-lg">
                    To democratize technology by providing cutting-edge electronics at affordable prices. We believe everyone deserves access to the latest innovations that enhance their digital lifestyle.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="card border-0 shadow-lg h-100 overflow-hidden">
                <div className="position-relative">
                  <img
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop"
                    className="card-img-top"
                    alt="Tech Innovation"
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{background: 'linear-gradient(45deg, rgba(255, 193, 7, 0.1), rgba(79, 57, 246, 0.1))'}}></div>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning rounded-circle p-2 me-3">
                      <i className="fas fa-eye text-dark"></i>
                    </div>
                    <h3 className="card-title mb-0 text-dark">Our Vision</h3>
                  </div>
                  <p className="text-muted fs-6 lh-lg">
                    To be the leading electronics destination that bridges the gap between innovation and accessibility, creating a connected world where technology empowers every individual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="display-4 fw-bold text-dark mb-3">Why Choose ElectronicsHub</h2>
            <div className="mx-auto" style={{width: '80px', height: '4px', background: 'linear-gradient(90deg, #4f39f6, #ffc107)'}}></div>
            <p className="text-muted mt-3 fs-5">What makes us the preferred electronics destination</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-lg h-100 text-center overflow-hidden position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-2" style={{background: 'linear-gradient(90deg, #4f39f6, #ffc107)'}}></div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-microchip fa-2x text-primary"></i>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=250&fit=crop"
                    className="card-img-top rounded mb-3"
                    alt="Latest Technology"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <h4 className="card-title text-dark mb-3">Latest Technology</h4>
                  <p className="text-muted">
                    Cutting-edge electronics with the latest features and innovations to keep you ahead of the curve.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-lg h-100 text-center overflow-hidden position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-2" style={{background: 'linear-gradient(90deg, #ffc107, #4f39f6)'}}></div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-headset fa-2x text-warning"></i>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
                    className="card-img-top rounded mb-3"
                    alt="Expert Support"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <h4 className="card-title text-dark mb-3">Expert Support</h4>
                  <p className="text-muted">
                    24/7 technical support from certified professionals to help you make the right choice and solve any issues.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-lg h-100 text-center overflow-hidden position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-2" style={{background: 'linear-gradient(90deg, #28a745, #20c997)'}}></div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-shield-alt fa-2x text-success"></i>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop"
                    className="card-img-top rounded mb-3"
                    alt="Warranty & Quality"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <h4 className="card-title text-dark mb-3">Quality Assurance</h4>
                  <p className="text-muted">
                    Comprehensive warranty and quality guarantee on all products with hassle-free returns and exchanges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center text-white">
            <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4">
                <i className="fas fa-users fa-3x mb-3"></i>
                <h3 className="display-4 fw-bold mb-2">50K+</h3>
                <p className="fs-5">Happy Customers</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="200">
              <div className="p-4">
                <i className="fas fa-laptop fa-3x mb-3"></i>
                <h3 className="display-4 fw-bold mb-2">10K+</h3>
                <p className="fs-5">Products Sold</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4">
                <i className="fas fa-store fa-3x mb-3"></i>
                <h3 className="display-4 fw-bold mb-2">25+</h3>
                <p className="fs-5">Store Locations</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="400">
              <div className="p-4">
                <i className="fas fa-award fa-3x mb-3"></i>
                <h3 className="display-4 fw-bold mb-2">4+</h3>
                <p className="fs-5">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-light">
        <div className="container text-center" data-aos="fade-up">
          <h2 className="display-4 fw-bold text-dark mb-4">Ready to Upgrade Your Tech?</h2>
          <p className="lead text-muted mb-5">Discover our latest collection of premium electronics</p>
          <Link
            to="/products"
            className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg me-3"
            style={{fontSize: '1.2rem', fontWeight: '600'}}
          >
            Shop Now <i className="fas fa-shopping-cart ms-2"></i>
          </Link>
          <Link
            to="/contact"
            className="btn btn-outline-primary btn-lg px-5 py-3 rounded-pill"
            style={{fontSize: '1.2rem', fontWeight: '600'}}
          >
            Contact Us <i className="fas fa-phone ms-2"></i>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;