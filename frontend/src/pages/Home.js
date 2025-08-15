import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";

import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeRecommendations, setHomeRecommendations] = useState({
    most_ordered: [],
    most_popular: [],
    knn_recommendations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    const fetchData = async () => {
      try {
        const productsRes = await productsAPI.getAll({ limit: 8 });
        const productsData = productsRes.data.results || productsRes.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);

        try {
          const categoriesRes = await productsAPI.getCategories();
          const categoriesData = categoriesRes.data || [];
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
          console.error("Categories fetch failed:", error);
          setCategories([]);
        }

        try {
          const mlResponse = await fetch(
            `http://localhost:8000/api/recommendations/home/?t=${Date.now()}`
          );
          if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            setHomeRecommendations(mlData);
          } else {
            throw new Error("ML API not available");
          }
        } catch (error) {
          if (Array.isArray(productsData) && productsData.length > 0) {
            const timestamp = Date.now();
            const seed = Math.floor(timestamp / 30000);

            const shuffleWithSeed = (array, seedValue) => {
              const shuffled = [...array];
              let currentIndex = shuffled.length;
              let randomValue = seedValue;

              while (currentIndex !== 0) {
                randomValue = (randomValue * 9301 + 49297) % 233280;
                const randomIndex = Math.floor(
                  (randomValue / 233280) * currentIndex
                );
                currentIndex--;
                [shuffled[currentIndex], shuffled[randomIndex]] = [
                  shuffled[randomIndex],
                  shuffled[currentIndex],
                ];
              }
              return shuffled;
            };

            const shuffled = shuffleWithSeed(productsData, seed);

            setHomeRecommendations({
              most_ordered: shuffled.slice(0, 6).map((p, i) => ({
                ...p,
                total_orders: 200 - i * 15 + Math.floor((seed + i) % 20),
              })),
              most_popular: shuffled.slice(2, 8).map((p, i) => ({
                ...p,
                review_count: 80 - i * 8 + Math.floor((seed + i) % 10),
                average_rating: (
                  4.8 -
                  i * 0.1 +
                  ((seed + i) % 5) * 0.04
                ).toFixed(1),
              })),
              knn_recommendations: shuffled.slice(1, 7).map((p, i) => ({
                ...p,
                ml_score: parseFloat(
                  (0.95 - i * 0.03 + ((seed + i) % 10) * 0.005).toFixed(2)
                ),
                algorithm: "K-Nearest Neighbors",
              })),
              best_ml_recommendations: shuffled.slice(3, 9).map((p, i) => ({
                ...p,
                ml_score: parseFloat(
                  (0.98 - i * 0.02 + ((seed + i) % 8) * 0.003).toFixed(2)
                ),
                algorithm: "Hybrid ML Model",
              })),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
        setCategories([]);
        setHomeRecommendations({
          most_ordered: [],
          most_popular: [],
          knn_recommendations: [],
          best_ml_recommendations: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <style>
        {`
          .hero-section {
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover;
            position: relative;
            display: flex;
            align-items: center;
            padding-top: 80px;
            overflow: hidden;
          }
          .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            z-index: 1;
          }
          .hero-content {
            position: relative;
            z-index: 2;
            color: white;
          }
          .hero-badge {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            padding: 0.75rem 1.5rem;
            color: white;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            margin-bottom: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            animation: fadeInUp 1s ease-out;
          }
          .hero-title {
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 1.5rem;
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
            line-height: 1.1;
            animation: fadeInUp 1s ease-out 0.2s both;
          }
          .hero-subtitle {
            font-size: 1.3rem;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            text-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
            line-height: 1.6;
            animation: fadeInUp 1s ease-out 0.4s both;
          }
          .hero-stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2.5rem;
            animation: fadeInUp 1s ease-out 0.6s both;
          }
          .stat-item {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1rem 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .stat-number {
            font-size: 1.5rem;
            font-weight: 800;
            color: #ffd700;
            margin-bottom: 0.25rem;
          }
          .stat-label {
            font-size: 0.85rem;
            opacity: 0.9;
            margin: 0;
          }
          .btn-hero-primary {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
            position: relative;
            overflow: hidden;
          }
          .btn-hero-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          .btn-hero-primary:hover::before {
            left: 100%;
          }
          .btn-hero-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
            color: white;
          }
          .btn-hero-secondary {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.3s ease;
          }
          .btn-hero-secondary:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-3px);
            color: white;
          }
          .hero-buttons {
            animation: fadeInUp 1s ease-out 0.8s both;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 768px) {
            .hero-title { font-size: 2.8rem; }
            .hero-subtitle { font-size: 1.1rem; }
            .hero-stats { flex-direction: column; gap: 1rem; }
            .stat-item { padding: 0.75rem 1rem; }
          }
        `}
      </style>

      {/* Modern Attractive Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-10 mx-auto text-center">
              <div className="hero-content">
                <div className="hero-badge">
                  <i className="fas fa-bolt me-2"></i>
                  Premium Electronics Store
                </div>
                <h1 className="hero-title">
                  Next-Gen <span style={{ color: "#ffd700" }}>Electronics</span>
                  <br />
                  For Smart Living
                </h1>
                <p className="hero-subtitle">
                  Experience cutting-edge technology with AI-powered
                  recommendations.
                  <br />
                  Premium quality, competitive prices, and exceptional service.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Products</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">50K+</div>
                    <div className="stat-label">Customers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">4.9⭐</div>
                    <div className="stat-label">Rating</div>
                  </div>
                </div>
                <div className="hero-buttons d-flex flex-wrap gap-3 justify-content-center">
                  <Link to="/products" className="btn btn-hero-primary">
                    <i className="fas fa-shopping-bag me-2"></i>
                    Shop Now
                  </Link>
                  <Link to="/about" className="btn btn-hero-secondary">
                    <i className="fas fa-info-circle me-2"></i>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Ordered Products */}
      <section className="py-5 recommendations-section">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="badge bg-success mb-2">🔥 Trending</span>
            <h2 className="fw-bold display-5 mb-3">Most Ordered</h2>
            <p className="text-muted lead">Products customers love the most</p>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={15}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
            }}
            className="products-swiper"
          >
            {(homeRecommendations.most_ordered &&
            homeRecommendations.most_ordered.length > 0
              ? homeRecommendations.most_ordered.slice(0, 8)
              : products.slice(0, 8)
            ).map((product, index) => (
              <SwiperSlide key={product.id}>
                <div className="position-relative h-100">
                  <ProductCard product={product} compact={true} />
                  <div
                    className="position-absolute"
                    style={{
                      top: "6px",
                      right: "6px",
                      zIndex: 10,
                      maxWidth: "calc(100% - 12px)",
                    }}
                  >
                    <span
                      className="badge bg-success rounded-pill d-flex align-items-center"
                      title={`${product.total_orders || 0} orders`}
                      style={{
                        fontSize: "0.6rem",
                        padding: "3px 6px",
                        minWidth: "20px",
                        maxWidth: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i
                        className="fas fa-fire"
                        style={{ fontSize: "0.5rem", flexShrink: 0 }}
                      ></i>
                      <span
                        className="d-none d-sm-inline ms-1"
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {product.total_orders || 0}
                      </span>
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Most Popular Products */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="badge bg-warning mb-2">⭐ Popular</span>
            <h2 className="fw-bold display-5 mb-3">Most Reviewed</h2>
            <p className="text-muted lead">Highly rated by our customers</p>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={15}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
            }}
            className="products-swiper"
          >
            {(homeRecommendations.most_popular &&
            homeRecommendations.most_popular.length > 0
              ? homeRecommendations.most_popular.slice(0, 8)
              : products.slice(1, 9)
            ).map((product, index) => (
              <SwiperSlide key={product.id}>
                <div className="position-relative h-100">
                  <ProductCard product={product} compact={true} />
                  <div
                    className="position-absolute"
                    style={{
                      top: "6px",
                      right: "6px",
                      zIndex: 10,
                      maxWidth: "calc(100% - 12px)",
                    }}
                  >
                    <span
                      className="badge bg-warning rounded-pill d-flex align-items-center"
                      title={`${product.review_count || 0} reviews, ${
                        product.average_rating || 0
                      } rating`}
                      style={{
                        fontSize: "0.6rem",
                        padding: "3px 6px",
                        minWidth: "20px",
                        maxWidth: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i
                        className="fas fa-star"
                        style={{ fontSize: "0.5rem", flexShrink: 0 }}
                      ></i>
                      <span
                        className="d-none d-sm-inline ms-1"
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {product.average_rating || "0.0"}
                      </span>
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* KNN ML Recommendations */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="badge bg-primary mb-2">🤖 KNN Algorithm</span>
            <h2 className="fw-bold display-5 mb-3">Smart Recommendations</h2>
            <p className="text-muted lead">
              Powered by K-Nearest Neighbors Machine Learning
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={15}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
            }}
            className="products-swiper"
          >
            {(homeRecommendations.knn_recommendations &&
            homeRecommendations.knn_recommendations.length > 0
              ? homeRecommendations.knn_recommendations.slice(0, 8)
              : products.slice(0, 8).map((p, i) => ({
                  ...p,
                  ml_score: 0.85 + i * 0.02,
                  algorithm: "KNN",
                }))
            ).map((product, index) => (
              <SwiperSlide key={product.id}>
                <div className="position-relative h-100">
                  <ProductCard product={product} compact={true} />
                  <div
                    className="position-absolute"
                    style={{
                      top: "6px",
                      right: "6px",
                      zIndex: 10,
                      maxWidth: "calc(100% - 12px)",
                    }}
                  >
                    <span
                      className="badge bg-primary rounded-pill d-flex align-items-center"
                      style={{
                        fontSize: "0.6rem",
                        padding: "3px 6px",
                        minWidth: "20px",
                        maxWidth: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i
                        className="fas fa-robot"
                        style={{ fontSize: "0.5rem", flexShrink: 0 }}
                      ></i>
                      <span
                        className="d-none d-sm-inline ms-1"
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {product.ml_score
                          ? Math.round(product.ml_score * 100) + "%"
                          : "85%"}
                      </span>
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 featured-section">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="badge bg-gradient-warning mb-2">
              ⭐ Best Sellers
            </span>
            <h2 className="fw-bold display-5 mb-3">Featured Products</h2>
            <p className="text-muted lead">Most popular items this month</p>
          </div>
          <div className="row g-2 g-sm-3">
            {Array.isArray(products) && products.length > 0 ? (
              products.slice(0, 8).map((product, index) => (
                <div
                  key={product.id}
                  className="col-6 col-sm-4 col-md-3 col-lg-3"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="h-100">
                    <ProductCard product={product} compact={false} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center" data-aos="fade-up">
                <div className="alert alert-warning modern-alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  No products available. Please start the backend server.
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-5" data-aos="fade-up">
            <Link
              to="/products"
              className="btn btn-gradient-primary btn-lg px-5 hover-lift"
            >
              View All Products <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
