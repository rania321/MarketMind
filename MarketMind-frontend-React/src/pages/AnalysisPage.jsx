"use client"

import { useState, useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import api from "../services/api"
import WordCloud from "../components/visualization/WordCloud"
import "../styles/analysis.css"

function AnalysisPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [sentimentResults, setAllSentimentResults] = useState([])
  const [showingAllSentiments, setShowingAllSentiments] = useState(false)
  const [currentWordFilter, setCurrentWordFilter] = useState("all")
  const [wordCloudData, setWordCloudData] = useState([])

  // Références pour les graphiques
  const sentimentChartRef = useRef(null)
  const trendsChartRef = useRef(null)
  const topicsChartRef = useRef(null)
  const combinedChartRef = useRef(null)

  // Instances des graphiques
  const sentimentChartInstance = useRef(null)
  const trendsChartInstance = useRef(null)
  const topicsChartInstance = useRef(null)
  const combinedChartInstance = useRef(null)

  // Couleurs pour les sentiments
  const sentimentColors = {
    positive: "#04a4ed",
    neutral: "#666666",
    negative: "#fe3f40",
  }

  useEffect(() => {
    loadProducts()
    initCharts()

    // Nettoyage des graphiques lors du démontage
    return () => {
      if (sentimentChartInstance.current) sentimentChartInstance.current.destroy()
      if (trendsChartInstance.current) trendsChartInstance.current.destroy()
      if (topicsChartInstance.current) topicsChartInstance.current.destroy()
      if (combinedChartInstance.current) combinedChartInstance.current.destroy()
    }
  }, [])

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

  const initCharts = () => {
    // Initialiser le graphique de sentiment
    if (sentimentChartRef.current) {
      sentimentChartInstance.current = new Chart(sentimentChartRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Positif", "Neutre", "Négatif"],
          datasets: [
            {
              data: [0, 0, 0],
              backgroundColor: [sentimentColors.positive, sentimentColors.neutral, sentimentColors.negative],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      })
    }

    // Initialiser le graphique de tendances
    if (trendsChartRef.current) {
      trendsChartInstance.current = new Chart(trendsChartRef.current.getContext("2d"), {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Positif",
              data: [],
              backgroundColor: "rgba(4, 164, 237, 0.1)",
              borderColor: sentimentColors.positive,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Neutre",
              data: [],
              backgroundColor: "rgba(102, 102, 102, 0.1)",
              borderColor: sentimentColors.neutral,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Négatif",
              data: [],
              backgroundColor: "rgba(254, 63, 64, 0.1)",
              borderColor: sentimentColors.negative,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Pourcentage (%)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
        },
      })
    }

    // Initialiser le graphique des topics
    if (topicsChartRef.current) {
      topicsChartInstance.current = new Chart(topicsChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Distribution des Thématiques",
              data: [],
              backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40", "#36A2EB"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.raw}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Pourcentage (%)",
              },
            },
          },
        },
      })
    }

    // Initialiser le graphique combiné
    if (combinedChartRef.current) {
      combinedChartInstance.current = new Chart(combinedChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Prix", "Service", "Qualité", "Livraison"],
          datasets: [
            {
              label: "Positif",
              data: [],
              backgroundColor: sentimentColors.positive,
              borderColor: sentimentColors.positive,
              borderWidth: 1,
            },
            {
              label: "Neutre",
              data: [],
              backgroundColor: sentimentColors.neutral,
              borderColor: sentimentColors.neutral,
              borderWidth: 1,
            },
            {
              label: "Négatif",
              data: [],
              backgroundColor: sentimentColors.negative,
              borderColor: sentimentColors.negative,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Nombre d'avis",
              },
              stacked: true,
            },
            x: {
              stacked: true,
            },
          },
        },
      })
    }
  }

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value)
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!selectedProduct) {
      showAlert("Veuillez sélectionner un produit", "warning")
      return
    }

    setLoading(true)
    try {
      // Effectuer l'analyse de sentiment
      const response = await api.analyzeSentiment(selectedProduct)

      if (response.sentiment_results) {
        setAllSentimentResults(response.sentiment_results)
        setShowingAllSentiments(false)

        // Calculer les comptes de sentiment
        const counts = {
          positive: response.sentiment_results.filter((r) => r.sentiment === "positive").length,
          neutral: response.sentiment_results.filter((r) => r.sentiment === "neutral").length,
          negative: response.sentiment_results.filter((r) => r.sentiment === "negative").length,
        }

        // Mettre à jour les graphiques et statistiques
        updateSentimentChart(counts)
        updateSentimentStats(counts)

        // Charger les données pour le nuage de mots et les tendances
        loadWordCloud(selectedProduct)
        loadSentimentTrends(selectedProduct)
        loadStrengthsWeaknesses(selectedProduct)

        // Charger les données pour les topics
        await loadTopicClassification(selectedProduct)
      } else {
        showAlert(response.error || "Erreur lors de l'analyse de sentiment", "error")
      }
    } catch (error) {
      showAlert(error.message || "Erreur lors de l'analyse de sentiment", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadTopicClassification = async (productId) => {
    try {
      // Appel à l'API pour la classification thématique
      await fetch("/api/topic_classification", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ product_id: productId }),
      })

      // Charger les visualisations thématiques
      loadTopicDistribution(productId)
      loadCombinedSentimentTopic(productId)
    } catch (error) {
      console.error("Erreur lors de la classification thématique:", error)
    }
  }

  const loadTopicDistribution = async (productId) => {
    try {
      const topicData = await api.getTopicDistribution(productId)

      if (!topicsChartInstance.current) return

      const labels = topicData.map((item) =>
        item.topic === "price"
          ? "Prix"
          : item.topic === "service"
            ? "Service"
            : item.topic === "quality"
              ? "Qualité"
              : "Livraison",
      )
      const data = topicData.map((item) => item.percentage)

      topicsChartInstance.current.data.labels = labels
      topicsChartInstance.current.data.datasets[0].data = data
      topicsChartInstance.current.update()
    } catch (error) {
      console.error("Erreur lors du chargement des topics:", error)
      showAlert("Erreur lors du chargement des thématiques", "error")
    }
  }

  const loadCombinedSentimentTopic = async (productId) => {
    try {
      const combinedData = await api.getCombinedSentimentTopic(productId)

      if (!combinedChartInstance.current) return

      // Mettre à jour les données du graphique
      combinedChartInstance.current.data.datasets[0].data = [
        combinedData.price.positive,
        combinedData.service.positive,
        combinedData.quality.positive,
        combinedData.delivery.positive,
      ]

      combinedChartInstance.current.data.datasets[1].data = [
        combinedData.price.neutral,
        combinedData.service.neutral,
        combinedData.quality.neutral,
        combinedData.delivery.neutral,
      ]

      combinedChartInstance.current.data.datasets[2].data = [
        combinedData.price.negative,
        combinedData.service.negative,
        combinedData.quality.negative,
        combinedData.delivery.negative,
      ]

      combinedChartInstance.current.update()
    } catch (error) {
      console.error("Erreur lors du chargement des données combinées:", error)
      showAlert("Erreur lors du chargement de la corrélation thématique/sentiment", "error")
    }
  }

  const updateSentimentChart = (counts) => {
    if (!sentimentChartInstance.current) return

    const total = counts.positive + counts.neutral + counts.negative
    if (total === 0) return

    const positivePercent = Math.round((counts.positive / total) * 100)
    const neutralPercent = Math.round((counts.neutral / total) * 100)
    const negativePercent = Math.round((counts.negative / total) * 100)

    sentimentChartInstance.current.data.datasets[0].data = [positivePercent, neutralPercent, negativePercent]
    sentimentChartInstance.current.update()
  }

  const updateSentimentStats = (counts) => {
    const total = counts.positive + counts.neutral + counts.negative
    if (total === 0) return

    const positivePercent = Math.round((counts.positive / total) * 100)
    const neutralPercent = Math.round((counts.neutral / total) * 100)
    const negativePercent = Math.round((counts.negative / total) * 100)

    // Mettre à jour les éléments HTML
    document.getElementById("positivePercent").textContent = `${positivePercent}%`
    document.getElementById("neutralPercent").textContent = `${neutralPercent}%`
    document.getElementById("negativePercent").textContent = `${negativePercent}%`

    // Mettre à jour les KPIs
    document.getElementById("totalReviews").textContent = total
    document.getElementById("sentimentScore").textContent = `${positivePercent}%`
    document.getElementById("sentimentProgress").style.width = `${positivePercent}%`
  }

  const loadWordCloud = async (productId) => {
    try {
      const wordData = await api.getWordFrequencies(productId)

      const allWords = []
      ;["positive", "neutral", "negative"].forEach((sentiment) => {
        const words = wordData[sentiment] || {}
        const wordEntries = Object.entries(words)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30)

        wordEntries.forEach(([word, count]) => {
          allWords.push({
            text: word,
            size: 8 + count * 0.5,
            sentiment: sentiment,
          })
        })
      })

      setWordCloudData(allWords)
    } catch (error) {
      console.error("Erreur lors du chargement du word cloud:", error)
      showAlert("Erreur lors du chargement des mots-clés", "error")
    }
  }

  const loadSentimentTrends = async (productId) => {
    try {
      const trendsData = await api.getSentimentTrends(productId)

      if (!trendsChartInstance.current) return

      if (!trendsData.dates || !trendsData.positive || !trendsData.neutral || !trendsData.negative) {
        throw new Error("Format de données invalide")
      }

      trendsChartInstance.current.data.labels = trendsData.dates
      trendsChartInstance.current.data.datasets[0].data = trendsData.positive
      trendsChartInstance.current.data.datasets[1].data = trendsData.neutral
      trendsChartInstance.current.data.datasets[2].data = trendsData.negative

      trendsChartInstance.current.update()
    } catch (error) {
      console.error("Erreur lors du chargement des tendances:", error)
      showAlert("Erreur lors du chargement des tendances: " + error.message, "error")
    }
  }

  const loadStrengthsWeaknesses = async (productId) => {
    try {
      const combinedData = await api.getCombinedSentimentTopic(productId)

      const topicStats = calculateTopicStats(combinedData)
      const strengths = identifyStrengths(topicStats)
      const weaknesses = identifyWeaknesses(topicStats)

      displayStrengthsWeaknesses(strengths, weaknesses)
    } catch (error) {
      console.error("Erreur lors du chargement de l'analyse:", error)
      document.getElementById("strengthsList").innerHTML =
        '<div class="sw-error">Erreur lors du chargement des forces</div>'
      document.getElementById("weaknessesList").innerHTML =
        '<div class="sw-error">Erreur lors du chargement des faiblesses</div>'
    }
  }

  const calculateTopicStats = (combinedData) => {
    const topics = ["price", "service", "quality", "delivery"]
    const stats = {}

    topics.forEach((topic) => {
      const total = combinedData[topic].positive + combinedData[topic].neutral + combinedData[topic].negative

      if (total >= 5) {
        // Seuil minimum de 5 avis pour être considéré
        stats[topic] = {
          positive: (combinedData[topic].positive / total) * 100,
          negative: (combinedData[topic].negative / total) * 100,
          total: total,
        }
      }
    })

    return stats
  }

  const identifyStrengths = (topicStats) => {
    const strengths = []

    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.positive >= 30) {
        // Seuil à 30% positif
        strengths.push({
          topic: topic,
          percent: Math.round(stats.positive),
          count: Math.round((stats.positive / 100) * stats.total),
          total: stats.total,
        })
      }
    }

    return strengths.sort((a, b) => b.percent - a.percent).slice(0, 3) // Top 3
  }

  const identifyWeaknesses = (topicStats) => {
    const weaknesses = []

    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.negative >= 45) {
        // Seuil à 45% négatif
        weaknesses.push({
          topic: topic,
          percent: Math.round(stats.negative),
          count: Math.round((stats.negative / 100) * stats.total),
          total: stats.total,
        })
      }
    }

    return weaknesses.sort((a, b) => b.percent - a.percent).slice(0, 3) // Top 3
  }

  const displayStrengthsWeaknesses = (strengths, weaknesses) => {
    const strengthsList = document.getElementById("strengthsList")
    const weaknessesList = document.getElementById("weaknessesList")

    // Afficher les forces
    if (strengths.length > 0) {
      strengthsList.innerHTML = strengths
        .map(
          (item) => `
        <div class="sw-item">
          <span class="sw-topic">${formatTopic(item.topic)}</span>
          <div class="sw-details">
            <span class="sw-percent">${item.percent}%</span>
            <span class="sw-count">${item.count}/${item.total} avis</span>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      strengthsList.innerHTML = '<div class="sw-placeholder">Aucune force significative</div>'
    }

    // Afficher les faiblesses
    if (weaknesses.length > 0) {
      weaknessesList.innerHTML = weaknesses
        .map(
          (item) => `
        <div class="sw-item">
          <span class="sw-topic">${formatTopic(item.topic)}</span>
          <div class="sw-details">
            <span class="sw-percent">${item.percent}%</span>
            <span class="sw-count">${item.count}/${item.total} avis</span>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      weaknessesList.innerHTML = '<div class="sw-placeholder">Aucune faiblesse significative</div>'
    }
  }

  const formatTopic = (topic) => {
    return topic === "price"
      ? "Prix"
      : topic === "service"
        ? "Service"
        : topic === "quality"
          ? "Qualité"
          : topic === "delivery"
            ? "Livraison"
            : topic
  }

  const generateSummary = async () => {
    if (!selectedProduct) {
      showAlert("Veuillez sélectionner un produit", "warning")
      return
    }

    const btn = document.getElementById("generateSummaryBtn")
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...'
    setLoading(true)

    try {
      // Utiliser la méthode API au lieu de fetch directement
      const data = await api.generateSummary(selectedProduct)

      if (data.success) {
        const summaryContainer = document.getElementById("summaryText")
        summaryContainer.innerHTML = `
        <div class="ai-generated-content">
          <p>${data.summary.replace(/\n/g, "<br>")}</p>
          <div class="summary-meta">
            <small>Généré le ${new Date().toLocaleString()}</small>
          </div>
        </div>
      `

        showAlert("Résumé généré avec succès!", "success")
      } else {
        throw new Error(data.error || "Échec de la génération")
      }
    } catch (error) {
      console.error("Erreur lors de la génération du résumé:", error)
      showAlert(error.message || "Erreur lors de la génération du résumé", "error")

      // Afficher un message d'erreur dans le conteneur
      const summaryContainer = document.getElementById("summaryText")
      summaryContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Erreur lors de la génération du résumé. Veuillez réessayer.</p>
      </div>
    `
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-file-alt"></i> Générer un résumé'
      setLoading(false)
    }
  }

  const generateRecommendations = async () => {
    if (!selectedProduct) {
      showAlert("Veuillez sélectionner un produit", "warning")
      return
    }

    const btn = document.getElementById("generateRecommendationsBtn")
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...'
    setLoading(true)

    try {
      // Utiliser la méthode API au lieu de fetch directement
      const data = await api.generateRecommendations(selectedProduct)

      if (data.success) {
        const recommendationsList = document.getElementById("recommendationsText")
        recommendationsList.innerHTML = ""

        if (data.recommendations) {
          // Diviser les recommandations et les formater
          const recommendations = data.recommendations
            .split(/\n|•/)
            .map((item) => item.trim())
            .filter((item) => item)

          recommendations.forEach((rec, index) => {
            const li = document.createElement("li")
            li.className = "ai-generated-content"
            li.style.animationDelay = `${index * 0.1}s`
            li.innerHTML = `
            <div class="recommendation-content">
              <div class="recommendation-icon">
                <i class="fas fa-chevron-right"></i>
              </div>
              <div class="recommendation-text">${rec}</div>
            </div>
          `
            recommendationsList.appendChild(li)
          })
        } else {
          recommendationsList.innerHTML = `
          <li class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>Aucune recommandation n'a pu être générée.</p>
          </li>
        `
        }

        showAlert("Recommandations générées avec succès!", "success")
      } else {
        throw new Error(data.error || "Échec de la génération des recommandations")
      }
    } catch (error) {
      console.error("Erreur lors de la génération des recommandations:", error)
      showAlert(error.message || "Erreur lors de la génération des recommandations", "error")

      // Afficher un message d'erreur dans le conteneur
      const recommendationsList = document.getElementById("recommendationsText")
      recommendationsList.innerHTML = `
      <li class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Erreur lors de la génération des recommandations. Veuillez réessayer.</p>
      </li>
    `
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-lightbulb"></i> Générer des recommandations'
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleWordFilterChange = (filter) => {
    setCurrentWordFilter(filter)
  }

  return (
    <main className="main">
      <section id="analysis" className="section" style={{ paddingTop: "80px" }}>
        <div className="container">
          <div className="dashboard-header">
            <h2>Tableau de bord d'analyse</h2>
            <div className="dashboard-controls">
              <form id="sentimentAnalysisForm" className="form-inline" onSubmit={handleAnalyze}>
                <div className="form-group">
                  <select id="analysisProductSelect" value={selectedProduct} onChange={handleProductChange} required>
                    <option value="">Sélectionnez un produit</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Analyse en cours..." : "Analyser"}
                </button>
              </form>
            </div>
          </div>

          {alert.show && <div className={`alert ${alert.type}`}>{alert.message}</div>}

          <div id="analysisResults" className="analysis-results">
            {/* KPI Section */}
            <div className="kpi-section">
              <div className="kpi-card total-reviews">
                <div className="kpi-icon">
                  <i className="fas fa-comment-alt"></i>
                </div>
                <div className="kpi-content">
                  <h3>Total des avis</h3>
                  <div className="kpi-value" id="totalReviews">
                    0
                  </div>
                  <div className="kpi-trend">
                    <i className="fas fa-arrow-up trend-up"></i>
                    <span>0% vs mois dernier</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card sentiment-score">
                <div className="kpi-icon">
                  <i className="fas fa-smile"></i>
                </div>
                <div className="kpi-content">
                  <h3>Score de sentiment</h3>
                  <div className="kpi-value" id="sentimentScore">
                    0%
                  </div>
                  <div className="kpi-progress">
                    <div className="progress-bar" id="sentimentProgress"></div>
                  </div>
                </div>
              </div>

              <div className="kpi-card response-rate">
                <div className="kpi-icon">
                  <i className="fas fa-reply"></i>
                </div>
                <div className="kpi-content">
                  <h3>Taux de réponse</h3>
                  <div className="kpi-value" id="responseRate">
                    0%
                  </div>
                  <div className="kpi-trend">
                    <i className="fas fa-arrow-up trend-up"></i>
                    <span>0% vs mois dernier</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card popular-topic">
                <div className="kpi-icon">
                  <i className="fas fa-tag"></i>
                </div>
                <div className="kpi-content">
                  <h3>Thème principal</h3>
                  <div className="kpi-value" id="mainTopic">
                    -
                  </div>
                  <div className="kpi-subtext" id="topicPercentage">
                    0% des avis
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution Section */}
            <div className="sentiment-section">
              <h3>Distribution des sentiments</h3>

              {/* First row: Stats + Pie Chart */}
              <div className="sentiment-row">
                <div className="sentiment-stats-col">
                  <div className="sentiment-stat-card">
                    <div className="sentiment-stat-icon positive">
                      <i className="fas fa-smile"></i>
                    </div>
                    <div className="sentiment-stat-content">
                      <div className="sentiment-stat-label">Positif</div>
                      <div className="sentiment-stat-percent" id="positivePercent">
                        0%
                      </div>
                    </div>
                  </div>

                  <div className="sentiment-stat-card">
                    <div className="sentiment-stat-icon neutral">
                      <i className="fas fa-meh"></i>
                    </div>
                    <div className="sentiment-stat-content">
                      <div className="sentiment-stat-label">Neutre</div>
                      <div className="sentiment-stat-percent" id="neutralPercent">
                        0%
                      </div>
                    </div>
                  </div>

                  <div className="sentiment-stat-card">
                    <div className="sentiment-stat-icon negative">
                      <i className="fas fa-frown"></i>
                    </div>
                    <div className="sentiment-stat-content">
                      <div className="sentiment-stat-label">Négatif</div>
                      <div className="sentiment-stat-percent" id="negativePercent">
                        0%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sentiment-chart-col">
                  <div className="chart-container">
                    <canvas id="sentimentChart" ref={sentimentChartRef}></canvas>
                  </div>
                </div>
              </div>

              {/* Second row: Trend Chart */}
              <div className="sentiment-trend-chart">
                <div className="chart-container">
                  <canvas id="trendsChart" ref={trendsChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Frequent Keywords Section (full width) */}
            <div className="wordcloud-full-width">
              <div className="dashboard-section">
                <h3>Mots-clés fréquents</h3>
                <div className="wordcloud-filter">
                  <div className="filter-options">
                    <button
                      className={`btn-filter ${currentWordFilter === "all" ? "active" : ""}`}
                      onClick={() => handleWordFilterChange("all")}
                    >
                      Tous
                    </button>
                    <button
                      className={`btn-filter ${currentWordFilter === "positive" ? "active" : ""}`}
                      onClick={() => handleWordFilterChange("positive")}
                    >
                      Positif
                    </button>
                    <button
                      className={`btn-filter ${currentWordFilter === "neutral" ? "active" : ""}`}
                      onClick={() => handleWordFilterChange("neutral")}
                    >
                      Neutre
                    </button>
                    <button
                      className={`btn-filter ${currentWordFilter === "negative" ? "active" : ""}`}
                      onClick={() => handleWordFilterChange("negative")}
                    >
                      Négatif
                    </button>
                  </div>
                </div>
                <div className="wordcloud-container">
                  <div className="sentiment-legend">
                    <div className="legend-item">
                      <span className="legend-color positive"></span>
                      <span>Positif</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color neutral"></span>
                      <span>Neutre</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color negative"></span>
                      <span>Négatif</span>
                    </div>
                  </div>
                  <WordCloud words={wordCloudData} currentFilter={currentWordFilter} height={300} />
                </div>
              </div>
            </div>

            {/* Topics Distribution and Topics/Sentiment Correlation Section (same row) */}
            <div className="topics-correlation-grid">
              <div className="dashboard-section">
                <h3>Distribution des thématiques</h3>
                <div className="chart-container">
                  <canvas id="topicsChart" ref={topicsChartRef}></canvas>
                </div>
              </div>

              <div className="dashboard-section">
                <h3>Corrélation thématiques/sentiment</h3>
                <div className="chart-container" style={{ height: "300px" }}>
                  <canvas id="combinedChart" ref={combinedChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Section */}
            <div className="dashboard-section">
              <h3>Analyse thématique</h3>
              <div className="sw-container">
                <div className="sw-column strengths">
                  <h4>
                    <i className="fas fa-thumbs-up"></i> Forces
                  </h4>
                  <div id="strengthsList" className="sw-list">
                    {/* Dynamically populated */}
                    <div className="sw-placeholder">Les forces apparaîtront ici après l'analyse</div>
                  </div>
                </div>
                <div className="sw-column weaknesses">
                  <h4>
                    <i className="fas fa-thumbs-down"></i> Faiblesses
                  </h4>
                  <div id="weaknessesList" className="sw-list">
                    {/* Dynamically populated */}
                    <div className="sw-placeholder">Les faiblesses apparaîtront ici après l'analyse</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section" id="aiSummarySection">
              <div className="section-header">
                <h3>
                  <i className="fas fa-brain" style={{ color: "var(--blue)", marginRight: "10px" }}></i> Analyse des
                  avis par IA
                </h3>
                <div className="button-group">
                  <button id="generateSummaryBtn" className="btn btn-small" onClick={generateSummary}>
                    <i className="fas fa-file-alt"></i> Générer un résumé
                  </button>
                  <button id="generateRecommendationsBtn" className="btn btn-small" onClick={generateRecommendations}>
                    <i className="fas fa-lightbulb"></i> Générer des recommandations
                  </button>
                </div>
              </div>

              {/* Nouveau design pour le summary et les recommandations */}
              <div className="ai-analysis-container">
                <div className="ai-analysis-card summary-card">
                  <div className="ai-card-header">
                    <i className="fas fa-file-alt"></i>
                    <h4>Résumé exécutif</h4>
                    <div className="ai-card-actions">
                      <button className="btn-copy" data-target="summaryText">
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                  <div className="ai-card-content">
                    <div className="summary-text" id="summaryText">
                      <div className="empty-state">
                        <i className="fas fa-file-alt"></i>
                        <p>Aucun résumé généré. Cliquez sur "Générer un résumé" pour en créer un.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ai-analysis-card recommendations-card">
                  <div className="ai-card-header">
                    <i className="fas fa-lightbulb"></i>
                    <h4>Recommandations actionnables</h4>
                    <div className="ai-card-actions">
                      <button className="btn-copy" data-target="recommendationsText">
                        <i className="fas fa-copy"></i>
                      </button>
                      <button className="btn-export" data-target="recommendationsText">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                  <div className="ai-card-content">
                    <ul className="recommendations-list" id="recommendationsText">
                      <li className="empty-state">
                        <i className="fas fa-lightbulb"></i>
                        <p>Aucune recommandation générée. Cliquez sur "Générer des recommandations" pour en créer.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AnalysisPage
