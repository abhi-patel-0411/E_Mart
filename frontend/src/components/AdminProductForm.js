import React, { useState } from 'react';

const AdminProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        offerPrice: ''
    });
    const [images, setImages] = useState([null, null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);

    const categories = [
        { name: 'Electronics' },
        { name: 'Clothing' },
        { name: 'Sports' },
        { name: 'Accessories' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...images];
            const newPreviews = [...imagePreviews];
            
            newImages[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            
            setImages(newImages);
            setImagePreviews(newPreviews);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        
        newImages[index] = null;
        if (newPreviews[index]) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews[index] = null;
        
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const productData = {
            ...formData,
            images: images.filter(img => img !== null)
        };
        
        console.log('Product Data:', productData);
        alert('Product added successfully!');
        
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            offerPrice: ''
        });
        setImages([null, null, null, null]);
        setImagePreviews([null, null, null, null]);
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Add New Product</h4>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Product Images</label>
                                    <div className="row g-3">
                                        {Array(4).fill('').map((_, index) => (
                                            <div key={index} className="col-6 col-md-3">
                                                <div className="position-relative">
                                                    <input
                                                        accept="image/*"
                                                        type="file"
                                                        id={`image${index}`}
                                                        className="d-none"
                                                        onChange={(e) => handleImageChange(index, e)}
                                                    />
                                                    <label 
                                                        htmlFor={`image${index}`}
                                                        className="d-block border border-2 border-dashed rounded text-center p-3"
                                                        style={{ cursor: 'pointer', minHeight: '120px' }}
                                                    >
                                                        {imagePreviews[index] ? (
                                                            <img
                                                                src={imagePreviews[index]}
                                                                alt={`Preview ${index + 1}`}
                                                                className="img-fluid rounded"
                                                                style={{ maxHeight: '100px' }}
                                                            />
                                                        ) : (
                                                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                                <div className="fs-2 text-muted">📁</div>
                                                                <small className="text-muted">Upload Image</small>
                                                            </div>
                                                        )}
                                                    </label>
                                                    {imagePreviews[index] && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                            onClick={() => removeImage(index)}
                                                            style={{ transform: 'translate(50%, -50%)' }}
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="product-name" className="form-label fw-medium">Product Name</label>
                                    <input
                                        id="product-name"
                                        name="name"
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter product name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="product-description" className="form-label fw-medium">Product Description</label>
                                    <textarea
                                        id="product-description"
                                        name="description"
                                        rows={4}
                                        className="form-control"
                                        placeholder="Enter product description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label fw-medium">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((item, index) => (
                                            <option key={index} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="product-price" className="form-label fw-medium">Product Price</label>
                                        <input
                                            id="product-price"
                                            name="price"
                                            type="number"
                                            className="form-control"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="offer-price" className="form-label fw-medium">Offer Price</label>
                                        <input
                                            id="offer-price"
                                            name="offerPrice"
                                            type="number"
                                            className="form-control"
                                            placeholder="0"
                                            value={formData.offerPrice}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductForm;