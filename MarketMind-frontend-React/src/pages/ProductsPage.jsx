"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../services/api"
import ProductForm from "../components/products/ProductForm"
import ProductList from "../components/products/ProductList"
import Alert from "../components/common/Alert"
import Loader from "../components/common/Loader"
import EmptyState from "../components/common/EmptyState"
import { FiPackage, FiPlus, FiList, FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiCalendar } from "react-icons/fi"
import "../styles/products.css"
import { useNavigate } from "react-router-dom" 


const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)", icon: <FiArrowUp /> },
  { value: "name-desc", label: "Name (Z-A)", icon: <FiArrowDown /> },
  { value: "price-asc", label: "Price (Low to High)", icon: <FiArrowUp /> },
  { value: "price-desc", label: "Price (High to Low)", icon: <FiArrowDown /> },
  { value: "date-newest", label: "Newest First", icon: <FiCalendar /> },
  { value: "date-oldest", label: "Oldest First", icon: <FiCalendar /> }
]

function ProductsPage() {
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    loading: true,
    alert: { show: false, message: "", type: "" },
    searchTerm: "",
    selectedCategory: "all",
    categories: ["all"],
    sortOption: "name-asc",
    isFormSubmitting: false,
    currentPage: 1,
    itemsPerPage: 12
  })

  const {
    products,
    filteredProducts,
    loading,
    alert,
    searchTerm,
    selectedCategory,
    categories,
    sortOption,
    isFormSubmitting,
    currentPage,
    itemsPerPage
  } = state
  
  const navigate = useNavigate()
  const loadProducts = useCallback(async () => {
    try {
      const data = await api.getProducts()
      const uniqueCategories = [...new Set(data.map(product => product.category))]
      setState(prev => ({
        ...prev,
        products: data,
        categories: ["all", ...uniqueCategories],
        loading: false
      }))
    } catch (error) {
      showAlert(error.message, "error")
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === "all" || 
        product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        case "date-newest": return new Date(b.createdAt) - new Date(a.createdAt)
        case "date-oldest": return new Date(a.createdAt) - new Date(b.createdAt)
        default: return 0
      }
    })

    setState(prev => ({ ...prev, filteredProducts: sorted, currentPage: 1 }))
  }, [products, searchTerm, selectedCategory, sortOption])

  const addProduct = async (formData) => {
    setState(prev => ({ ...prev, isFormSubmitting: true }))
    try {
      await api.addProduct(formData)
      showAlert("Product added successfully", "success")
      await loadProducts()
    } catch (error) {
      showAlert(error.message, "error")
    } finally {
      setState(prev => ({ ...prev, isFormSubmitting: false }))
    }
  }

  const showAlert = (message, type) => {
    setState(prev => ({
      ...prev,
      alert: { show: true, message, type }
    }))
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        alert: { show: false, message: "", type: "" }
      }))
    }, 3000)
  }

  const handleStateChange = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <section className="products-section">
      <div className="products-container">
        <div className="products-header">
          <div className="header-content">
            <h2>Product Management</h2>
            <p className="products-subtitle">
              Manage your product inventory efficiently
            </p>
          </div>
          <div className="header-actions">
            <span className="total-products">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
           
            <button 
  className="add-review-button mt-4"
  onClick={() => navigate('/reviews')}
>
  <FiPlus className="icon" /> Add Review
</button>

          </div>
        </div>

        {alert.show && <Alert message={alert.message} type={alert.type} />}

        <div className="products-content">
          <div className="products-form-card">
            <div className="form-header">
              <h3>
                <FiPlus className="icon" /> Add New Product
              </h3>
              <p className="form-subtitle">
                Fill in the product details below
              </p>
            </div>
            <ProductForm 
              onSubmit={addProduct} 
              isSubmitting={isFormSubmitting}
              categories={categories.filter(cat => cat !== "all")}
            />
          </div>

          <div className="products-list-section">
            <div className="section-header">
              <h3>
                <FiList className="icon" /> Product Inventory
              </h3>
              <div className="search-filter-container">
                <div className="search-filter-group">
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => handleStateChange("searchTerm", e.target.value)}
                    />
                  </div>
                  
                  <div className="select-wrapper">
                    <FiFilter className="filter-icon" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleStateChange("selectedCategory", e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="select-wrapper">
                    <select
                      value={sortOption}
                      onChange={(e) => handleStateChange("sortOption", e.target.value)}
                      className="sort-select"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {loading ? (
              <Loader fullHeight />
            ) : paginatedProducts.length > 0 ? (
              <>
                <ProductList 
                  products={paginatedProducts} 
                  onProductUpdate={loadProducts}
                  showAlert={showAlert}
                />
                
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() => handleStateChange("currentPage", Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handleStateChange("currentPage", Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<FiPackage size={48} />}
                title="No products found"
                description="Try adjusting your search or add a new product"
                actionText="Add Product"
                onAction={() => window.scrollTo(0, 0)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductsPage