import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

const AddProduct = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([null, null, null, null]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    actual_price: '',
    brand: '',
    warranty_months: '',
    stock: '',
    available: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!user?.is_staff) {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    console.log('Categories loaded:', categories);
  }, [categories]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await fetch('http://localhost:8000/api/categories/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      console.log('Categories response:', data);
      // Handle paginated response
      const categoryList = data.results || data || [];
      setCategories(categoryList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
        console.log('Creating category:', { name: newCategory.trim(), slug });
        
        // Direct API call
        const response = await fetch('http://localhost:8000/api/categories/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ name: newCategory.trim(), slug })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Category created:', data);
          await fetchCategories(); // Refresh categories
          setNewCategory('');
          setShowCategoryModal(false);
          toast.success('Category added successfully!');
        } else {
          const error = await response.json();
          toast.error('Failed to add category: ' + (error.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error creating category:', error);
        toast.error('Failed to add category: ' + error.message);
      }
    } else {
      toast.error('Please enter a category name');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting product:', formData);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        actual_price: parseFloat(formData.actual_price) || 0,
        brand: formData.brand,
        warranty_months: parseInt(formData.warranty_months) || 12,
        stock: parseInt(formData.stock) || 0,
        available: formData.available,
        image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop'
      };

      console.log('Product data to send:', productData);
      const response = await adminAPI.createProduct(productData);
      console.log('Product created:', response.data);
      
      toast.success('Product added successfully!');
      
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        actual_price: '',
        brand: '',
        warranty_months: '',
        stock: '',
        available: true
      });
      setImages([null, null, null, null]);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Please Login</h4>
          <p>You need to login to access this page.</p>
        </div>
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                  <p className="fw-medium mb-3">Product Image</p>
                  <div className="d-flex flex-wrap gap-3">
                    {Array(4).fill('').map((_, index) => (
                      <label key={index} htmlFor={`image${index}`} style={{cursor: 'pointer'}}>
                        <input 
                          accept="image/*" 
                          type="file" 
                          id={`image${index}`} 
                          className="d-none"
                          onChange={(e) => handleImageChange(index, e)}
                        />
                        {images[index] ? (
                          <img 
                            src={URL.createObjectURL(images[index])} 
                            alt="Product" 
                            className="border rounded"
                            style={{width: '100px', height: '100px', objectFit: 'cover'}}
                          />
                        ) : (
                          <img 
                            className="border rounded" 
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png" 
                            alt="uploadArea" 
                            style={{width: '100px', height: '100px'}}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="product-name">Product Name</label>
                  <input 
                    id="product-name" 
                    name="name"
                    type="text" 
                    placeholder="Type here" 
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="product-description">Product Description</label>
                  <textarea 
                    id="product-description" 
                    name="description"
                    rows={4} 
                    className="form-control"
                    placeholder="Type here"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={{resize: 'none'}}
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-medium mb-0" htmlFor="category">Category</label>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowCategoryModal(true)}
                    >
                      <i className="fas fa-plus me-1"></i>Add Category
                    </button>
                  </div>
                  <select 
                    id="category" 
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="tablets">Tablets</option>
                    <option value="headphones">Headphones</option>
                    <option value="gaming">Gaming</option>
                    <option value="cameras">Cameras</option>
                    <option value="home-appliances">Home Appliances</option>
                    <option value="accessories">Accessories</option>
                    <option value="watches">Watches</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label fw-medium" htmlFor="product-price">Product Price</label>
                    <input 
                      id="product-price" 
                      name="actual_price"
                      type="number" 
                      placeholder="0" 
                      className="form-control"
                      value={formData.actual_price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required 
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium" htmlFor="offer-price">Offer Price</label>
                    <input 
                      id="offer-price" 
                      name="price"
                      type="number" 
                      placeholder="0" 
                      className="form-control"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required 
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label fw-medium" htmlFor="brand">Brand</label>
                    <input 
                      id="brand" 
                      name="brand"
                      type="text" 
                      placeholder="Brand name" 
                      className="form-control"
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium" htmlFor="stock">Stock</label>
                    <input 
                      id="stock" 
                      name="stock"
                      type="number" 
                      placeholder="0" 
                      className="form-control"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="available"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label fw-medium" htmlFor="available">
                      Product Available
                    </label>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary fw-medium px-4 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    'ADD'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Add Category Modal */}
        {showCategoryModal && (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
            <div style={{width: '100%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
              <div style={{background: '#2563eb', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h5 style={{margin: 0, fontSize: '1.1rem'}}>
                  <i className="fas fa-plus me-2"></i>Add New Category
                </h5>
                <button onClick={() => setShowCategoryModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
              </div>
              <div style={{padding: '1.5rem'}}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Category Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Enter category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      autoFocus
                    />
                  </div>
                </div>
              <div style={{padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                <button onClick={() => setShowCategoryModal(false)} style={{padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>
                  Cancel
                </button>
                <button onClick={handleAddCategory} style={{padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>
                  <i className="fas fa-plus me-1"></i>Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AddProduct;