import React, { useState } from 'react';

const ProductDetail = () => {
    const product = {
        name: "Nike Pegasus 41 shoes",
        category: "Sports",
        price: 189,
        offerPrice: 159,
        rating: 4,
        images: [
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage2.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage3.png",
            "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/card/productImage4.png"
        ],
        description: [
            "High-quality material",
            "Comfortable for everyday use",
            "Available in different sizes"
        ]
    };

    const [thumbnail, setThumbnail] = useState(product.images[0]);

    const renderStars = () => {
        return Array(5).fill('').map((_, i) => (
            <span key={i} className={`text-warning ${product.rating > i ? '' : 'opacity-50'}`}>
                ★
            </span>
        ));
    };

    return (
        <div className="container-fluid px-4 py-3">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item">Products</li>
                    <li className="breadcrumb-item">{product.category}</li>
                    <li className="breadcrumb-item active text-primary">{product.name}</li>
                </ol>
            </nav>

            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="d-flex gap-3">
                        <div className="d-flex flex-column gap-2">
                            {product.images.map((image, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => setThumbnail(image)}
                                    className="border rounded overflow-hidden"
                                    style={{ width: '80px', height: '80px', cursor: 'pointer' }}
                                >
                                    <img 
                                        src={image} 
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="border rounded overflow-hidden flex-grow-1">
                            <img 
                                src={thumbnail} 
                                alt="Selected product" 
                                className="w-100 h-100 object-fit-cover"
                                style={{ maxHeight: '400px' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <h1 className="h2 fw-medium">{product.name}</h1>

                    <div className="d-flex align-items-center gap-1 mt-2">
                        {renderStars()}
                        <span className="ms-2">({product.rating})</span>
                    </div>

                    <div className="mt-4">
                        <p className="text-muted text-decoration-line-through mb-1">MRP: ${product.price}</p>
                        <p className="h4 fw-medium mb-1">MRP: ${product.offerPrice}</p>
                        <small className="text-muted">(inclusive of all taxes)</small>
                    </div>

                    <div className="mt-4">
                        <h6 className="fw-medium">About Product</h6>
                        <ul className="text-muted">
                            {product.description.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="d-flex gap-3 mt-4">
                        <button className="btn btn-outline-secondary flex-fill py-2">
                            Add to Cart
                        </button>
                        <button className="btn btn-primary flex-fill py-2">
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;