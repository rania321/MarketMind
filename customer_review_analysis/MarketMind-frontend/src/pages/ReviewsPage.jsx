"use client"

import { useState, useEffect, useCallback } from "react"
import { FiUpload, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi"
import api from "../services/api"
import Alert from "../components/common/Alert"
import Loader from "../components/common/Loader"
import EmptyState from "../components/common/EmptyState"
import "../styles/reviews.css"

const ReviewsPage = () => {
  const [state, setState] = useState({
    products: [],
    selectedProduct: "",
    selectedProductName: "",
    reviews: [],
    filteredReviews: [],
    dateFilter: "all",
    uniqueDates: [],
    loading: false,
    alert: { show: false, message: "", type: "" },
    currentPage: 1,
    reviewsPerPage: 10,
    sortOption: "date-desc",
    expandedReview: null
  })

  const {
    products,
    selectedProduct,
    selectedProductName,
    reviews,
    filteredReviews,
    dateFilter,
    uniqueDates,
    loading,
    alert,
    currentPage,
    reviewsPerPage,
    sortOption,
    expandedReview
  } = state

  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = await api.getProducts()
      setState(prev => ({ ...prev, products: data, loading: false }))
    } catch (error) {
      showAlert(error.message || "Failed to load products", "error")
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const loadReviews = useCallback(async (productId) => {
    if (!productId) return
    
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = await api.getReviews(productId)
      const dates = [...new Set(data.map(review => review.date_added.split("T")[0]))]
      const product = state.products.find(p => p._id === productId)
      
      setState(prev => ({
        ...prev,
        reviews: data,
        uniqueDates: dates,
        dateFilter: "all",
        currentPage: 1,
        selectedProductName: product?.name || "",
        loading: false
      }))
    } catch (error) {
      showAlert(error.message || "Failed to load reviews", "error")
      setState(prev => ({
        ...prev,
        reviews: [],
        uniqueDates: [],
        loading: false
      }))
    }
  }, [state.products])

  useEffect(() => {
    let result = [...reviews]
    
    if (dateFilter !== "all") {
      result = result.filter(review => review.date_added.startsWith(dateFilter))
    }
    
    result.sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.date_added) - new Date(a.date_added)
        case "date-asc":
          return new Date(a.date_added) - new Date(b.date_added)
        default:
          return 0
      }
    })
    
    setState(prev => ({ ...prev, filteredReviews: result, currentPage: 1 }))
  }, [reviews, dateFilter, sortOption])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    loadReviews(selectedProduct)
  }, [selectedProduct, loadReviews])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const formData = new FormData()
      formData.append("product_id", selectedProduct)
      formData.append("file", e.target.reviewsFile.files[0])

      await api.addReviews(formData)
      showAlert("Reviews imported successfully", "success")
      await loadReviews(selectedProduct)
      e.target.reset()
    } catch (error) {
      showAlert(error.message || "Failed to import reviews", "error")
    } finally {
      setState(prev => ({ ...prev, loading: false }))
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

  const toggleReviewExpand = (reviewId) => {
    setState(prev => ({
      ...prev,
      expandedReview: prev.expandedReview === reviewId ? null : reviewId
    }))
  }

  const indexOfLastReview = currentPage * reviewsPerPage
  const currentReviews = filteredReviews.slice(0, indexOfLastReview)
  const hasMoreReviews = indexOfLastReview < filteredReviews.length

  return (
    <main className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <div className="header-content">
            <h2>Review Management</h2>
            <p className="reviews-subtitle">
              Manage and analyze customer feedback
            </p>
          </div>
          {selectedProduct && (
            <div className="header-stats">
              <span className="total-reviews">
                {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {alert.show && <Alert message={alert.message} type={alert.type} />}

        <div className="reviews-content">
          <div className="reviews-import-card">
            <div className="form-header">
              <h3><FiUpload className="icon" /> Import Reviews</h3>
              <p className="form-subtitle">
                Upload CSV/Excel file with customer reviews
              </p>
            </div>
            <form onSubmit={handleSubmit} className="import-form">
              <div className="form-group">
                <label htmlFor="productSelect">Product</label>
                <select
                  id="productSelect"
                  value={selectedProduct}
                  onChange={(e) => handleStateChange("selectedProduct", e.target.value)}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reviewsFile">Review File</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="reviewsFile"
                    accept=".csv,.xlsx,.xls"
                    required
                  />
                  <label htmlFor="reviewsFile" className="file-label">
                    Choose file...
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Importing..." : "Import Reviews"}
              </button>
            </form>
          </div>

          <div className="reviews-list-card">
            <div className="section-header">
              <h3><FiFilter className="icon" /> Review Analysis</h3>
              <div className="review-filters">
                <div className="filter-group">
                  <label htmlFor="reviewProductSelect">Product</label>
                  <select
                    id="reviewProductSelect"
                    value={selectedProduct}
                    onChange={(e) => handleStateChange("selectedProduct", e.target.value)}
                  >
                    <option value="">All Products</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <>
                    <div className="filter-group">
                      <label htmlFor="reviewDateFilter">Date</label>
                      <select
                        id="reviewDateFilter"
                        value={dateFilter}
                        onChange={(e) => handleStateChange("dateFilter", e.target.value)}
                      >
                        <option value="all">All Dates</option>
                        {uniqueDates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label htmlFor="reviewSort">Sort By</label>
                      <select
                        id="reviewSort"
                        value={sortOption}
                        onChange={(e) => handleStateChange("sortOption", e.target.value)}
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {loading && !currentReviews.length ? (
              <Loader fullHeight />
            ) : currentReviews.length > 0 ? (
              <div className="reviews-list">
                {currentReviews.map((review) => {
                  const displayTitle = review.title || selectedProductName || "Customer Review"
                  
                  return (
                    <div 
                      key={review._id} 
                      className={`review-item ${expandedReview === review._id ? 'expanded' : ''}`}
                    >
                      <div className="review-header">
                        <span className="review-date">
                          {new Date(review.date_added).toLocaleDateString()}
                        </span>
                        <button 
                          className="expand-btn"
                          onClick={() => toggleReviewExpand(review._id)}
                          aria-label={expandedReview === review._id ? "Collapse review" : "Expand review"}
                        >
                          {expandedReview === review._id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                      <h4 className="review-title">{displayTitle}</h4>
                      <p className="review-text">
                        {expandedReview === review._id 
                          ? review.review_text 
                          : `${review.review_text.substring(0, 150)}${review.review_text.length > 150 ? '...' : ''}`
                        }
                      </p>
                      {review.author && (
                        <div className="review-author">
                          — {review.author}
                        </div>
                      )}
                    </div>
                  )
                })}

                {hasMoreReviews && (
                  <button 
                    className="btn-load-more"
                    onClick={() => handleStateChange("currentPage", currentPage + 1)}
                  >
                    Load More Reviews
                  </button>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<FiFilter size={48} />}
                title={selectedProduct ? "No reviews found" : "Select a product to view reviews"}
                description={selectedProduct 
                  ? "Try adjusting your filters or import reviews" 
                  : "Choose a product from the dropdown above"
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReviewsPage