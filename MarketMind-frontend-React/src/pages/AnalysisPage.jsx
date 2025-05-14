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
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  // Chart references
  const sentimentChartRef = useRef(null)
  const trendsChartRef = useRef(null)
  const topicsChartRef = useRef(null)
  const combinedChartRef = useRef(null)

  // Chart instances
  const sentimentChartInstance = useRef(null)
  const trendsChartInstance = useRef(null)
  const topicsChartInstance = useRef(null)
  const combinedChartInstance = useRef(null)

  // Sentiment colors
  const sentimentColors = {
    positive: "#4cc9f0",
    neutral: "#6c757d",
    negative: "#fe3f40"
  }

  useEffect(() => {
    loadProducts()
    initCharts()

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
      showAlert(error.message || "Error loading products", "error")
    } finally {
      setLoading(false)
    }
  }


    const initCharts = () => {
    // Initialize sentiment chart
    if (sentimentChartRef.current) {
      sentimentChartInstance.current = new Chart(sentimentChartRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Positive", "Neutral", "Negative"],
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

    // Initialize trends chart
    if (trendsChartRef.current) {
      trendsChartInstance.current = new Chart(trendsChartRef.current.getContext("2d"), {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Positive",
              data: [],
              backgroundColor: "rgba(4, 164, 237, 0.1)",
              borderColor: sentimentColors.positive,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Neutral",
              data: [],
              backgroundColor: "rgba(102, 102, 102, 0.1)",
              borderColor: sentimentColors.neutral,
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Negative",
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
                text: "Percentage (%)",
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

    // Initialize topics chart
    if (topicsChartRef.current) {
      topicsChartInstance.current = new Chart(topicsChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Topic Distribution",
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
                text: "Percentage (%)",
              },
            },
          },
        },
      })
    }

    // Initialize a placeholder for the combined chart
    if (combinedChartRef.current) {
      const ctx = combinedChartRef.current.getContext("2d")
      ctx.font = "16px Arial"
      ctx.fillStyle = "#666"
      ctx.textAlign = "center"
      ctx.fillText(
        "Select a product and click Analyze to view data",
        combinedChartRef.current.width / 2,
        combinedChartRef.current.height / 2,
      )
    }
  }
  
    const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showAlert("Copied to clipboard!", "success")
  }

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value)
    setSummary(null)
    setRecommendations(null)
  }

   const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!selectedProduct) {
      showAlert("Please select a product", "warning")
      return
    }

    setLoading(true)
    try {
      const response = await api.analyzeSentiment(selectedProduct)

      if (response.sentiment_results) {
        setAllSentimentResults(response.sentiment_results)
        setShowingAllSentiments(false)

        const counts = {
          positive: response.sentiment_results.filter((r) => r.sentiment === "positive").length,
          neutral: response.sentiment_results.filter((r) => r.sentiment === "neutral").length,
          negative: response.sentiment_results.filter((r) => r.sentiment === "negative").length,
        }

        updateSentimentChart(counts)
        updateSentimentStats(counts)
        loadWordCloud(selectedProduct)
        loadSentimentTrends(selectedProduct)
        loadStrengthsWeaknesses(selectedProduct)
        await loadTopicClassification(selectedProduct)
      } else {
        showAlert(response.error || "Error during sentiment analysis", "error")
      }
    } catch (error) {
      showAlert(error.message || "Error during sentiment analysis", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadTopicClassification = async (productId) => {
    try {
      // API call for topic classification
      await fetch("/api/topic_classification", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ product_id: productId }),
      })

      // Load topic visualizations
      loadTopicDistribution(productId)
      loadCombinedSentimentTopic(productId)
    } catch (error) {
      console.error("Error during topic classification:", error)
    }
  }

  const loadTopicDistribution = async (productId) => {
    try {
      const topicData = await api.getTopicDistribution(productId)

      if (!topicsChartInstance.current) return

      const labels = topicData.map((item) =>
        item.topic === "price"
          ? "Price"
          : item.topic === "service"
            ? "Service"
            : item.topic === "quality"
              ? "Quality"
              : "Delivery",
      )
      const data = topicData.map((item) => item.percentage)

      topicsChartInstance.current.data.labels = labels
      topicsChartInstance.current.data.datasets[0].data = data
      topicsChartInstance.current.update()

      // Update main topic KPI
      if (topicData.length > 0) {
        const mainTopic = [...topicData].sort((a, b) => b.percentage - a.percentage)[0]
        document.getElementById("mainTopic").textContent = labels[topicData.indexOf(mainTopic)]
        document.getElementById("topicPercentage").textContent = `${Math.round(mainTopic.percentage)}% des avis`
      }
    } catch (error) {
      console.error("Error loading topics:", error)
      showAlert("Error loading topics", "error")
    }
  }

  const loadCombinedSentimentTopic = async (productId) => {
    try {
      const combinedData = await api.getCombinedSentimentTopic(productId)

      if (!combinedChartRef.current) return

      // Destroy the existing chart to create a new one with correct configuration
      if (combinedChartInstance.current) {
        combinedChartInstance.current.destroy()
      }

      // Create a new chart with the correct configuration
      combinedChartInstance.current = new Chart(combinedChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Price", "Service", "Quality", "Delivery"],
          datasets: [
            {
              label: "Positive",
              data: [
                combinedData.price.positive,
                combinedData.service.positive,
                combinedData.quality.positive,
                combinedData.delivery.positive,
              ],
              backgroundColor: sentimentColors.positive,
              borderColor: sentimentColors.positive,
              borderWidth: 1,
            },
            {
              label: "Neutral",
              data: [
                combinedData.price.neutral,
                combinedData.service.neutral,
                combinedData.quality.neutral,
                combinedData.delivery.neutral,
              ],
              backgroundColor: sentimentColors.neutral,
              borderColor: sentimentColors.neutral,
              borderWidth: 1,
            },
            {
              label: "Negative",
              data: [
                combinedData.price.negative,
                combinedData.service.negative,
                combinedData.quality.negative,
                combinedData.delivery.negative,
              ],
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
                text: "Number of reviews",
              },
              stacked: true,
            },
            x: {
              stacked: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("Error loading combined data:", error)
      showAlert("Error loading topic/sentiment correlation", "error")
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

    // Update HTML elements
    document.getElementById("positivePercent").textContent = `${positivePercent}%`
    document.getElementById("neutralPercent").textContent = `${neutralPercent}%`
    document.getElementById("negativePercent").textContent = `${negativePercent}%`

    // Update KPIs
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
      console.error("Error loading word cloud:", error)
      showAlert("Error loading keywords", "error")
    }
  }

  const loadSentimentTrends = async (productId) => {
    try {
      const trendsData = await api.getSentimentTrends(productId)

      if (!trendsChartInstance.current) return

      if (!trendsData.dates || !trendsData.positive || !trendsData.neutral || !trendsData.negative) {
        throw new Error("Invalid data format")
      }

      trendsChartInstance.current.data.labels = trendsData.dates
      trendsChartInstance.current.data.datasets[0].data = trendsData.positive
      trendsChartInstance.current.data.datasets[1].data = trendsData.neutral
      trendsChartInstance.current.data.datasets[2].data = trendsData.negative

      trendsChartInstance.current.update()
    } catch (error) {
      console.error("Error loading trends:", error)
      showAlert("Error loading trends: " + error.message, "error")
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
      console.error("Error loading analysis:", error)
      document.getElementById("strengthsList").innerHTML = '<div class="sw-error">Error loading strengths</div>'
      document.getElementById("weaknessesList").innerHTML = '<div class="sw-error">Error loading weaknesses</div>'
    }
  }

  const calculateTopicStats = (combinedData) => {
    const topics = ["price", "service", "quality", "delivery"]
    const stats = {}

    topics.forEach((topic) => {
      const total = combinedData[topic].positive + combinedData[topic].neutral + combinedData[topic].negative

      if (total >= 5) {
        // Minimum threshold of 5 reviews
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
        // Threshold at 30% positive
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
        // Threshold at 45% negative
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

    // Display strengths
    if (strengths.length > 0) {
      strengthsList.innerHTML = strengths
        .map(
          (item) => `
        <div class="sw-item">
          <span class="sw-topic">${formatTopic(item.topic)}</span>
          <div class="sw-details">
            <span class="sw-percent">${item.percent}%</span>
            <span class="sw-count">${item.count}/${item.total} reviews</span>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      strengthsList.innerHTML = '<div class="sw-placeholder">No significant strengths</div>'
    }

    // Display weaknesses
    if (weaknesses.length > 0) {
      weaknessesList.innerHTML = weaknesses
        .map(
          (item) => `
        <div class="sw-item">
          <span class="sw-topic">${formatTopic(item.topic)}</span>
          <div class="sw-details">
            <span class="sw-percent">${item.percent}%</span>
            <span class="sw-count">${item.count}/${item.total} reviews</span>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      weaknessesList.innerHTML = '<div class="sw-placeholder">No significant weaknesses</div>'
    }
  }

  const formatTopic = (topic) => {
    return topic === "price"
      ? "Price"
      : topic === "service"
        ? "Service"
        : topic === "quality"
          ? "Quality"
          : topic === "delivery"
            ? "Delivery"
            : topic
  }

  // Utilisation de l'API backend pour générer le résumé
 const generateSummary = async () => {
    if (!selectedProduct) {
      showAlert("Please select a product", "warning")
      return
    }

    setIsGeneratingSummary(true)
    try {
      const data = await api.generateSummary(selectedProduct)
      
      if (data.success) {
        setSummary({
          content: data.summary,
          generatedAt: new Date().toLocaleString()
        })
        showAlert("Summary generated successfully!", "success")
      } else {
        throw new Error(data.error || "Generation failed")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      showAlert(error.message || "Error generating summary", "error")
      setSummary({
        error: error.message || "Failed to generate summary"
      })
    } finally {
      setIsGeneratingSummary(false)
    }
  }


  // Utilisation de l'API backend pour générer les recommandations
   const generateRecommendations = async () => {
    if (!selectedProduct) {
      showAlert("Please select a product", "warning")
      return
    }

    setIsGeneratingRecommendations(true)
    try {
      const data = await api.generateRecommendations(selectedProduct)
      
      if (data.success && data.recommendations) {
        const formattedRecs = data.recommendations
          .split('\n')
          .filter(item => item.trim())
          .map(item => item.replace(/^- /, '').trim())
        
        setRecommendations(formattedRecs)
        showAlert("Recommendations generated successfully!", "success")
      } else {
        throw new Error(data.error || "Failed to generate recommendations")
      }
    } catch (error) {
      console.error("Error generating recommendations:", error)
      showAlert(error.message || "Error generating recommendations", "error")
      setRecommendations({
        error: error.message || "Failed to generate recommendations"
      })
    } finally {
      setIsGeneratingRecommendations(false)
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
      <section id="analysis" className="section">
        <div className="dashboard-container">
          {/* Header amélioré */}
      <div className="dashboard-header">
  <div className="header-brand">
    <div className="header-logo">
      <i className="fas fa-chart-pie"></i>
    </div>
    <div className="header-titles">
      <h1>Customer Insights</h1>
      <p>Sentiment Analysis Dashboard</p>
    </div>
  </div>

  <div className="header-controls">
    <div className="control-group">
      <div className="select-container">
        <select
          value={selectedProduct}
          onChange={handleProductChange}
          className="dashboard-select"
          disabled={loading}
        >
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        <i className="fas fa-chevron-down"></i>
      </div>
      
      <button 
        className="analyze-button"
        onClick={handleAnalyze}
        disabled={loading || !selectedProduct}
      >
        {loading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className="fas fa-play"></i>
        )}
        <span>Run Analysis</span>
      </button>
    </div>
  </div>
</div>

          {alert.show && (
            <div className={`alert ${alert.type} floating-alert`}>
              <i className={`fas ${
                alert.type === "success" ? "fa-check-circle" : 
                alert.type === "error" ? "fa-exclamation-circle" : 
                "fa-info-circle"
              }`}></i>
              {alert.message}
            </div>
          )}

          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-comment-dots"></i>
              </div>
              <div className="kpi-content">
                <h3>Total Reviews</h3>
                <div className="kpi-value" id="totalReviews">
                  0
                </div>
                <div className="kpi-trend">
                  <span className="trend-up">
                    <i className="fas fa-arrow-up"></i> 0%
                  </span>
                  <span>vs last month</span>
                </div>
              </div>
            </div>

            <div className="kpi-card sentiment">
              <div className="kpi-icon">
                <i className="fas fa-smile"></i>
              </div>
              <div className="kpi-content">
                <h3>Sentiment Score</h3>
                <div className="kpi-value" id="sentimentScore">
                  0%
                </div>
                <div className="kpi-progress">
                  <div className="progress-bar" id="sentimentProgress"></div>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-reply"></i>
              </div>
              <div className="kpi-content">
                <h3>Response Rate</h3>
                <div className="kpi-value" id="responseRate">
                  0%
                </div>
                <div className="kpi-trend">
                  <span className="trend-up">
                    <i className="fas fa-arrow-up"></i> 0%
                  </span>
                  <span>vs last month</span>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="kpi-content">
                <h3>Main Topic</h3>
                <div className="kpi-value" id="mainTopic">
                  -
                </div>
                <div className="kpi-subtext" id="topicPercentage">
                  <span id="topicPercentageValue">0%</span> of reviews
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Row 1: Sentiment + Trends */}
            <div className="card sentiment-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-heart"></i> Sentiment Analysis
                </h3>
                <div className="sentiment-legend">
                  <span className="legend-item positive">
                    <span className="legend-color"></span>
                    Positive
                  </span>
                  <span className="legend-item neutral">
                    <span className="legend-color"></span>
                    Neutral
                  </span>
                  <span className="legend-item negative">
                    <span className="legend-color"></span>
                    Negative
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="sentiment-stats">
                  <div className="sentiment-stat positive">
                    <div className="stat-value" id="positivePercent">
                      0%
                    </div>
                    <div className="stat-label">Positive</div>
                  </div>
                  <div className="sentiment-stat neutral">
                    <div className="stat-value" id="neutralPercent">
                      0%
                    </div>
                    <div className="stat-label">Neutral</div>
                  </div>
                  <div className="sentiment-stat negative">
                    <div className="stat-value" id="negativePercent">
                      0%
                    </div>
                    <div className="stat-label">Negative</div>
                  </div>
                </div>
                <div className="chart-container">
                  <canvas id="sentimentChart" ref={sentimentChartRef}></canvas>
                </div>
              </div>
            </div>

            <div className="card trends-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-line"></i> Sentiment Trends
                </h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <canvas id="trendsChart" ref={trendsChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Row 2: Topics + Word Cloud */}
            <div className="card topics-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-project-diagram"></i> Topic Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <canvas id="topicsChart" ref={topicsChartRef}></canvas>
                </div>
              </div>
            </div>

            <div className="card wordcloud-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-cloud"></i> Frequent Keywords
                </h3>
                <div className="wordcloud-filter">
                  <button
                    className={`filter-btn ${currentWordFilter === "all" ? "active" : ""}`}
                    onClick={() => handleWordFilterChange("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${currentWordFilter === "positive" ? "active" : ""}`}
                    onClick={() => handleWordFilterChange("positive")}
                  >
                    Positive
                  </button>
                  <button
                    className={`filter-btn ${currentWordFilter === "neutral" ? "active" : ""}`}
                    onClick={() => handleWordFilterChange("neutral")}
                  >
                    Neutral
                  </button>
                  <button
                    className={`filter-btn ${currentWordFilter === "negative" ? "active" : ""}`}
                    onClick={() => handleWordFilterChange("negative")}
                  >
                    Negative
                  </button>
                </div>
              </div>
              <div className="card-body">
                <WordCloud words={wordCloudData} currentFilter={currentWordFilter} height={250} />
              </div>
            </div>

            {/* Row 3: Correlation + SWOT */}
            <div className="card correlation-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-project-diagram"></i> Topic/Sentiment Correlation
                </h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <canvas id="combinedChart" ref={combinedChartRef}></canvas>
                </div>
              </div>
            </div>

           <div className="card thematic-analysis-card">
  <div className="card-header">
    <div className="header-content">
      <i className="fas fa-chart-network"></i>
      <h3>Thematic Analysis</h3>
      <div className="badge">SWOT</div>
    </div>
    <div className="analysis-tabs">
      <button className="tab-btn active">Strengths</button>
      <button className="tab-btn">Weaknesses</button>
    </div>
  </div>
  
  <div className="card-body">
    <div className="analysis-grid">
      {/* Strengths Column */}
      <div className="analysis-column strengths">
        <div className="column-header">
          <div className="icon-circle strength-icon">
            <i className="fas fa-thumbs-up"></i>
          </div>
          <h4>Key Strengths</h4>
          <span className="pill-badge">Positive</span>
        </div>
        
        <div id="strengthsList" className="analysis-list">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-magnifying-glass-chart"></i>
            </div>
            <p className="empty-text">Analysis results will appear here</p>
            <p className="empty-subtext">Run analysis to discover key strengths</p>
          </div>
          
          {/* Exemple d'item (sera remplacé dynamiquement) */}
          <div className="analysis-item">
            <div className="item-content">
              <div className="item-title">Product Quality</div>
              <div className="item-stats">
                <div className="stat-badge positive">
                  <i className="fas fa-arrow-up"></i> 78%
                </div>
                <div className="stat-details">Based on 142 reviews</div>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-bar positive" style={{width: '78%'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weaknesses Column */}
      <div className="analysis-column weaknesses">
        <div className="column-header">
          <div className="icon-circle weakness-icon">
            <i className="fas fa-thumbs-down"></i>
          </div>
          <h4>Improvement Areas</h4>
          <span className="pill-badge">Negative</span>
        </div>
        
        <div id="weaknessesList" className="analysis-list">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-magnifying-glass-chart"></i>
            </div>
            <p className="empty-text">Analysis results will appear here</p>
            <p className="empty-subtext">Run analysis to identify weaknesses</p>
          </div>
          
          {/* Exemple d'item (sera remplacé dynamiquement) */}
          <div className="analysis-item">
            <div className="item-content">
              <div className="item-title">Delivery Time</div>
              <div className="item-stats">
                <div className="stat-badge negative">
                  <i className="fas fa-arrow-down"></i> 42%
                </div>
                <div className="stat-details">Based on 89 reviews</div>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-bar negative" style={{width: '42%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

            {/* Row 4: AI Insights */}
             {/* Row 4: AI Insights */}
          <div className="card ai-section full-width">
            <div className="card-header">
              <h3>
                <i className="fas fa-robot"></i> AI-Powered Insights
              </h3>
              <div className="ai-actions">
                <button
                  id="generateSummaryBtn"
                  className="btn ai-btn primary"
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-alt"></i> Generate Summary
                    </>
                  )}
                </button>
                <button
                  id="generateRecommendationsBtn"
                  className="btn ai-btn secondary"
                  onClick={generateRecommendations}
                  disabled={isGeneratingRecommendations}
                >
                  {isGeneratingRecommendations ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lightbulb"></i> Generate Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="ai-columns">
                {/* Summary Card */}
                <div className="ai-summary-card">
                  <div className="summary-header">
                    <div className="summary-tab"></div>
                    <h4>
                      <i className="fas fa-file-alt"></i> Executive Summary
                    </h4>
                    {summary && !summary.error && (
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(summary.content)}
                      >
                        <i className="fas fa-copy"></i> Copy
                      </button>
                    )}
                  </div>
                  <div className="summary-content">
                    <div id="summaryText" className="ai-generated-content">
                      {isGeneratingSummary ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>Generating insights...</p>
                        </div>
                      ) : summary ? (
                        summary.error ? (
                          <div className="error-state">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{summary.error}</p>
                          </div>
                        ) : (
                          <>
                            <p>{summary.content.replace(/\n/g, "<br>")}</p>
                            <div className="summary-meta">
                              <small>Generated on {summary.generatedAt}</small>
                            </div>
                          </>
                        )
                      ) : (
                        <div className="empty-state">
                          <i className="fas fa-file-alt"></i>
                          <p>No summary generated yet. Click "Generate Summary" to create one.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations Card */}
                <div className="ai-recommendations-card">
                  <div className="recommendations-header">
                    <div className="recommendations-tab"></div>
                    <h4>
                      <i className="fas fa-lightbulb"></i> Actionable Recommendations
                    </h4>
                    {recommendations && !recommendations.error && (
                      <div className="recommendations-actions">
                        <button 
                          className="btn-copy"
                          onClick={() => copyToClipboard(recommendations.join("\n• "))}
                        >
                          <i className="fas fa-copy"></i> Copy All
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="recommendations-content">
                    <ul id="recommendationsText" className="ai-generated-content">
                      {isGeneratingRecommendations ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>Generating recommendations...</p>
                        </div>
                      ) : recommendations ? (
                        recommendations.error ? (
                          <li className="error-state">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{recommendations.error}</p>
                          </li>
                        ) : (
                          recommendations.map((rec, index) => (
                            <li 
                              key={index} 
                              className="recommendation-item"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="recommendation-content">
                                <div className="recommendation-icon">
                                  <i className="fas fa-chevron-right"></i>
                                </div>
                                <div className="recommendation-text">{rec}</div>
                              </div>
                            </li>
                          ))
                        )
                      ) : (
                        <li className="empty-state">
                          <i className="fas fa-lightbulb"></i>
                          <p>No recommendations generated yet.</p>
                        </li>
                      )}
                    </ul>
                  </div>
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