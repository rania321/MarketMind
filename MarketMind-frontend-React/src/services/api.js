const API_BASE_URL = "http://localhost:5000/api"

// Fonction générique pour les requêtes
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Une erreur est survenue" }))
    throw new Error(error.error || "Une erreur est survenue")
  }

  return response.json()
}

export default {
  // Produits
  getProducts: () => fetchAPI("products"),
  addProduct: (formData) =>
    fetchAPI("add_product", {
      method: "POST",
      body: formData,
    }),

  // Avis
  getReviews: (productId) => fetchAPI(`reviews/${productId}`),
  getAllReviews: () => fetchAPI("reviews"),
  addReviews: (formData) =>
    fetchAPI("add_reviews", {
      method: "POST",
      body: formData,
    }),

  // Analyse de sentiment
  analyzeSentiment: (productId) =>
    fetchAPI("sentiment_analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ product_id: productId }),
    }),
  getWordFrequencies: (productId) => fetchAPI(`word_frequencies/${productId}`),
  getSentimentTrends: (productId) => fetchAPI(`sentiment_trends/${productId}`),
  getTopicDistribution: (productId) => fetchAPI(`topic_distribution/${productId}`),
  getCombinedSentimentTopic: (productId) => fetchAPI(`combined_sentiment_topic/${productId}`),

  // Ajout des méthodes pour l'IA
  generateSummary: (productId) =>
    fetchAPI("generate_summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ product_id: productId }),
    }),
  generateRecommendations: (productId) =>
    fetchAPI("generate_recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ product_id: productId }),
    }),
}
