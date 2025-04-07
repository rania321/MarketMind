export const productService = {
    getProducts: async () => {
      const response = await fetch('/api/products');
      return await response.json();
    },
    
    addProduct: async (productData) => {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      formData.append('image', productData.image);
      
      const response = await fetch('/api/add_product', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    }
  };