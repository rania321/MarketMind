import React from 'react';

function ProductCard({ product }) {
  const imageUrl = `http://localhost:5000/api/uploads/images/${product.image}`;
  
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={imageUrl || "/placeholder.svg"} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <span className="product-category">{product.category}</span>
        <p className="product-description">{product.description}</p>
        <small className="product-date">Ajouté le {product.date_added}</small>
      </div>
    </div>
  );
}

export default ProductCard;