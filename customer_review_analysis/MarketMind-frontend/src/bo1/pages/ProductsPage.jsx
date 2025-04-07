import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import '../styles/bo1.css';

const Bo1ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await productService.addProduct(productData);
      await loadProducts(); // Recharger la liste
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <section id="products" className="section">
      <div className="container">
        <h2>Gestion des Produits</h2>
        
        <div className="card">
          <h3>Ajouter un nouveau produit</h3>
          <ProductForm onSubmit={handleAddProduct} />
        </div>
        
        <h3>Liste des produits</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </section>
  );
};

export default Bo1ProductsPage;