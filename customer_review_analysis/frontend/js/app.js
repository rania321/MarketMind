// Variables globales
const sentimentColors = {
    positive: '#04a4ed',
    neutral: '#666666',
    negative: '#fe3f40'
};

const topicColors = {
    price: '#FF6384',
    service: '#36A2EB',
    quality: '#FFCE56',
    delivery: '#4BC0C0'
};

// Chart instances
let sentimentChart, topicChart, sentimentTopicChart, trendsChart;

// Data state
let currentReviewPage = 1;
const reviewsPerPage = 5;
let allReviews = [];
let filteredReviews = [];
let allSentimentResults = [];
let showingAllSentiments = false;
let currentKeywordPage = 1;
const keywordsPerPage = 10;
let allKeywords = [];
let filteredKeywords = [];

/* ==================== */
/* INITIALIZATION */
/* ==================== */
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    const path = window.location.pathname.split('/').pop();
    if (path === 'produit.html' || path === '') {
        initProductPage();
    } else if (path === 'avis.html') {
        initReviewsPage();
    } else if (path === 'analyse.html') {
        initAnalysisDashboard();
    }
});

function initAnalysisDashboard() {
    initCharts();
    setupEventListeners();
    
    // Initialize charts with empty data
    updateSentimentChartFromResults([]);
    updateTopicChartFromResults([]);
    updateSentimentTopicChart([], []);
    updateTrendsChart([]);
}

/* ==================== */
/* CHART FUNCTIONS - CORRIGÉES */
/* ==================== */
function initCharts() {
    initSentimentChart();
    initTopicChart();
    initSentimentTopicChart();
    initTrendsChart();
}

function initSentimentChart() {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) return;
    
    sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positif', 'Neutre', 'Négatif'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    sentimentColors.positive,
                    sentimentColors.neutral,
                    sentimentColors.negative
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initTopicChart() {
    const ctx = document.getElementById('topicChart');
    if (!ctx) return;
    
    topicChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Prix', 'Service', 'Qualité', 'Livraison'],
            datasets: [{
                label: 'Répartition par thème',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    topicColors.price,
                    topicColors.service,
                    topicColors.quality,
                    topicColors.delivery
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pourcentage (%)'
                    }
                }
            }
        }
    });
}

function initSentimentTopicChart() {
    const ctx = document.getElementById('sentimentTopicChart');
    if (!ctx) return;
    
    sentimentTopicChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Prix', 'Service', 'Qualité', 'Livraison'],
            datasets: [
                {
                    label: 'Positif',
                    data: [0, 0, 0, 0],
                    backgroundColor: sentimentColors.positive,
                    stack: 'stack0'
                },
                {
                    label: 'Neutre',
                    data: [0, 0, 0, 0],
                    backgroundColor: sentimentColors.neutral,
                    stack: 'stack0'
                },
                {
                    label: 'Négatif',
                    data: [0, 0, 0, 0],
                    backgroundColor: sentimentColors.negative,
                    stack: 'stack0'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'avis'
                    }
                }
            }
        }
    });
}

function initTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Positif',
                    data: [],
                    borderColor: sentimentColors.positive,
                    backgroundColor: 'rgba(4, 164, 237, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Neutre',
                    data: [],
                    borderColor: sentimentColors.neutral,
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Négatif',
                    data: [],
                    borderColor: sentimentColors.negative,
                    backgroundColor: 'rgba(254, 63, 64, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Pourcentage (%)'
                    }
                }
            }
        }
    });
}

/* ==================== */
/* FILTER FUNCTIONS - CORRIGÉES */
/* ==================== */
function setupEventListeners() {
    // Bouton d'analyse principal
    const runAnalysisBtn = document.getElementById('runAnalysis');
    if (runAnalysisBtn) {
        runAnalysisBtn.addEventListener('click', runAnalysis);
    }
    
    // Filtre des mots-clés
    const keywordFilter = document.getElementById('keywordFilter');
    if (keywordFilter) {
        keywordFilter.addEventListener('change', () => {
            currentKeywordPage = 1;
            updateKeywordsTable();
        });
    }
    
    // Recherche de mots-clés
    const keywordSearch = document.getElementById('keywordSearch');
    if (keywordSearch) {
        keywordSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filteredKeywords = searchTerm 
                ? allKeywords.filter(k => k.word.toLowerCase().includes(searchTerm))
                : [...allKeywords];
            currentKeywordPage = 1;
            updateKeywordsTable();
        });
    }
    
    // Pagination
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentKeywordPage > 1) {
            currentKeywordPage--;
            updateKeywordsTable();
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredKeywords.length / keywordsPerPage);
        if (currentKeywordPage < totalPages) {
            currentKeywordPage++;
            updateKeywordsTable();
        }
    });
    
    // Période des tendances
    document.getElementById('trendPeriod')?.addEventListener('change', updateTrendsData);
}

function runAnalysis() {
    const productId = document.getElementById('analysisProductSelect').value;
    if (!productId) {
        showAlert('Veuillez sélectionner un produit', 'warning');
        return;
    }
    
    showLoading(true);
    
    Promise.all([
        fetchSentimentAnalysis(productId),
        fetchTopicDistribution(productId),
        fetchWordFrequencies(productId),
        fetchSentimentTrends(productId)
    ])
    .then(([sentimentData, topicsData, keywordsData, trendsData]) => {
        allKeywords = processKeywordsData(keywordsData);
        filteredKeywords = [...allKeywords];
        
        updateSentimentChartFromResults(sentimentData);
        updateTopicChartFromResults(topicsData);
        updateSentimentTopicChart(sentimentData, topicsData);
        updateTrendsChart(trendsData);
        updateWordCloud(keywordsData);
        updateKeywordsTable();
        updateProductInfo(productId);
        
        // Ajout de la mise à jour des KPI
        updateKPIs(sentimentData, topicsData);
    })
    .catch(error => {
        console.error("Erreur lors de l'analyse:", error);
        showAlert("Erreur lors de l'analyse des données", 'error');
    })
    .finally(() => showLoading(false));
}


/* ==================== */
/* DATA FETCHING FUNCTIONS */
/* ==================== */
async function fetchSentimentAnalysis(productId) {
    const response = await fetch('/api/sentiment_analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ product_id: productId })
    });
    const data = await response.json();
    return data.sentiment_results || data;
}

async function fetchTopicDistribution(productId) {
    const response = await fetch(`/api/topic_distribution/${productId}`);
    return await response.json();
}

async function fetchWordFrequencies(productId) {
    const response = await fetch(`/api/word_frequencies/${productId}`);
    return await response.json();
}

async function fetchSentimentTrends(productId) {
    const period = document.getElementById('trendPeriod').value;
    const response = await fetch(`/api/sentiment_trends/${productId}?period=${period}`);
    return await response.json();
}

/* ==================== */
/* DATA PROCESSING FUNCTIONS */
/* ==================== */
function processKeywordsData(keywordsData) {
    const keywords = [];
    
    // Process positive keywords
    if (keywordsData.positive) {
        Object.entries(keywordsData.positive).forEach(([word, frequency]) => {
            keywords.push({
                word,
                frequency,
                sentiment: 'positive',
                score: frequency / 100,
                topics: []
            });
        });
    }
    
    // Process neutral keywords
    if (keywordsData.neutral) {
        Object.entries(keywordsData.neutral).forEach(([word, frequency]) => {
            keywords.push({
                word,
                frequency,
                sentiment: 'neutral',
                score: 0,
                topics: []
            });
        });
    }
    
    // Process negative keywords
    if (keywordsData.negative) {
        Object.entries(keywordsData.negative).forEach(([word, frequency]) => {
            keywords.push({
                word,
                frequency,
                sentiment: 'negative',
                score: -frequency / 100,
                topics: []
            });
        });
    }
    
    return keywords.sort((a, b) => b.frequency - a.frequency);
}

// Ajoutez cette fonction pour mettre à jour les KPI
function updateKPIs(sentimentData, topicData) {
    // Calcul des totaux
    const totalReviews = sentimentData.length;
    const positiveCount = sentimentData.filter(r => r.sentiment === 'positive').length;
    const neutralCount = sentimentData.filter(r => r.sentiment === 'neutral').length;
    const negativeCount = sentimentData.filter(r => r.sentiment === 'negative').length;

    // Mise à jour des KPI
    document.getElementById('totalReviewsKPI').textContent = totalReviews;
    document.getElementById('positiveReviewsKPI').textContent = totalReviews > 0 ? 
        `${Math.round((positiveCount / totalReviews) * 100)}%` : '0%';
    document.getElementById('neutralReviewsKPI').textContent = totalReviews > 0 ? 
        `${Math.round((neutralCount / totalReviews) * 100)}%` : '0%';
    document.getElementById('negativeReviewsKPI').textContent = totalReviews > 0 ? 
        `${Math.round((negativeCount / totalReviews) * 100)}%` : '0%';

    // Trouver le topic le plus fréquent
    if (topicData && topicData.length > 0) {
        const topTopic = topicData.reduce((prev, current) => 
            (prev.percentage > current.percentage) ? prev : current);
        document.getElementById('topTopicKPI').textContent = `${topTopic.topic} (${topTopic.percentage}%)`;
        
        // Mise à jour des infos dans le header du graphique
        document.getElementById('mostDiscussedTopic').textContent = topTopic.topic;
        
        // Trouver le topic avec le meilleur ratio positif/négatif
        // (Cette partie nécessiterait des données combinées sentiment/topic)
        document.getElementById('bestRatedTopic').textContent = "N/A";
    }
}

/* ==================== */
/* CHART UPDATE FUNCTIONS - CORRIGÉES */
/* ==================== */
function updateSentimentChartFromResults(results) {
    if (!sentimentChart) return;
    
    const counts = {
        positive: results.filter(r => r.sentiment === 'positive').length,
        neutral: results.filter(r => r.sentiment === 'neutral').length,
        negative: results.filter(r => r.sentiment === 'negative').length
    };
    
    sentimentChart.data.datasets[0].data = [
        counts.positive,
        counts.neutral,
        counts.negative
    ];
    sentimentChart.update();
}

function updateTopicChartFromResults(results) {
    if (!topicChart || !results) return;
    
    // Crée un mapping des topics avec leurs pourcentages
    const topicMap = {};
    results.forEach(item => {
        topicMap[item.topic] = item.percentage;
    });
    
    // Met à jour les données dans l'ordre des labels
    topicChart.data.datasets[0].data = [
        topicMap.price || 0,
        topicMap.service || 0,
        topicMap.quality || 0,
        topicMap.delivery || 0
    ];
    
    topicChart.update();
}

function updateSentimentTopicChart(sentimentResults, topicResults) {
    if (!sentimentTopicChart || !sentimentResults || !topicResults) return;
    
    // Logique pour combiner les données sentiment et topic
    const topicSentimentCounts = {
        price: { positive: 0, neutral: 0, negative: 0 },
        service: { positive: 0, neutral: 0, negative: 0 },
        quality: { positive: 0, neutral: 0, negative: 0 },
        delivery: { positive: 0, neutral: 0, negative: 0 }
    };
    
    // Ici vous devriez avoir une logique pour associer chaque review à son topic
    // Pour l'exemple, nous allons utiliser une répartition aléatoire
    sentimentResults.forEach(review => {
        const randomTopic = ['price', 'service', 'quality', 'delivery'][Math.floor(Math.random() * 4)];
        topicSentimentCounts[randomTopic][review.sentiment]++;
    });
    
    // Mise à jour des données du graphique
    sentimentTopicChart.data.datasets[0].data = [
        topicSentimentCounts.price.positive,
        topicSentimentCounts.service.positive,
        topicSentimentCounts.quality.positive,
        topicSentimentCounts.delivery.positive
    ];
    
    sentimentTopicChart.data.datasets[1].data = [
        topicSentimentCounts.price.neutral,
        topicSentimentCounts.service.neutral,
        topicSentimentCounts.quality.neutral,
        topicSentimentCounts.delivery.neutral
    ];
    
    sentimentTopicChart.data.datasets[2].data = [
        topicSentimentCounts.price.negative,
        topicSentimentCounts.service.negative,
        topicSentimentCounts.quality.negative,
        topicSentimentCounts.delivery.negative
    ];
    
    sentimentTopicChart.update();
}

function updateTrendsChart(trendsData) {
    if (!trendsChart || !trendsData) return;
    
    trendsChart.data.labels = trendsData.dates || [];
    trendsChart.data.datasets[0].data = trendsData.positive || [];
    trendsChart.data.datasets[1].data = trendsData.neutral || [];
    trendsChart.data.datasets[2].data = trendsData.negative || [];
    
    trendsChart.update();
}

function updateTrendsData() {
    const productId = document.getElementById('analysisProductSelect').value;
    if (productId) {
        fetchSentimentTrends(productId)
            .then(updateTrendsChart)
            .catch(error => {
                console.error("Erreur lors de la mise à jour des tendances:", error);
            });
    }
}

/* ==================== */
/* KEYWORDS TABLE FUNCTIONS - CORRIGÉES */
/* ==================== */
function updateKeywordsTable() {
    const tableBody = document.getElementById('keywordsTableBody');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!tableBody) return;
    
    const startIdx = (currentKeywordPage - 1) * keywordsPerPage;
    const endIdx = startIdx + keywordsPerPage;
    const pageKeywords = filteredKeywords.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredKeywords.length / keywordsPerPage);
    
    // Mise à jour de l'information de pagination
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentKeywordPage} sur ${totalPages}`;
    }
    
    // Remplissage du tableau
    tableBody.innerHTML = '';
    
    pageKeywords.forEach(keyword => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${keyword.word}</td>
            <td><span class="sentiment-badge ${keyword.sentiment}">${keyword.sentiment}</span></td>
            <td>${keyword.frequency}</td>
            <td>${keyword.topics.join(', ') || '-'}</td>
            <td>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${Math.abs(keyword.score) * 100}%; 
                        background-color: ${keyword.score > 0 ? sentimentColors.positive : sentimentColors.negative}"></div>
                    <span class="score-value">${keyword.score.toFixed(2)}</span>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/* ==================== */
/* WORD CLOUD FUNCTION - CORRIGÉE */
/* ==================== */
function updateWordCloud(keywordsData) {
    const wordcloud = document.getElementById('wordcloud');
    if (!wordcloud) return;
    
    wordcloud.innerHTML = '';
    
    const width = wordcloud.offsetWidth;
    const height = wordcloud.offsetHeight;
    
    const allWords = [];
    ['positive', 'neutral', 'negative'].forEach(sentiment => {
        const words = keywordsData[sentiment] || {};
        Object.entries(words)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .forEach(([word, count]) => {
                allWords.push({
                    text: word,
                    size: 10 + (count * 0.5),
                    sentiment: sentiment
                });
            });
    });
    
    allWords.sort((a, b) => b.size - a.size);
    const placedWords = [];
    
    allWords.forEach(wordObj => {
        const wordElement = document.createElement('div');
        wordElement.className = `word ${wordObj.sentiment}`;
        wordElement.textContent = wordObj.text;
        wordElement.style.fontSize = `${wordObj.size}px`;
        
        // Mesure temporaire pour obtenir la taille
        wordElement.style.visibility = 'hidden';
        wordcloud.appendChild(wordElement);
        const wordWidth = wordElement.offsetWidth;
        const wordHeight = wordElement.offsetHeight;
        wordElement.remove();
        
        // Placement aléatoire sans chevauchement
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 50) {
            attempts++;
            const left = Math.random() * (width - wordWidth);
            const top = Math.random() * (height - wordHeight);
            
            const collision = placedWords.some(placedWord => 
                left < placedWord.left + placedWord.width &&
                left + wordWidth > placedWord.left &&
                top < placedWord.top + placedWord.height &&
                top + wordHeight > placedWord.top
            );
            
            if (!collision) {
                wordElement.style.left = `${left}px`;
                wordElement.style.top = `${top}px`;
                wordElement.style.visibility = 'visible';
                wordcloud.appendChild(wordElement);
                
                placedWords.push({
                    left: left,
                    top: top,
                    width: wordWidth,
                    height: wordHeight
                });
                
                placed = true;
            }
        }
        
        // Si on n'a pas trouvé de place sans collision, on place quand même
        if (!placed) {
            wordElement.style.left = `${Math.random() * (width - wordWidth)}px`;
            wordElement.style.top = `${Math.random() * (height - wordHeight)}px`;
            wordElement.style.visibility = 'visible';
            wordcloud.appendChild(wordElement);
        }
        
        wordElement.title = `${wordObj.text} (${wordObj.sentiment})`;
    });
}

/* ==================== */
/* PRODUCT INFO FUNCTION */
/* ==================== */
async function updateProductInfo(productId) {
    try {
        const response = await fetch(`/api/product/${productId}/reviews_count`);
        const data = await response.json();
        
        const reviewCountEl = document.getElementById('reviewCount');
        if (reviewCountEl) {
            reviewCountEl.textContent = data.total_reviews || '0';
        }
        
        const lastAnalyzedEl = document.getElementById('lastAnalyzed');
        if (lastAnalyzedEl) {
            lastAnalyzedEl.textContent = `Dernière analyse: ${new Date().toLocaleString()}`;
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour des infos produit:", error);
    }
}

/* ==================== */
/* UTILITY FUNCTIONS */
/* ==================== */
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator') || createLoader();
    loader.style.display = show ? 'flex' : 'none';
}

function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loadingIndicator';
    loader.innerHTML = `
        <div class="loader"></div>
        <p>Analyse en cours...</p>
    `;
    document.body.appendChild(loader);
    return loader;
}

/* ==================== */
/* PRODUCT PAGE FUNCTIONS */
/* ==================== */
function initProductPage() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProduct();
        });
    }
}

function addProduct() {
    const formData = new FormData(document.getElementById('addProductForm'));
    
    showLoading(true);
    
    fetch('/api/add_product', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showAlert('Produit ajouté avec succès', 'success');
            document.getElementById('addProductForm').reset();
            loadProducts();
        } else {
            showAlert(data.error || 'Erreur lors de l\'ajout du produit', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showAlert('Erreur lors de l\'ajout du produit', 'error');
    })
    .finally(() => showLoading(false));
}

/* ==================== */
/* REVIEWS PAGE FUNCTIONS */
/* ==================== */
function initReviewsPage() {
    const addReviewsForm = document.getElementById('addReviewsForm');
    if (addReviewsForm) {
        addReviewsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addReviews();
        });
    }
    
    const reviewProductSelect = document.getElementById('reviewProductSelect');
    if (reviewProductSelect) {
        reviewProductSelect.addEventListener('change', function() {
            currentReviewPage = 1;
            loadReviews(this.value);
        });
    }
}

function addReviews() {
    const formData = new FormData(document.getElementById('addReviewsForm'));
    
    showLoading(true);
    
    fetch('/api/add_reviews', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showAlert('Avis importés avec succès', 'success');
            document.getElementById('addReviewsForm').reset();
            loadReviews(formData.get('product_id'));
        } else {
            showAlert(data.error || 'Erreur lors de l\'import des avis', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showAlert('Erreur lors de l\'import des avis', 'error');
    })
    .finally(() => showLoading(false));
}

function loadReviews(productId) {
    if (!productId) {
        document.getElementById('reviewsList').innerHTML = '';
        return;
    }

    showLoading(true);
    
    fetch(`/api/reviews/${productId}`)
        .then(response => response.json())
        .then(reviews => {
            allReviews = reviews;
            updateDateFilterOptions(reviews);
            filterReviewsByDate('all');
        })
        .catch(error => {
            console.error('Erreur:', error);
            showAlert('Erreur lors du chargement des avis', 'error');
        })
        .finally(() => showLoading(false));
}

function updateDateFilterOptions(reviews) {
    const dateFilter = document.getElementById('reviewDateFilter');
    if (!dateFilter) return;
    
    dateFilter.innerHTML = '<option value="all">Toutes les dates</option>';
    
    [...new Set(reviews.map(r => r.date_added.split(' ')[0]))]
        .forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateFilter.appendChild(option);
        });
    
    dateFilter.addEventListener('change', (e) => {
        currentReviewPage = 1;
        filterReviewsByDate(e.target.value);
    });
}

function filterReviewsByDate(dateFilter) {
    filteredReviews = dateFilter === 'all' 
        ? [...allReviews] 
        : allReviews.filter(r => r.date_added.startsWith(dateFilter));
    
    currentReviewPage = 1;
    displayReviews();
}

function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    
    if (!reviewsList) return;
    
    const reviewsToShow = filteredReviews.slice(0, currentReviewPage * reviewsPerPage);
    reviewsList.innerHTML = reviewsToShow.length === 0
        ? '<p class="no-reviews">Aucun avis trouvé</p>'
        : reviewsToShow.map(review => `
            <div class="review-item">
                <p>${review.review_text}</p>
                <small>Ajouté le ${review.date_added}</small>
            </div>
        `).join('');
    
    if (loadMoreBtn) {
        loadMoreBtn.style.display = filteredReviews.length > reviewsToShow.length ? 'block' : 'none';
        loadMoreBtn.onclick = () => {
            currentReviewPage++;
            displayReviews();
            reviewsList.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
        };
    }
}

/* ==================== */
/* PRODUCT LOADING FUNCTION */
/* ==================== */
function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            updateProductsList(products);
            updateProductSelects(products);
        })
        .catch(error => {
            console.error('Erreur:', error);
            showAlert('Erreur lors du chargement des produits', 'error');
        });
}

function updateProductsList(products) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="/api/uploads/images/${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <span class="category">${product.category}</span>
                <p>${product.description}</p>
                <small>Ajouté le ${product.date_added}</small>
            </div>
        </div>
    `).join('');
}

function updateProductSelects(products) {
    const selects = [
        document.getElementById('productSelect'),
        document.getElementById('reviewProductSelect'),
        document.getElementById('analysisProductSelect')
    ].filter(Boolean);
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Sélectionnez un produit</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product._id;
            option.textContent = product.name;
            option.dataset.category = product.category;
            option.dataset.image = product.image;
            select.appendChild(option);
        });
    });
}
