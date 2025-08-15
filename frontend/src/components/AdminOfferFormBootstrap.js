import React, { useState, useEffect } from 'react';

const AdminOfferFormBootstrap = ({ offer = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    offer_type: 'discount',
    discount_percentage: 0,
    flat_discount: 0,
    buy_quantity: 1,
    get_quantity: 1,

    min_order_value: 0,
    max_discount: '',
    priority: 'medium',
    badge_text: '',
    start_date: '',
    end_date: '',
    is_active: true,
    auto_apply: false,
    first_time_only: false,
    product_ids: [],
    category_ids: [],

    free_product_id: ''
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    if (offer) {
      setFormData({
        ...offer,
        start_date: offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : '',
        end_date: offer.end_date ? new Date(offer.end_date).toISOString().slice(0, 16) : '',
        product_ids: offer.products?.map(p => p.id) || [],
        category_ids: offer.categories?.map(c => c.id) || [],

        free_product_id: offer.free_product?.id || ''
      });
    }
  }, [offer]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/products/`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/categories/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched:', data);
        // Ensure we're handling the response correctly
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          console.error('Unexpected categories data format:', data);
          setCategories([]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate category selection for category offers
    if (formData.offer_type === 'category_offer' && (!formData.category_ids || formData.category_ids.length === 0)) {
      alert('Please select at least one category for category-based offers');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const url = offer 
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/update/${offer.id}/`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/admin/offers/create/`;
      
      const method = offer ? 'PUT' : 'POST';

      // Clean up form data
      const submitData = {
        ...formData,
        max_discount: formData.max_discount || null,
        free_product_id: formData.free_product_id || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save offer');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (name, value) => {
    const currentValues = formData[name] || [];
    const newValues = currentValues.includes(parseInt(value))
      ? currentValues.filter(id => id !== parseInt(value))
      : [...currentValues, parseInt(value)];
    
    setFormData(prev => ({
      ...prev,
      [name]: newValues
    }));
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="bg-white bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <i className="fas fa-tags text-white fs-1"></i>
              </div>
              <h2 className="text-white fw-bold mb-2">{offer ? 'Edit Offer' : 'Create New Offer'}</h2>
              <p className="text-white-50">Configure promotional offers to boost your sales</p>
            </div>
            
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                    <i className={`fas ${offer ? 'fa-edit' : 'fa-plus'} text-primary fs-5`}></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">{offer ? 'Edit Offer Details' : 'Create New Offer'}</h5>
                    <p className="text-muted mb-0 small">Fill in the details below to {offer ? 'update' : 'create'} your offer</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-info-circle text-primary"></i>
                      </div>
                      <h6 className="mb-0 fw-bold text-primary">Basic Information</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Offer Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control form-control-lg rounded-3 border-0 bg-light"
                          placeholder="Enter offer name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Offer Code <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          className="form-control form-control-lg rounded-3 border-0 bg-light text-uppercase"
                          placeholder="e.g., SAVE20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control rounded-3 border-0 bg-light"
                      rows="3"
                      placeholder="Describe your offer to customers"
                    />
                  </div>

                  {/* Offer Configuration Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-cog text-success"></i>
                      </div>
                      <h6 className="mb-0 fw-bold text-success">Offer Configuration</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Offer Type <span className="text-danger">*</span></label>
                        <select
                          name="offer_type"
                          value={formData.offer_type}
                          onChange={handleChange}
                          className="form-select form-select-lg rounded-3 border-0 bg-light"
                        >
                          <option value="discount">📊 Percentage Discount</option>
                          <option value="flat">💰 Flat ₹ Off</option>
                          <option value="category_offer">🏷️ Category Offer</option>
                          <option value="first_time">⭐ First Purchase Offer</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Badge Text</label>
                        <input
                          type="text"
                          name="badge_text"
                          value={formData.badge_text}
                          onChange={handleChange}
                          className="form-control form-control-lg rounded-3 border-0 bg-light"
                          placeholder="e.g., 20% OFF, SAVE BIG"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Value Section */}
                  <div className="mb-5">
                    {(formData.offer_type === 'discount' || formData.offer_type === 'category_offer' || formData.offer_type === 'first_time') && (
                      <div className="bg-primary bg-opacity-5 rounded-3 p-4">
                        <label className="form-label fw-semibold text-primary">Discount Percentage (%)</label>
                        <div className="input-group input-group-lg">
                          <input
                            type="number"
                            name="discount_percentage"
                            value={formData.discount_percentage}
                            onChange={handleChange}
                            className="form-control rounded-start-3 border-0 bg-white"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0"
                          />
                          <span className="input-group-text bg-primary text-white border-0 rounded-end-3">
                            <i className="fas fa-percent"></i>
                          </span>
                        </div>
                      </div>
                    )}

                    {formData.offer_type === 'flat' && (
                      <div className="bg-success bg-opacity-5 rounded-3 p-4">
                        <label className="form-label fw-semibold text-success">Flat Discount Amount</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-success text-white border-0 rounded-start-3">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="flat_discount"
                            value={formData.flat_discount}
                            onChange={handleChange}
                            className="form-control rounded-end-3 border-0 bg-white"
                            min="0"
                            step="0.01"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.offer_type === 'buy_x_get_y' && (
                    <div className="mb-5">
                      <div className="bg-warning bg-opacity-5 rounded-3 p-4">
                        <div className="row g-4">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-warning">Buy Quantity</label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-warning text-white border-0 rounded-start-3">
                                <i className="fas fa-shopping-cart"></i>
                              </span>
                              <input
                                type="number"
                                name="buy_quantity"
                                value={formData.buy_quantity}
                                onChange={handleChange}
                                className="form-control rounded-end-3 border-0 bg-white"
                                min="1"
                                placeholder="1"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-warning">Get Quantity (Free)</label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-success text-white border-0 rounded-start-3">
                                <i className="fas fa-gift"></i>
                              </span>
                              <input
                                type="number"
                                name="get_quantity"
                                value={formData.get_quantity}
                                onChange={handleChange}
                                className="form-control rounded-end-3 border-0 bg-white"
                                min="1"
                                placeholder="1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-3">
                          <small className="text-muted">
                            <i className="fas fa-lightbulb me-1 text-warning"></i>
                            <strong>Example:</strong> Buy {formData.buy_quantity || 1}, Get {formData.get_quantity || 1} Free
                          </small>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Constraints Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-warning bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-shield-alt text-warning"></i>
                      </div>
                      <h6 className="mb-0 fw-bold text-warning">Offer Constraints</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Min Order Value</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">₹</span>
                          <input
                            type="number"
                            name="min_order_value"
                            value={formData.min_order_value}
                            onChange={handleChange}
                            className="form-control border-0 bg-light"
                            min="0"
                            step="0.01"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Max Discount</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">₹</span>
                          <input
                            type="number"
                            name="max_discount"
                            value={formData.max_discount}
                            onChange={handleChange}
                            className="form-control border-0 bg-light"
                            min="0"
                            step="0.01"
                            placeholder="No limit"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Product Selection */}
                  {(formData.offer_type === 'discount' || formData.offer_type === 'flat') && (
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-primary bg-opacity-10 rounded-2 p-2 me-3">
                          <i className="fas fa-box text-primary"></i>
                        </div>
                        <h6 className="mb-0 fw-bold text-primary">Product Selection</h6>
                        <span className="badge bg-primary bg-opacity-10 text-primary ms-2">Optional</span>
                      </div>
                      
                      <div className="bg-light rounded-3 p-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <p className="text-muted small mb-3">
                          <i className="fas fa-info-circle me-1"></i>
                          Leave empty to apply to all products, or select specific products
                        </p>
                        <div className="row g-2">
                          {products.map(product => (
                            <div key={product.id} className="col-md-6">
                              <div className={`border rounded-3 p-3 ${
                                formData.product_ids.includes(product.id) 
                                  ? 'border-primary bg-primary bg-opacity-10' 
                                  : 'border-light bg-white'
                              }`}>
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`product-${product.id}`}
                                    checked={formData.product_ids.includes(product.id)}
                                    onChange={() => handleMultiSelect('product_ids', product.id)}
                                  />
                                  <label className="form-check-label fw-medium" htmlFor={`product-${product.id}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="text-truncate me-2">{product.name}</span>
                                      <span className="badge bg-success bg-opacity-20 text-success">₹{product.price}</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  {formData.offer_type === 'category_offer' && (
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-success bg-opacity-10 rounded-2 p-2 me-3">
                          <i className="fas fa-folder text-success"></i>
                        </div>
                        <h6 className="mb-0 fw-bold text-success">Category Selection</h6>
                        <span className="badge bg-danger bg-opacity-20 text-danger ms-2">Required</span>
                      </div>
                      
                      <div className="bg-light rounded-3 p-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {categories && categories.length > 0 ? (
                          <>
                            {formData.category_ids.length === 0 && (
                              <div className="alert alert-warning border-0 rounded-3 py-2 mb-3" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                <small>Please select at least one category for this offer type</small>
                              </div>
                            )}
                            <div className="row g-2">
                              {categories.map(category => (
                                <div key={category.id} className="col-md-4">
                                  <div className={`border rounded-3 p-3 ${
                                    formData.category_ids.includes(category.id) 
                                      ? 'border-success bg-success bg-opacity-10' 
                                      : 'border-light bg-white'
                                  }`}>
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`category-${category.id}`}
                                        checked={formData.category_ids.includes(category.id)}
                                        onChange={() => handleMultiSelect('category_ids', category.id)}
                                      />
                                      <label className="form-check-label fw-medium" htmlFor={`category-${category.id}`}>
                                        <i className="fas fa-tag me-2 text-muted"></i>
                                        {category.name}
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-folder-open text-muted fs-1 mb-3"></i>
                            <p className="text-muted mb-0">No categories available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Free Product for Buy X Get Y */}
                  {formData.offer_type === 'buy_x_get_y' && (
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-info bg-opacity-10 rounded-2 p-2 me-3">
                          <i className="fas fa-gift text-info"></i>
                        </div>
                        <h6 className="mb-0 fw-bold text-info">Free Product Selection</h6>
                        <span className="badge bg-info bg-opacity-10 text-info ms-2">Optional</span>
                      </div>
                      
                      <div className="bg-light rounded-3 p-4">
                        <label className="form-label fw-semibold">Free Product</label>
                        <select
                          name="free_product_id"
                          value={formData.free_product_id}
                          onChange={handleChange}
                          className="form-select form-select-lg rounded-3 border-0 bg-white"
                        >
                          <option value="">🎁 Same Product (Default)</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ₹{product.price}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted mt-2 d-block">
                          <i className="fas fa-info-circle me-1"></i>
                          Leave as "Same Product" to give the same item for free, or select a different product
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Date Range Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-info bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-calendar text-info"></i>
                      </div>
                      <h6 className="mb-0 fw-bold text-info">Validity Period</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Start Date <span className="text-danger">*</span></label>
                        <input
                          type="datetime-local"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className="form-control form-control-lg rounded-3 border-0 bg-light"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">End Date <span className="text-danger">*</span></label>
                        <input
                          type="datetime-local"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="form-control form-control-lg rounded-3 border-0 bg-light"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-secondary bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-sliders-h text-secondary"></i>
                      </div>
                      <h6 className="mb-0 fw-bold text-secondary">Offer Settings</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              name="is_active"
                              checked={formData.is_active}
                              onChange={handleChange}
                              className="form-check-input"
                              id="is_active"
                            />
                            <label className="form-check-label fw-semibold" htmlFor="is_active">
                              <i className="fas fa-power-off me-2 text-success"></i>Active
                            </label>
                          </div>
                          <small className="text-muted">Enable this offer for customers</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              name="auto_apply"
                              checked={formData.auto_apply}
                              onChange={handleChange}
                              className="form-check-input"
                              id="auto_apply"
                            />
                            <label className="form-check-label fw-semibold" htmlFor="auto_apply">
                              <i className="fas fa-magic me-2 text-primary"></i>Auto Apply
                            </label>
                          </div>
                          <small className="text-muted">Apply automatically when eligible</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              name="first_time_only"
                              checked={formData.first_time_only}
                              onChange={handleChange}
                              className="form-check-input"
                              id="first_time_only"
                            />
                            <label className="form-check-label fw-semibold" htmlFor="first_time_only">
                              <i className="fas fa-star me-2 text-warning"></i>First Time Only
                            </label>
                          </div>
                          <small className="text-muted">Only for new customers</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 pt-4 border-top">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-lg flex-fill rounded-3 shadow-sm"
                      style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', border: 'none'}}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          <span className="text-white">Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className={`fas ${offer ? 'fa-save' : 'fa-plus'} me-2 text-white`}></i>
                          <span className="text-white fw-semibold">{offer ? 'Update Offer' : 'Create Offer'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onCancel}
                      className="btn btn-outline-secondary btn-lg flex-fill rounded-3"
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          border-color: #667eea;
        }
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }
        .btn:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminOfferFormBootstrap;