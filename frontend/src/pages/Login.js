import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        return value.length < 3
          ? "Email or username must be at least 3 characters"
          : "";
      case "password":
        return value.length < 6 ? "Password must be at least 6 characters" : "";
      default:
        return "";
    }
  };
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await login(formData);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <Link
        to="/"
        className="position-absolute"
        style={{
          top: "20px",
          left: "20px",
          zIndex: 1000,
          color: "#fff",
          fontSize: "1.5rem",
          textDecoration: "none",
        }}
      >
        <i className="fas fa-arrow-left"></i>
      </Link>
      <div
        className="d-none d-lg-block"
        style={{ flex: "1", maxWidth: "50%", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=1200&fit=crop&crop=center")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.3,
            }}
          />
          <div
            className="text-center text-white"
            style={{ zIndex: 1, padding: "2rem" }}
          >
            <h1 className="display-4 fw-bold mb-3">Welcome Back!</h1>
            <p className="lead">
              Sign in to access your personalized shopping experience
            </p>
            <div className="d-flex justify-content-center gap-4 mt-4">
              <i className="fas fa-shopping-bag fa-2x"></i>
              <i className="fas fa-heart fa-2x"></i>
              <i className="fas fa-star fa-2x"></i>
            </div>
          </div>
        </div>
      </div>

      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          flex: "1",
          minHeight: "100vh",
          padding:
            windowWidth < 576 ? "1rem" : windowWidth < 768 ? "2rem" : "3rem",
        }}
      >
        <form
          className="w-100"
          style={{
            maxWidth: "400px",
            width: "100%",
            padding: windowWidth < 576 ? "0" : "0 1rem",
          }}
          onSubmit={handleSubmit}
        >
          <h2
            className="text-dark fw-medium text-center"
            style={{
              fontSize: windowWidth < 576 ? "1.75rem" : "2.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Sign in
          </h2>
          <p
            className="text-muted text-center mt-2"
            style={{
              fontSize: windowWidth < 576 ? "0.875rem" : "0.9rem",
            }}
          >
            Welcome back! Please sign in to continue
          </p>

          <div
            className="d-flex align-items-center w-100"
            style={{
              gap: windowWidth < 576 ? "0.75rem" : "1rem",
              margin: windowWidth < 576 ? "1.5rem 0" : "2rem 0",
            }}
          >
            <div
              className="flex-fill"
              style={{
                height: "1px",
                backgroundColor: "rgba(209, 213, 219, 0.9)",
              }}
            ></div>
            <p
              className="text-nowrap text-muted mb-0"
              style={{
                fontSize: windowWidth < 576 ? "0.8rem" : "0.875rem",
              }}
            >
              sign in with email or username
            </p>
            <div
              className="flex-fill"
              style={{
                height: "1px",
                backgroundColor: "rgba(209, 213, 219, 0.9)",
              }}
            ></div>
          </div>

          <div className="position-relative mb-3">
            <div
              className="d-flex align-items-center border rounded-pill"
              style={{
                height: windowWidth < 576 ? "44px" : "48px",
                borderColor: "rgba(209, 213, 219, 0.6)",
                padding: windowWidth < 576 ? "0 0.75rem" : "0 1rem",
              }}
            >
              <svg
                width="16"
                height="11"
                viewBox="0 0 16 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-2"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                  fill="#6B7280"
                />
              </svg>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Email or Username"
                className="form-control border-0 bg-transparent text-muted"
                style={{
                  outline: "none",
                  boxShadow: "none",
                  color: "rgba(107, 114, 128, 0.8)",
                  fontSize: windowWidth < 576 ? "0.875rem" : "0.9rem",
                }}
                required
              />
            </div>
            {errors.username && (
              <div className="text-danger small mt-1">{errors.username}</div>
            )}
          </div>

          <div className="position-relative mb-3">
            <div
              className="d-flex align-items-center border rounded-pill"
              style={{
                height: windowWidth < 576 ? "44px" : "48px",
                borderColor: "rgba(209, 213, 219, 0.6)",
                padding: windowWidth < 576 ? "0 0.75rem" : "0 1rem",
              }}
            >
              <svg
                width="13"
                height="17"
                viewBox="0 0 13 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-2"
              >
                <path
                  d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                  fill="#6B7280"
                />
              </svg>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="form-control border-0 bg-transparent text-muted"
                style={{
                  outline: "none",
                  boxShadow: "none",
                  color: "rgba(107, 114, 128, 0.8)",
                  fontSize: windowWidth < 576 ? "0.875rem" : "0.9rem",
                }}
                required
              />
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">{errors.password}</div>
            )}
          </div>

          <div
            className="d-flex align-items-center justify-content-between text-muted"
            style={{
              marginTop: windowWidth < 576 ? "1rem" : "1.5rem",
              flexDirection: windowWidth < 400 ? "column" : "row",
              gap: windowWidth < 400 ? "0.75rem" : "0",
            }}
          ></div>

          <button
            type="submit"
            className="btn w-100 text-white"
            style={{
              height: windowWidth < 576 ? "44px" : "48px",
              borderRadius: "25px",
              backgroundColor: "#6366f1",
              border: "none",
              transition: "opacity 0.3s",
              marginTop: windowWidth < 576 ? "1.5rem" : "2rem",
              fontSize: windowWidth < 576 ? "0.875rem" : "1rem",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <p
            className="text-muted text-center"
            style={{
              marginTop: windowWidth < 576 ? "1rem" : "1.5rem",
              fontSize: windowWidth < 576 ? "0.8rem" : "0.875rem",
            }}
          >
            Don't have an account?
            <Link
              to="/register"
              className="text-decoration-none"
              style={{ color: "#a78bfa" }}
            >
              {" "}
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
