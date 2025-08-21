import React, { useState, useEffect } from "react";

const AdminOfferFormModal = ({
  show = false,
  offer = null,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    offer_type: "discount",
    discount_percentage: 0,
    flat_discount: 0,
    buy_quantity: 1,
    get_quantity: 1,
    min_order_value: 0,
    priority: "medium",
    start_date: "",
    end_date: "",
    is_active: true,
    auto_apply: false,
    first_time_only: false,
    badge_text: "",
    product_ids: [],
    category_ids: [],
    free_product_id: "",
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleModalWheel = (e) => {
    e.stopPropagation();
  };

  const handleOverlayWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
      fetchProducts();
      fetchCategories();

      if (offer) {
        // Format dates properly for datetime-local input
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            // Adjust for timezone offset to show local time
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().slice(0, 16);
          } catch (error) {
            console.error('Date formatting error:', error);
            return '';
          }
        };
        
        setFormData({
          ...offer,
          start_date: formatDateForInput(offer.start_date),
          end_date: formatDateForInput(offer.end_date),
          product_ids: offer.products?.map((p) => p.id) || [],
          category_ids: offer.categories?.map((c) => c.id) || [],
          free_product_id: offer.free_product?.id || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
          offer_type: "discount",
          discount_percentage: 0,
          flat_discount: 0,
          buy_quantity: 1,
          get_quantity: 1,
          min_order_value: 0,
          priority: "medium",
          start_date: "",
          end_date: "",
          is_active: true,
          auto_apply: false,
          first_time_only: false,
          badge_text: "",
          product_ids: [],
          category_ids: [],
          free_product_id: "",
        });
      }
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show, offer]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/products/`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/categories/`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          setCategories([]);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      alert("Please fill in all required fields (Name and Code)");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      alert("Please select start and end dates");
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert("End date must be after start date");
      return;
    }

    if (
      formData.offer_type === "category_offer" &&
      (!formData.category_ids || formData.category_ids.length === 0)
    ) {
      alert("Please select at least one category for category-based offers");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const url = offer
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/update/${offer.id}/`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/create/`;

      const method = offer ? "PUT" : "POST";

      const submitData = {
        ...formData,
        free_product_id: formData.free_product_id || null,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        flat_discount: parseFloat(formData.flat_discount) || 0,
        min_order_value: parseFloat(formData.min_order_value) || 0,
        buy_quantity: parseInt(formData.buy_quantity) || 1,
        get_quantity: parseInt(formData.get_quantity) || 1,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (response.ok) {
        onSave(responseData);
      } else {
        let errorMessage = "Failed to save offer. Please check the form data.";
        if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (typeof responseData === "object") {
          const errors = [];
          Object.keys(responseData).forEach((key) => {
            if (Array.isArray(responseData[key])) {
              errors.push(`${key}: ${responseData[key].join(", ")}`);
            } else {
              errors.push(`${key}: ${responseData[key]}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join("\n");
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("Failed to save offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (type === "number") {
      let numValue = parseFloat(value);
      switch (name) {
        case "discount_percentage":
          numValue = Math.min(100, Math.max(0, numValue));
          break;
        case "flat_discount":
        case "min_order_value":
          numValue = Math.max(0, numValue);
          break;
        case "buy_quantity":
        case "get_quantity":
          numValue = Math.max(1, numValue);
          break;
        default:
          numValue = Math.max(0, numValue);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (name, value) => {
    const currentValues = formData[name] || [];
    const newValues = currentValues.includes(parseInt(value))
      ? currentValues.filter((id) => id !== parseInt(value))
      : [...currentValues, parseInt(value)];

    setFormData((prev) => ({
      ...prev,
      [name]: newValues,
    }));
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }
        body.modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        .modal-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          max-width: 1000px;
          width: 95%;
          height: 90vh !important;
          max-height: 90vh !important;
          animation: modalSlideIn 0.3s ease-out;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        }
        @media (max-width: 768px) {
          .modal-container {
            width: 98%;
            max-height: 95vh;
            border-radius: 15px;
          }
          .modal-header-gradient {
            padding: 1rem !important;
          }
          .modal-body-scroll {
            padding: 1rem !important;
          }
          .section-body {
            padding: 1rem !important;
          }
        }
        @media (max-width: 576px) {
          .modal-container {
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .modal-overlay {
            padding: 0;
          }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-header-gradient {
          background: #ffffff;
          color: #1f2937;
          padding: 1.5rem 2rem;
          border-radius: 12px 12px 0 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .form-section {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 15px;
          margin-bottom: 1.5rem;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .section-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1rem 1.5rem;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          font-size: 1rem;
        }
        .section-body {
          padding: 1.5rem;
          background: white;
        }
        .form-control, .form-select {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .form-control:focus, .form-select:focus {
          border-color: var(--color-primary, #667eea);
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          outline: none;
        }
        .product-item, .category-item {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.75rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .product-item:hover, .category-item:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }
        .product-item.selected, .category-item.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .btn-primary-gradient {
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
          color: white;
        }
        .btn-primary-gradient:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .switch-container {
          background: #f9fafb;
          border-radius: 6px;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .form-check-input:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        .modal-body-scroll {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          max-height: calc(90vh - 200px) !important;
          padding: 1.5rem 2rem !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: thin !important;
          overscroll-behavior: contain !important;
        }
        .product-scroll, .category-scroll {
          -webkit-overflow-scrolling: touch !important;
          overflow-y: auto !important;
          max-height: 250px !important;
        }
        .modal-body-scroll::-webkit-scrollbar {
          width: 6px !important;
        }
        .modal-body-scroll::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
          border-radius: 3px !important;
        }
        .modal-body-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1 !important;
          border-radius: 3px !important;
        }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8 !important;
        }
      `}</style>

      <div className="modal-overlay" onWheel={handleOverlayWheel}>
        <div className="modal-container" onWheel={handleModalWheel}>
          {/* Header */}
          <div
            className="modal-header-gradient"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=400&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4 className="fw-bold mb-2 text-white">
                  <i className="fas fa-tag me-2"></i>
                  {offer ? "Edit Offer" : "Create New Offer"}
                </h4>
                <p className="mb-0 text-white opacity-90">
                  {offer
                    ? "Update your promotional offer details"
                    : "Design an amazing offer for your customers"}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                style={{ filter: "invert(1)", opacity: 0.8 }}
              ></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body-scroll">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  Basic Information
                </div>
                <div className="section-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        Offer Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Enter a catchy offer name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        Offer Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        className="form-control text-uppercase"
                        placeholder="e.g., SAVE20, WELCOME50"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Describe what makes this offer special..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Configuration */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-cogs me-2 text-success"></i>
                  Offer Configuration
                </div>
                <div className="section-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        Offer Type <span className="text-danger">*</span>
                      </label>
                      <select
                        name="offer_type"
                        value={formData.offer_type}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="discount">📊 Percentage Discount</option>
                        <option value="flat">💰 Flat Amount Off</option>
                        <option value="category_offer">
                          🏷️ Category Specific
                        </option>
                        <option value="first_time">
                          ⭐ First Purchase Special
                        </option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        name="badge_text"
                        value={formData.badge_text}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., 20% OFF, MEGA SALE"
                      />
                    </div>
                  </div>

                  <div className="row g-4 mt-2">
                    {(formData.offer_type === "discount" ||
                      formData.offer_type === "category_offer" ||
                      formData.offer_type === "first_time") && (
                      <div className="col-md-4">
                        <label className="form-label fw-semibold mb-2 text-success">
                          <i className="fas fa-percentage me-1"></i>
                          Discount Percentage
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            name="discount_percentage"
                            value={formData.discount_percentage}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="form-control"
                            placeholder="0"
                          />
                          <span className="input-group-text bg-success text-white">
                            %
                          </span>
                        </div>
                      </div>
                    )}

                    {formData.offer_type === "flat" && (
                      <div className="col-md-4">
                        <label className="form-label fw-semibold mb-2 text-success">
                          <i className="fas fa-rupee-sign me-1"></i>
                          Discount Amount
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-success text-white">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="flat_discount"
                            value={formData.flat_discount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="form-control"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold mb-2 text-info">
                        <i className="fas fa-shopping-cart me-1"></i>
                        Minimum Order Value
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-info text-white">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="min_order_value"
                          value={formData.min_order_value}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>


                  </div>
                </div>
              </div>

              {/* Product Selection */}
              {(formData.offer_type === "discount" ||
                formData.offer_type === "flat") && (
                <div className="form-section">
                  <div className="section-header">
                    <i className="fas fa-box me-2 text-primary"></i>
                    Product Selection
                    <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                      Optional
                    </span>
                  </div>
                  <div className="section-body">
                    <p className="text-muted mb-3">
                      <i className="fas fa-lightbulb me-1"></i>
                      Leave empty to apply to all products, or select specific
                      products below
                    </p>
                    <div
                      className="border rounded-3 p-3 bg-light product-scroll"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      <div className="row g-3">
                        {Array.isArray(products) &&
                          products.map((product) => (
                            <div key={product.id} className="col-md-6">
                              <div
                                className={`product-item ${
                                  formData.product_ids.includes(product.id)
                                    ? "selected"
                                    : ""
                                }`}
                              >
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`product-${product.id}`}
                                    checked={formData.product_ids.includes(
                                      product.id
                                    )}
                                    onChange={() =>
                                      handleMultiSelect(
                                        "product_ids",
                                        product.id
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label fw-medium"
                                    htmlFor={`product-${product.id}`}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="text-truncate me-2">
                                        {product.name}
                                      </span>
                                      <span className="badge bg-success fs-6">
                                        ₹{product.price}
                                      </span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Selection */}
              {formData.offer_type === "category_offer" && (
                <div className="form-section">
                  <div className="section-header">
                    <i className="fas fa-tags me-2 text-success"></i>
                    Category Selection
                    <span className="badge bg-danger bg-opacity-20 text-danger ms-2">
                      Required
                    </span>
                  </div>
                  <div className="section-body">
                    {categories && categories.length > 0 ? (
                      <>
                        {formData.category_ids.length === 0 && (
                          <div className="alert alert-warning border-0 rounded-3 py-2 mb-3">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <small>
                              Please select at least one category for this offer
                              type
                            </small>
                          </div>
                        )}
                        <div
                          className="border rounded-3 p-3 bg-light category-scroll"
                          style={{ maxHeight: "250px", overflowY: "auto" }}
                        >
                          <div className="row g-3">
                            {categories.map((category) => (
                              <div key={category.id} className="col-md-4">
                                <div
                                  className={`category-item ${
                                    formData.category_ids.includes(category.id)
                                      ? "selected"
                                      : ""
                                  }`}
                                >
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`category-${category.id}`}
                                      checked={formData.category_ids.includes(
                                        category.id
                                      )}
                                      onChange={() =>
                                        handleMultiSelect(
                                          "category_ids",
                                          category.id
                                        )
                                      }
                                    />
                                    <label
                                      className="form-check-label fw-medium"
                                      htmlFor={`category-${category.id}`}
                                    >
                                      <i className="fas fa-tag me-2 text-muted"></i>
                                      {category.name}
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-folder-open text-muted fs-1 mb-3"></i>
                        <p className="text-muted mb-0">
                          No categories available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule & Settings */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-calendar me-2 text-info"></i>
                  Schedule & Settings
                </div>
                <div className="section-body">
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        <i className="fas fa-play me-1 text-success"></i>
                        Start Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-2">
                        <i className="fas fa-stop me-1 text-danger"></i>
                        End Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="switch-container">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="form-check-input"
                            id="is_active"
                          />
                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="is_active"
                          >
                            <i className="fas fa-power-off me-2 text-success"></i>
                            Active Offer
                          </label>
                        </div>
                        <small className="text-muted">
                          Enable this offer for customers
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="switch-container">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            name="auto_apply"
                            checked={formData.auto_apply}
                            onChange={handleChange}
                            className="form-check-input"
                            id="auto_apply"
                          />
                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="auto_apply"
                          >
                            <i className="fas fa-magic me-2 text-primary"></i>
                            Auto Apply
                          </label>
                        </div>
                        <small className="text-muted">
                          Apply automatically when eligible
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="switch-container">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            name="first_time_only"
                            checked={formData.first_time_only}
                            onChange={handleChange}
                            className="form-check-input"
                            id="first_time_only"
                          />
                          <label
                            className="form-check-label fw-semibold"
                            htmlFor="first_time_only"
                          >
                            <i className="fas fa-star me-2 text-warning"></i>
                            First Time Only
                          </label>
                        </div>
                        <small className="text-muted">
                          Only for new customers
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer Buttons */}
              <div className="border-top bg-light p-3 mt-4">
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline-secondary px-4 py-2"
                    style={{ borderRadius: "50px" }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-lg px-5 py-3 shadow-lg"
                    style={{
                      background: "var(--color-primary, #667eea)",
                      border: "none",
                      color: "white",
                      borderRadius: "50px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-3px)";
                      e.target.style.boxShadow =
                        "0 10px 30px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {offer ? "Update Offer" : "Create Offer"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOfferFormModal;
