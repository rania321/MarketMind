import React from 'react';
import './ProductList.css';

function ProductList({ products }) {
  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product._id} className="product-card">
          <div className="product-image">
            <img 
              src={`http://localhost:5000/api/uploads/images/${product.image}`} 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.png';
              }}
            />
          </div>
          <div className="product-info">
            <h4>{product.name}</h4>
            <span className="category">{product.category}</span>
            <p>{product.description}</p>
            <small>Ajouté le {product.date_added}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
