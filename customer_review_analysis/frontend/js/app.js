// Variables globales conditionnelles
let sentimentChart, trendsChart, topicsChart, combinedChart;
const sentimentColors = {
    positive: '#04a4ed',
    neutral: '#666666',
    negative: '#fe3f40'
};

// Variables pour la pagination (uniquement nécessaires pour avis.html)
let currentReviewPage = 1;
const reviewsPerPage = 5;
let allReviews = [];
let filteredReviews = [];

// Variables pour les résultats d'analyse (uniquement nécessaires pour analyse.html)
let allSentimentResults = [];
let showingAllSentiments = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation commune à toutes les pages
    loadProducts();
    
    // Détecter la page actuelle
    const path = window.location.pathname.split('/').pop();
    
    // Initialisation spécifique à chaque page
    if (path === 'produit.html' || path === '') {
        initProductPage();
    } else if (path === 'avis.html') {
        initReviewsPage();
    } else if (path === 'analyse.html') {
        initAnalysisPage();
    }
});

function initProductPage() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProduct();
        });
    }
}

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
    
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

function initAnalysisPage() {
    initCharts();
    initTrendsChart();
    initTopicsChart();
    initCombinedChart();
    
    const sentimentAnalysisForm = document.getElementById('sentimentAnalysisForm');
    if (sentimentAnalysisForm) {
        sentimentAnalysisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            analyzeSentiment();
        });
    }
    
    const showAllBtn = document.getElementById('showAllReviews');
    if (showAllBtn) {
        showAllBtn.style.display = 'none';
    }
}

// Fonction d'initialisation du graphique des topics
function initTopicsChart() {
    const ctx = document.getElementById('topicsChart');
    if (!ctx) return;
    
    topicsChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Distribution des Thématiques',
                data: [],
                backgroundColor: [
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#36A2EB'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
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

// Fonction de chargement des données des topics
async function loadTopicDistribution(productId) {
    try {
        const response = await fetch(`/api/topic_distribution/${productId}`);
        const topicData = await response.json();
        
        if (!topicsChart) return;
        
        const labels = topicData.map(item => 
            item.topic === 'price' ? 'Prix' :
            item.topic === 'service' ? 'Service' :
            item.topic === 'quality' ? 'Qualité' : 'Livraison'
        );
        const data = topicData.map(item => item.percentage);
        
        topicsChart.data.labels = labels;
        topicsChart.data.datasets[0].data = data;
        topicsChart.update();
        
    } catch (error) {
        console.error("Erreur lors du chargement des topics:", error);
        showAlert('Erreur lors du chargement des thématiques', 'error');
    }
}

function initCombinedChart() {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;
    
    combinedChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Prix', 'Service', 'Qualité', 'Livraison'],
            datasets: [
                {
                    label: 'Positif',
                    data: [],
                    backgroundColor: sentimentColors.positive,
                    borderColor: sentimentColors.positive,
                    borderWidth: 1
                },
                {
                    label: 'Neutre',
                    data: [],
                    backgroundColor: sentimentColors.neutral,
                    borderColor: sentimentColors.neutral,
                    borderWidth: 1
                },
                {
                    label: 'Négatif',
                    data: [],
                    backgroundColor: sentimentColors.negative,
                    borderColor: sentimentColors.negative,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'avis'
                    }
                },
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}

async function loadCombinedSentimentTopic(productId) {
    try {
        const response = await fetch(`/api/combined_sentiment_topic/${productId}`);
        const combinedData = await response.json();
        
        if (!combinedChart) return;
        
        // Mettre à jour les données du graphique
        combinedChart.data.datasets[0].data = [
            combinedData.price.positive,
            combinedData.service.positive,
            combinedData.quality.positive,
            combinedData.delivery.positive
        ];
        
        combinedChart.data.datasets[1].data = [
            combinedData.price.neutral,
            combinedData.service.neutral,
            combinedData.quality.neutral,
            combinedData.delivery.neutral
        ];
        
        combinedChart.data.datasets[2].data = [
            combinedData.price.negative,
            combinedData.service.negative,
            combinedData.quality.negative,
            combinedData.delivery.negative
        ];
        
        combinedChart.update();
        
    } catch (error) {
        console.error("Erreur lors du chargement des données combinées:", error);
        showAlert('Erreur lors du chargement de la corrélation thématique/sentiment', 'error');
    }
}

/* Fonctions principales */
function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const productsList = document.getElementById('productsList');
            const productSelects = [
                document.getElementById('productSelect'),
                document.getElementById('reviewProductSelect'),
                document.getElementById('analysisProductSelect')
            ].filter(el => el !== null);
            
            if (productsList) {
                productsList.innerHTML = '';
            }
            
            productSelects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Sélectionnez un produit</option>';
                }
            });
            
            products.forEach(product => {
                // Carte produit
                if (productsList) {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="/api/uploads/images/${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <span class="category">${product.category}</span>
                            <p>${product.description}</p>
                            <small>Ajouté le ${product.date_added}</small>
                        </div>
                    `;
                    productsList.appendChild(productCard);
                }
                
                // Options des menus déroulants
                productSelects.forEach(select => {
                    if (select) {
                        const option = document.createElement('option');
                        option.value = product._id;
                        option.textContent = product.name;
                        select.appendChild(option);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
            showAlert('Erreur lors du chargement des produits', 'error');
        });
}

function addProduct() {
    const name = document.getElementById('name');
    const category = document.getElementById('category');
    const description = document.getElementById('description');
    const image = document.getElementById('image');
    
    if (!name || !category || !description || !image) return;
    
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('category', category.value);
    formData.append('description', description.value);
    formData.append('image', image.files[0]);
    
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

function addReviews() {
    const productSelect = document.getElementById('productSelect');
    const reviewsFile = document.getElementById('reviewsFile');
    
    if (!productSelect || !reviewsFile) return;
    
    const productId = productSelect.value;
    const file = reviewsFile.files[0];
    
    if (!productId || !file) {
        showAlert('Veuillez sélectionner un produit et un fichier', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('file', file);
    
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
            loadReviews(productId);
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
        const reviewsList = document.getElementById('reviewsList');
        const loadMoreBtn = document.getElementById('loadMoreReviews');
        
        if (reviewsList) reviewsList.innerHTML = '';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
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
    
    const uniqueDates = [...new Set(reviews.map(review => review.date_added.split(' ')[0]))];
    
    dateFilter.innerHTML = '<option value="all">Toutes les dates</option>';
    uniqueDates.forEach(date => {
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
    if (dateFilter === 'all') {
        filteredReviews = [...allReviews];
    } else {
        filteredReviews = allReviews.filter(review => 
            review.date_added.startsWith(dateFilter)
        );
    }
    
    currentReviewPage = 1;
    displayReviews();
}

function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    
    if (!reviewsList) return;
    
    const reviewsToShow = filteredReviews.slice(0, currentReviewPage * reviewsPerPage);
    
    reviewsList.innerHTML = '';
    
    if (reviewsToShow.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">Aucun avis trouvé</p>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    reviewsToShow.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <p>${review.review_text}</p>
            <small>Ajouté le ${review.date_added}</small>
        `;
        reviewsList.appendChild(reviewItem);
    });
    
    if (loadMoreBtn) {
        if (filteredReviews.length > reviewsToShow.length) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.onclick = () => {
                currentReviewPage++;
                displayReviews();
                setTimeout(() => {
                    if (reviewsList.lastElementChild) {
                        reviewsList.lastElementChild.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            };
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

function analyzeSentiment() {
    const analysisProductSelect = document.getElementById('analysisProductSelect');
    if (!analysisProductSelect) return;
    
    const productId = analysisProductSelect.value;
    
    if (!productId) {
        showAlert('Veuillez sélectionner un produit', 'warning');
        return;
    }
    
    showingAllSentiments = false;
    const showAllBtn = document.getElementById('showAllReviews');
    if (showAllBtn) showAllBtn.style.display = 'none';
    
    showLoading(true);
    
    // D'abord l'analyse de sentiment
    fetch('/api/sentiment_analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sentiment_results) {
            displaySentimentResults(data.sentiment_results);
            loadWordCloud(productId);
            loadSentimentTrends(productId);
            
            // Mettre à jour les KPI
            updateKPIs(productId, data.sentiment_results);
            
            // Ensuite l'analyse thématique sur les mêmes avis
            return fetch('/api/topic_classification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ product_id: productId })
            });
        } else {
            throw new Error(data.error || 'Erreur lors de l\'analyse de sentiment');
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.topic_results) {
            // Charger les visualisations thématiques
            loadTopicDistribution(productId);
            loadCombinedSentimentTopic(productId);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showAlert(error.message || 'Erreur lors de l\'analyse', 'error');
    })
    .finally(() => showLoading(false));
}

// Nouvelle fonction pour mettre à jour les KPI
async function updateKPIs(productId, sentimentResults) {
    try {
        // KPI 1: Nombre total d'avis
        const reviewsCount = sentimentResults.length;
        document.getElementById('totalReviews').textContent = reviewsCount;
        
        // KPI 2: Score de sentiment (pourcentage positif)
        const positiveCount = sentimentResults.filter(r => r.sentiment === 'positive').length;
        const sentimentScore = Math.round((positiveCount / reviewsCount) * 100);
        document.getElementById('sentimentScore').textContent = `${sentimentScore}%`;
        document.getElementById('sentimentProgress').style.width = `${sentimentScore}%`;
        
        // KPI 3: Récupérer la distribution des thèmes
        const topicResponse = await fetch(`/api/topic_distribution/${productId}`);
        const topicData = await topicResponse.json();
        
        if (topicData.length > 0) {
            // Trouver le thème principal
            const mainTopic = topicData.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
            
            document.getElementById('mainTopic').textContent = 
                mainTopic.topic === 'price' ? 'Prix' :
                mainTopic.topic === 'service' ? 'Service' :
                mainTopic.topic === 'quality' ? 'Qualité' : 'Livraison';
                
            document.getElementById('topicPercentage').textContent = 
                `${mainTopic.percentage}% des avis`;
        }
        
        // KPI 4: Taux de réponse (simulé - à adapter selon votre logique métier)
        document.getElementById('responseRate').textContent = '75%';
        
    } catch (error) {
        console.error("Erreur lors de la mise à jour des KPI:", error);
    }
}

function displaySentimentResults(results) {
    const sentimentDetails = document.getElementById('sentimentDetails');
    const showAllBtn = document.getElementById('showAllReviews');
    
    if (!sentimentDetails) return;
    
    allSentimentResults = results;
    const resultsToShow = showingAllSentiments ? allSentimentResults : allSentimentResults.slice(0, 3);
    
    sentimentDetails.innerHTML = '';
    
    const counts = {
        positive: 0,
        neutral: 0,
        negative: 0
    };
    
    resultsToShow.forEach((result, index) => {
        counts[result.sentiment]++;
        
        const sentimentItem = document.createElement('div');
        sentimentItem.className = `sentiment-item ${result.sentiment}`;
        sentimentItem.innerHTML = `
            <div class="sentiment-text">
                <p>${result.review_text}</p>
                <small>Analyse effectuée le ${result.analysis_date}</small>
            </div>
            <div class="sentiment-probabilities">
                <div class="probability positive">
                    <span>${(result.probabilities.positive * 100).toFixed(1)}%</span>
                    <div>Positif</div>
                </div>
                <div class="probability neutral">
                    <span>${(result.probabilities.neutral * 100).toFixed(1)}%</span>
                    <div>Neutre</div>
                </div>
                <div class="probability negative">
                    <span>${(result.probabilities.negative * 100).toFixed(1)}%</span>
                    <div>Négatif</div>
                </div>
            </div>
        `;
        sentimentItem.style.animationDelay = `${index * 0.1}s`;
        sentimentDetails.appendChild(sentimentItem);
    });
    
    if (showAllBtn) {
        if (allSentimentResults.length > 3) {
            showAllBtn.style.display = 'block';
            showAllBtn.textContent = showingAllSentiments ? 'Voir moins' : 'Voir tout';
            showAllBtn.onclick = () => {
                showingAllSentiments = !showingAllSentiments;
                displaySentimentResults(allSentimentResults);
            };
        } else {
            showAllBtn.style.display = 'none';
        }
    }
    
    updateSentimentStats({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
    
    updateSentimentChart({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
}

/* Fonctions de visualisation */
function initCharts() {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) return;
    
    sentimentChart = new Chart(ctx.getContext('2d'), {
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

function initTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    trendsChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Positif',
                    data: [],
                    backgroundColor: 'rgba(4, 164, 237, 0.1)',
                    borderColor: sentimentColors.positive,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Neutre',
                    data: [],
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderColor: sentimentColors.neutral,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Négatif',
                    data: [],
                    backgroundColor: 'rgba(254, 63, 64, 0.1)',
                    borderColor: sentimentColors.negative,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Pourcentage (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateSentimentChart(counts) {
    if (!sentimentChart) return;
    
    sentimentChart.data.datasets[0].data = [
        counts.positive,
        counts.neutral,
        counts.negative
    ];
    sentimentChart.update();
}

function updateSentimentStats(counts) {
    const total = counts.positive + counts.neutral + counts.negative;
    if (total === 0) return;
    
    const positivePercent = Math.round((counts.positive / total) * 100);
    const neutralPercent = Math.round((counts.neutral / total) * 100);
    const negativePercent = Math.round((counts.negative / total) * 100);
    
    const positiveCount = document.querySelector('.stat.positive .count');
    const neutralCount = document.querySelector('.stat.neutral .count');
    const negativeCount = document.querySelector('.stat.negative .count');
    
    const positivePercentEl = document.getElementById('positivePercent');
    const neutralPercentEl = document.getElementById('neutralPercent');
    const negativePercentEl = document.getElementById('negativePercent');
    
    if (positiveCount) positiveCount.textContent = counts.positive;
    if (neutralCount) neutralCount.textContent = counts.neutral;
    if (negativeCount) negativeCount.textContent = counts.negative;
    
    if (positivePercentEl) positivePercentEl.textContent = `${positivePercent}%`;
    if (neutralPercentEl) neutralPercentEl.textContent = `${neutralPercent}%`;
    if (negativePercentEl) negativePercentEl.textContent = `${negativePercent}%`;
}

async function loadWordCloud(productId) {
    try {
        const wordcloud = document.getElementById('wordcloud');
        if (!wordcloud) return;
        
        const response = await fetch(`/api/word_frequencies/${productId}`);
        const wordData = await response.json();
        
        wordcloud.innerHTML = '';
        
        const width = wordcloud.offsetWidth;
        const height = wordcloud.offsetHeight;
        
        const allWords = [];
        ['positive', 'neutral', 'negative'].forEach(sentiment => {
            const words = wordData[sentiment] || {};
            const wordEntries = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 30);
            
            wordEntries.forEach(([word, count]) => {
                allWords.push({
                    text: word,
                    size: 10 + (count * 0.8),
                    sentiment: sentiment
                });
            });
        });
        
        allWords.sort((a, b) => b.size - a.size);
        const placedWords = [];
        
        allWords.forEach((wordObj) => {
            const wordElement = document.createElement('div');
            wordElement.className = `word ${wordObj.sentiment}`;
            wordElement.textContent = wordObj.text;
            wordElement.style.fontSize = `${wordObj.size}px`;
            
            wordElement.style.visibility = 'hidden';
            wordcloud.appendChild(wordElement);
            const wordWidth = wordElement.offsetWidth;
            const wordHeight = wordElement.offsetHeight;
            wordElement.remove();
            
            let attempts = 0;
            let placed = false;
            
            while (!placed && attempts < 100) {
                attempts++;
                
                const left = Math.random() * (width - wordWidth);
                const top = Math.random() * (height - wordHeight);
                
                let collision = false;
                for (const placedWord of placedWords) {
                    if (
                        left < placedWord.left + placedWord.width &&
                        left + wordWidth > placedWord.left &&
                        top < placedWord.top + placedWord.height &&
                        top + wordHeight > placedWord.top
                    ) {
                        collision = true;
                        break;
                    }
                }
                
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
            
            if (!placed) {
                wordElement.style.left = `${Math.random() * (width - wordWidth)}px`;
                wordElement.style.top = `${Math.random() * (height - wordHeight)}px`;
                wordElement.style.visibility = 'visible';
                wordcloud.appendChild(wordElement);
            }
            
            wordElement.title = `${wordObj.text} (${wordObj.sentiment})`;
        });
        
    } catch (error) {
        console.error("Erreur lors du chargement du word cloud:", error);
        showAlert('Erreur lors du chargement des mots-clés', 'error');
    }
}

async function loadSentimentTrends(productId) {
    try {
        if (!trendsChart) return;
        
        const response = await fetch(`/api/sentiment_trends/${productId}?nocache=${Date.now()}`);
        const trendsData = await response.json();
        
        if (!trendsData.dates || !trendsData.positive || !trendsData.neutral || !trendsData.negative) {
            throw new Error("Format de données invalide");
        }
        
        trendsChart.data.labels = trendsData.dates;
        trendsChart.data.datasets[0].data = trendsData.positive;
        trendsChart.data.datasets[1].data = trendsData.neutral;
        trendsChart.data.datasets[2].data = trendsData.negative;
        
        trendsChart.options.scales.y.max = 100;
        trendsChart.options.scales.y.title.text = 'Pourcentage (%)';
        trendsChart.options.plugins.tooltip.callbacks = {
            label: function(context) {
                return `${context.dataset.label}: ${context.raw}%`;
            }
        };
        
        trendsChart.update();
        
    } catch (error) {
        console.error("Erreur lors du chargement des tendances:", error);
        showAlert('Erreur lors du chargement des tendances: ' + error.message, 'error');
    }
}

/* Fonctions utilitaires */
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
    let loader = document.getElementById('loadingIndicator');
    if (!loader) {
        loader = createLoader();
    }
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