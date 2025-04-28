"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import "../styles/reviews.css"

function ReviewsPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [dateFilter, setDateFilter] = useState("all")
  const [uniqueDates, setUniqueDates] = useState([])
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 5

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      loadReviews(selectedProduct)
    }
  }, [selectedProduct])

  useEffect(() => {
    filterReviewsByDate()
  }, [dateFilter, reviews])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      showAlert(error.message || "Erreur lors du chargement des produits", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (productId) => {
    setLoading(true)
    try {
      const data = await api.getReviews(productId)
      setReviews(data)

      // Extraire les dates uniques pour le filtre
      const dates = [...new Set(data.map((review) => review.date_added.split(" ")[0]))]
      setUniqueDates(dates)

      // Réinitialiser le filtre et la pagination
      setDateFilter("all")
      setCurrentPage(1)
    } catch (error) {
      showAlert(error.message || "Erreur lors du chargement des avis", "error")
      setReviews([])
      setUniqueDates([])
    } finally {
      setLoading(false)
    }
  }

  const filterReviewsByDate = () => {
    if (dateFilter === "all") {
      setFilteredReviews([...reviews])
    } else {
      const filtered = reviews.filter((review) => review.date_added.startsWith(dateFilter))
      setFilteredReviews(filtered)
    }
    setCurrentPage(1)
  }

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value)
  }

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value)
  }

  const handleFileChange = (e) => {
    // Validation du fichier si nécessaire
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("product_id", selectedProduct)
      formData.append("file", e.target.reviewsFile.files[0])

      await api.addReviews(formData)
      showAlert("Avis importés avec succès", "success")

      // Recharger les avis
      loadReviews(selectedProduct)

      // Réinitialiser le formulaire
      e.target.reset()
    } catch (error) {
      showAlert(error.message || "Erreur lors de l'import des avis", "error")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" })
    }, 3000)
  }

  const loadMoreReviews = () => {
    setCurrentPage((prev) => prev + 1)
  }

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage
  const currentReviews = filteredReviews.slice(0, indexOfLastReview)
  const hasMoreReviews = indexOfLastReview < filteredReviews.length

  return (
    <main className="main">
      <section id="reviews" className="section">
        <div className="container">
          <h2>Gestion des Avis</h2>

          {alert.show && <div className={`alert ${alert.type}`}>{alert.message}</div>}

          <div className="card">
            <h3>Importer des avis</h3>
            <form id="addReviewsForm" className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="productSelect">Produit</label>
                <select id="productSelect" value={selectedProduct} onChange={handleProductChange} required>
                  <option value="">Sélectionnez un produit</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reviewsFile">Fichier CSV/Excel</label>
                <input type="file" id="reviewsFile" accept=".csv,.xlsx" onChange={handleFileChange} required />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Import en cours..." : "Importer"}
              </button>
            </form>
          </div>

          <h3>Avis par produit</h3>
          <div className="card">
            <div className="form-group">
              <label htmlFor="reviewProductSelect">Sélectionnez un produit</label>
              <select id="reviewProductSelect" value={selectedProduct} onChange={handleProductChange}>
                <option value="">Sélectionnez un produit</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="form-group">
                <label htmlFor="reviewDateFilter">Filtrer par date</label>
                <select id="reviewDateFilter" value={dateFilter} onChange={handleDateFilterChange}>
                  <option value="all">Toutes les dates</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading && !currentReviews.length ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Chargement des avis...</p>
              </div>
            ) : (
              <div id="reviewsList" className="reviews-list">
                {currentReviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <p>{review.review_text}</p>
                    <small>Ajouté le {review.date_added}</small>
                  </div>
                ))}

                {currentReviews.length === 0 && selectedProduct && (
                  <p className="no-reviews">Aucun avis trouvé pour ce produit</p>
                )}

                {!selectedProduct && <p className="no-reviews">Veuillez sélectionner un produit pour voir les avis</p>}
              </div>
            )}

            {hasMoreReviews && (
              <button id="loadMoreReviews" className="btn" onClick={loadMoreReviews}>
                Voir plus
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ReviewsPage
