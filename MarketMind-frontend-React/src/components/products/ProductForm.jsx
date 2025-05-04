import React, { useState } from 'react';

function ProductForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('image', formData.image);
    
    onSubmit(data);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      image: null
    });
    e.target.reset();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nom du produit</label>
        <input 
          type="text" 
          id="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Catégorie</label>
        <input 
          type="text" 
          id="category" 
          value={formData.category} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea 
          id="description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
        ></textarea>
      </div>
      
      <div className="form-group">
        <label htmlFor="image">Image du produit</label>
        <input 
          type="file" 
          id="image" 
          accept="image/*" 
          onChange={handleFileChange} 
          required 
        />
      </div>
      
      <button type="submit" className="btn">Ajouter</button>
    </form>
  );
}

export default ProductForm;
