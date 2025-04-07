import React, { useState } from 'react';

const ProductForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      category: '',
      description: '',
      image: null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Nom du produit</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Catégorie</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Image du produit</label>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          accept="image/*"
          required
        />
      </div>
      
      <button type="submit" className="btn">Ajouter</button>
    </form>
  );
};

export default ProductForm;