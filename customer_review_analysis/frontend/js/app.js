// Global conditional variables
let sentimentChart, trendsChart, topicsChart, combinedChart;
const sentimentColors = {
    positive: '#04a4ed',
    neutral: '#666666',
    negative: '#fe3f40'
};
let currentWordFilter = 'all';
// Variables for pagination (only needed for avis.html)
let currentReviewPage = 1;
const reviewsPerPage = 5;
let allReviews = [];
let filteredReviews = [];

// Variables for analysis results (only needed for analyse.html)
let allSentimentResults = [];
let showingAllSentiments = false;

document.addEventListener('DOMContentLoaded', function() {
    // Common initialization for all pages
    loadProducts();
    
    // Detect current page
    const path = window.location.pathname.split('/').pop();
    
    // Page-specific initialization
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

// Topics chart initialization function
function initTopicsChart() {
    const ctx = document.getElementById('topicsChart');
    if (!ctx) return;
    
    topicsChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Topics Distribution',
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
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

// Function to load topics data
async function loadTopicDistribution(productId) {
    try {
        const response = await fetch(`/api/topic_distribution/${productId}`);
        const topicData = await response.json();
        
        if (!topicsChart) return;
        
        const labels = topicData.map(item => 
            item.topic === 'price' ? 'Price' :
            item.topic === 'service' ? 'Service' :
            item.topic === 'quality' ? 'Quality' : 'Delivery'
        );
        const data = topicData.map(item => item.percentage);
        
        topicsChart.data.labels = labels;
        topicsChart.data.datasets[0].data = data;
        topicsChart.update();
        
    } catch (error) {
        console.error("Error loading topics:", error);
        showAlert('Error loading topics', 'error');
    }
}

function initCombinedChart() {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;
    
    combinedChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Price', 'Service', 'Quality', 'Delivery'],
            datasets: [
                {
                    label: 'Positive',
                    data: [],
                    backgroundColor: sentimentColors.positive,
                    borderColor: sentimentColors.positive,
                    borderWidth: 1
                },
                {
                    label: 'Neutral',
                    data: [],
                    backgroundColor: sentimentColors.neutral,
                    borderColor: sentimentColors.neutral,
                    borderWidth: 1
                },
                {
                    label: 'Negative',
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
                        text: 'Number of reviews'
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
        const response = await fetch(`/api/combined_sentiment_topic/${productId}?nocache=${Date.now()}`);
        const combinedData = await response.json();
        
        if (!combinedChart) return;
        
        // Update chart data
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
        console.error("Error loading combined data:", error);
        showAlert('Error loading sentiment/topic correlation', 'error');
    }
}

/* Main functions */
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
                    select.innerHTML = '<option value="">Select a product</option>';
                }
            });
            
            products.forEach(product => {
                // Product card
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
                            <small>Added on ${product.date_added}</small>
                        </div>
                    `;
                    productsList.appendChild(productCard);
                }
                
                // Dropdown menu options
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
            console.error('Error:', error);
            showAlert('Error loading products', 'error');
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
            showAlert('Product added successfully', 'success');
            document.getElementById('addProductForm').reset();
            loadProducts();
        } else {
            showAlert(data.error || 'Error adding product', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error adding product', 'error');
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
        showAlert('Please select a product and a file', 'warning');
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
            showAlert('Reviews imported successfully', 'success');
            document.getElementById('addReviewsForm').reset();
            loadReviews(productId);
        } else {
            showAlert(data.error || 'Error importing reviews', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error importing reviews', 'error');
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
            console.error('Error:', error);
            showAlert('Error loading reviews', 'error');
        })
        .finally(() => showLoading(false));
}

function updateDateFilterOptions(reviews) {
    const dateFilter = document.getElementById('reviewDateFilter');
    if (!dateFilter) return;
    
    const uniqueDates = [...new Set(reviews.map(review => review.date_added.split(' ')[0]))];
    
    dateFilter.innerHTML = '<option value="all">All dates</option>';
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
        reviewsList.innerHTML = '<p class="no-reviews">No reviews found</p>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    reviewsToShow.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <p>${review.review_text}</p>
            <small>Added on ${review.date_added}</small>
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
        showAlert('Please select a product', 'warning');
        return;
    }
    
    showingAllSentiments = false;
    const showAllBtn = document.getElementById('showAllReviews');
    if (showAllBtn) showAllBtn.style.display = 'none';
    
    showLoading(true);
    
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
            // Calculer les comptes de sentiment
            const counts = {
                positive: data.sentiment_results.filter(r => r.sentiment === 'positive').length,
                neutral: data.sentiment_results.filter(r => r.sentiment === 'neutral').length,
                negative: data.sentiment_results.filter(r => r.sentiment === 'negative').length
            };
            
            // Mettre à jour les graphiques et statistiques
            updateSentimentChart(counts);
            updateSentimentStats(counts);
            
            displaySentimentResults(data.sentiment_results);
            loadWordCloud(productId);
            loadSentimentTrends(productId);
            loadStrengthsWeaknesses(productId);
            loadSummaryHistory(productId);
            
            updateKPIs(productId, data.sentiment_results);
            
            return fetch('/api/topic_classification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ product_id: productId })
            });
        } else {
            throw new Error(data.error || 'Error in sentiment analysis');
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.topic_results) {
            loadTopicDistribution(productId);
            loadCombinedSentimentTopic(productId);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert(error.message || 'Analysis error', 'error');
    })
    .finally(() => showLoading(false));
}

// New function to update KPIs
async function updateKPIs(productId, sentimentResults) {
    try {
        // KPI 1: Total reviews count
        const reviewsCount = sentimentResults.length;
        document.getElementById('totalReviews').textContent = reviewsCount;
        
        // KPI 2: Sentiment score (positive percentage)
        const positiveCount = sentimentResults.filter(r => r.sentiment === 'positive').length;
        const sentimentScore = Math.round((positiveCount / reviewsCount) * 100);
        document.getElementById('sentimentScore').textContent = `${sentimentScore}%`;
        document.getElementById('sentimentProgress').style.width = `${sentimentScore}%`;
        
        // KPI 3: Get topic distribution
        const topicResponse = await fetch(`/api/topic_distribution/${productId}`);
        const topicData = await topicResponse.json();
        
        if (topicData.length > 0) {
            // Find main topic
            const mainTopic = topicData.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
            
            document.getElementById('mainTopic').textContent = 
                mainTopic.topic === 'price' ? 'Price' :
                mainTopic.topic === 'service' ? 'Service' :
                mainTopic.topic === 'quality' ? 'Quality' : 'Delivery';
                
            document.getElementById('topicPercentage').textContent = 
                `${mainTopic.percentage}% of reviews`;
        }
        
        // KPI 4: Response rate (simulated - adapt according to your business logic)
        document.getElementById('responseRate').textContent = '75%';
        
    } catch (error) {
        console.error("Error updating KPIs:", error);
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
        
        const reviewCard = document.createElement('div');
        reviewCard.className = `review-card ${result.sentiment}`;
        reviewCard.style.animationDelay = `${index * 0.1}s`;
        
        // Function to parse dates in different formats
        const parseReviewDate = (dateStr) => {
            if (!dateStr) return new Date();
            
            // Format 1: DD-MM-YYYY HH:mm:ss (your original format)
            const format1 = dateStr.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
            if (format1) {
                return new Date(
                    `${format1[3]}-${format1[2]}-${format1[1]}T${format1[4]}:${format1[5]}:${format1[6]}`
                );
            }
            
            // Format 2: ISO timestamp (default MongoDB format)
            if (dateStr.includes('T') && dateStr.includes('Z')) {
                return new Date(dateStr);
            }
            
            // Format 3: Other formats that JavaScript can parse directly
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
            
            // If no format matches, return current date
            console.warn(`Unrecognized date format: ${dateStr}`);
            return new Date();
        };
        
        // Parse dates
        const analysisDate = parseReviewDate(result.analysis_date_review || result.analysis_date);
        const addedDate = parseReviewDate(result.date_added);
        
        // Format dates for display
        const formatDateForDisplay = (date) => {
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        const formattedAnalysisDate = formatDateForDisplay(analysisDate);
        const formattedAddedDate = formatDateForDisplay(addedDate);
        
        // Create card content
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-sentiment">
                    <span class="sentiment-badge ${result.sentiment}">
                        <i class="fas fa-${result.sentiment === 'positive' ? 'smile' : 
                                          result.sentiment === 'neutral' ? 'meh' : 'frown'}"></i>
                        ${result.sentiment === 'positive' ? 'Positive' : 
                           result.sentiment === 'neutral' ? 'Neutral' : 'Negative'}
                    </span>
                    ${result.topic ? `<span class="topic-tag">${formatTopic(result.topic)}</span>` : ''}
                </div>
                <div class="review-date">Added on ${formattedAddedDate}</div>
            </div>
            
            <div class="review-text">
                <p>${result.review_text}</p>
            </div>
            
            <div class="review-probabilities">
                <div class="probability-item positive">
                    <div class="probability-value">${(result.probabilities.positive * 100).toFixed(1)}%</div>
                    <div class="probability-label">Positive</div>
                </div>
                <div class="probability-item neutral">
                    <div class="probability-value">${(result.probabilities.neutral * 100).toFixed(1)}%</div>
                    <div class="probability-label">Neutral</div>
                </div>
                <div class="probability-item negative">
                    <div class="probability-value">${(result.probabilities.negative * 100).toFixed(1)}%</div>
                    <div class="probability-label">Negative</div>
                </div>
            </div>
            
            <div class="review-footer">
                <span>Analyzed on ${formattedAnalysisDate}</span>
                ${result.confidence ? 
                  `<span>Confidence: ${(result.confidence * 100).toFixed(1)}%</span>` : 
                  ''}
            </div>
        `;
        
        sentimentDetails.appendChild(reviewCard);
    });
    
    // Update sentiment statistics
    updateSentimentStats({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
    
    // Update sentiment chart
    updateSentimentChart({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
    
    // Handle "Show more/Show less" button
    if (showAllBtn) {
        if (allSentimentResults.length > 3) {
            showAllBtn.style.display = 'block';
            showAllBtn.innerHTML = showingAllSentiments ? 
                '<i class="fas fa-eye-slash"></i> Show less' : 
                '<i class="fas fa-eye"></i> Show all';
            showAllBtn.onclick = () => {
                showingAllSentiments = !showingAllSentiments;
                displaySentimentResults(allSentimentResults);
            };
        } else {
            showAllBtn.style.display = 'none';
        }
    }
}

// Utility function to format topics
function formatTopic(topic) {
    return topic === 'price' ? 'Price' : 
           topic === 'service' ? 'Service' : 
           topic === 'quality' ? 'Quality' : 
           topic === 'delivery' ? 'Delivery' : topic;
}

/* Visualization functions */
function initCharts() {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) return;
    
    sentimentChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
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
                    label: 'Positive',
                    data: [],
                    backgroundColor: 'rgba(4, 164, 237, 0.1)',
                    borderColor: sentimentColors.positive,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Neutral',
                    data: [],
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderColor: sentimentColors.neutral,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Negative',
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
                        text: 'Percentage (%)'
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
    
    const total = counts.positive + counts.neutral + counts.negative;
    if (total === 0) return;
    
    const positivePercent = Math.round((counts.positive / total) * 100);
    const neutralPercent = Math.round((counts.neutral / total) * 100);
    const negativePercent = Math.round((counts.negative / total) * 100);
    
    sentimentChart.data.datasets[0].data = [
        positivePercent,
        neutralPercent,
        negativePercent
    ];
    sentimentChart.update();
}

function updateSentimentStats(counts) {
    const total = counts.positive + counts.neutral + counts.negative;
    if (total === 0) return;
    
    const positivePercent = Math.round((counts.positive / total) * 100);
    const neutralPercent = Math.round((counts.neutral / total) * 100);
    const negativePercent = Math.round((counts.negative / total) * 100);
    
    // Mettre à jour les éléments HTML
    document.getElementById('positivePercent').textContent = `${positivePercent}%`;
    document.getElementById('neutralPercent').textContent = `${neutralPercent}%`;
    document.getElementById('negativePercent').textContent = `${negativePercent}%`;
    
    // Mettre à jour les comptes
    document.querySelectorAll('.stat.positive .count').forEach(el => el.textContent = counts.positive);
    document.querySelectorAll('.stat.neutral .count').forEach(el => el.textContent = counts.neutral);
    document.querySelectorAll('.stat.negative .count').forEach(el => el.textContent = counts.negative);
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
                    size: 8 + (count * 0.5),  // Reduced from 10+0.8 to 8+0.5
                    sentiment: sentiment,
                    visible: true
                });
            });
        });
        
        renderWordCloud(allWords, wordcloud, width, height);
        
        // Add event handlers for filters
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentWordFilter = this.dataset.filter;
                
                allWords.forEach(word => {
                    word.visible = currentWordFilter === 'all' || word.sentiment === currentWordFilter;
                });
                
                wordcloud.innerHTML = '';
                renderWordCloud(allWords, wordcloud, width, height);
            });
        });
        
    } catch (error) {
        console.error("Error loading word cloud:", error);
        showAlert('Error loading keywords', 'error');
    }
}

function renderWordCloud(words, container, width, height) {
    const placedWords = [];
    
    words.filter(word => word.visible).forEach((wordObj) => {
        const wordElement = document.createElement('div');
        wordElement.className = `word ${wordObj.sentiment}`;
        wordElement.textContent = wordObj.text;
        wordElement.style.fontSize = `${wordObj.size}px`;
        
        wordElement.style.visibility = 'hidden';
        container.appendChild(wordElement);
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
                container.appendChild(wordElement);
                
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
            container.appendChild(wordElement);
        }
        
        wordElement.title = `${wordObj.text} (${wordObj.sentiment})`;
    });
}

async function loadSentimentTrends(productId) {
    try {
        if (!trendsChart) return;
        
        const response = await fetch(`/api/sentiment_trends/${productId}?nocache=${Date.now()}`);
        const trendsData = await response.json();
        
        if (!trendsData.dates || !trendsData.positive || !trendsData.neutral || !trendsData.negative) {
            throw new Error("Invalid data format");
        }
        
        trendsChart.data.labels = trendsData.dates;
        trendsChart.data.datasets[0].data = trendsData.positive;
        trendsChart.data.datasets[1].data = trendsData.neutral;
        trendsChart.data.datasets[2].data = trendsData.negative;
        
        trendsChart.options.scales.y.max = 100;
        trendsChart.options.scales.y.title.text = 'Percentage (%)';
        trendsChart.options.plugins.tooltip.callbacks = {
            label: function(context) {
                return `${context.dataset.label}: ${context.raw}%`;
            }
        };
        
        trendsChart.update();
        
    } catch (error) {
        console.error("Error loading trends:", error);
        showAlert('Error loading trends: ' + error.message, 'error');
    }
}

/* Utility functions */
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
        <p>Analyzing...</p>
    `;
    document.body.appendChild(loader);
    return loader;
}

// Main function to load strengths/weaknesses
async function loadStrengthsWeaknesses(productId) {
    try {
        const response = await fetch(`/api/combined_sentiment_topic/${productId}`);
        const combinedData = await response.json();
        
        const topicStats = calculateTopicStats(combinedData);
        const strengths = identifyStrengths(topicStats);
        const weaknesses = identifyWeaknesses(topicStats);
        
        displayStrengthsWeaknesses(strengths, weaknesses);
    } catch (error) {
        console.error("Error loading analysis:", error);
        document.getElementById('strengthsList').innerHTML = 
            '<div class="sw-error">Error loading strengths</div>';
        document.getElementById('weaknessesList').innerHTML = 
            '<div class="sw-error">Error loading weaknesses</div>';
    }
}

// Calculate statistics by topic
function calculateTopicStats(combinedData) {
    const topics = ['price', 'service', 'quality', 'delivery'];
    const stats = {};
    
    topics.forEach(topic => {
        const total = combinedData[topic].positive + combinedData[topic].neutral + combinedData[topic].negative;
        
        if (total >= 5) { // Minimum threshold of 5 reviews to be considered
            stats[topic] = {
                positive: (combinedData[topic].positive / total) * 100,
                negative: (combinedData[topic].negative / total) * 100,
                total: total
            };
        }
    });
    
    return stats;
}

// Identify strengths
function identifyStrengths(topicStats) {
    const strengths = [];
    
    for (const [topic, stats] of Object.entries(topicStats)) {
        if (stats.positive >= 30) { // Threshold at 40% positive
            strengths.push({
                topic: topic,
                percent: Math.round(stats.positive),
                count: Math.round((stats.positive / 100) * stats.total),
                total: stats.total
            });
        }
    }
    
    return strengths.sort((a, b) => b.percent - a.percent).slice(0, 3); // Top 3
}

// Identify weaknesses
function identifyWeaknesses(topicStats) {
    const weaknesses = [];
    
    for (const [topic, stats] of Object.entries(topicStats)) {
        if (stats.negative >= 45) { // Threshold at 45% negative
            weaknesses.push({
                topic: topic,
                percent: Math.round(stats.negative),
                count: Math.round((stats.negative / 100) * stats.total),
                total: stats.total
            });
        }
    }
    
    return weaknesses.sort((a, b) => b.percent - a.percent).slice(0, 3); // Top 3
}

// Display results
function displayStrengthsWeaknesses(strengths, weaknesses) {
    const strengthsList = document.getElementById('strengthsList');
    const weaknessesList = document.getElementById('weaknessesList');
    
    // Display strengths
    if (strengths.length > 0) {
        strengthsList.innerHTML = strengths.map(item => `
            <div class="sw-item">
                <span class="sw-topic">${formatTopic(item.topic)}</span>
                <div class="sw-details">
                    <span class="sw-percent">${item.percent}%</span>
                    <span class="sw-count">${item.count}/${item.total} reviews</span>
                </div>
            </div>
        `).join('');
    } else {
        strengthsList.innerHTML = '<div class="sw-placeholder">No significant strengths</div>';
    }
    
    // Display weaknesses
    if (weaknesses.length > 0) {
        weaknessesList.innerHTML = weaknesses.map(item => `
            <div class="sw-item">
                <span class="sw-topic">${formatTopic(item.topic)}</span>
                <div class="sw-details">
                    <span class="sw-percent">${item.percent}%</span>
                    <span class="sw-count">${item.count}/${item.total} reviews</span>
                </div>
            </div>
        `).join('');
    } else {
        weaknessesList.innerHTML = '<div class="sw-placeholder">No significant weaknesses</div>';
    }
}


// Add event listener for the summary button

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Modifier la fonction generateSummary pour gérer les deux boutons séparément
document.getElementById('generateSummaryBtn')?.addEventListener('click', debounce(generateSummary, 1000));
document.getElementById('generateRecommendationsBtn')?.addEventListener('click', debounce(generateRecommendations, 1000));

async function generateSummary() {
    const productId = document.getElementById('analysisProductSelect').value;
    if (!productId) {
        showAlert('Please select a product first', 'warning');
        return;
    }

    const btn = document.getElementById('generateSummaryBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    showLoading(true);

    try {
        const response = await fetch('/api/generate_summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `product_id=${productId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            const summaryContainer = document.getElementById('summaryText');
            summaryContainer.innerHTML = `
                <div class="ai-generated-content">
                    <p>${data.summary.replace(/\n/g, '<br>')}</p>
                    <div class="summary-meta">
                        <small>Generated on ${new Date().toLocaleString()}</small>
                    </div>
                </div>
            `;
            
            // Ajouter une animation de confirmation
            showAlert('Summary generated successfully!', 'success');
        } else {
            throw new Error(data.error || 'Generation failed');
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file-alt"></i> Generate Summary';
        showLoading(false);
    }
}

async function generateRecommendations() {
    const productId = document.getElementById('analysisProductSelect').value;
    if (!productId) {
        showAlert('Please select a product first', 'warning');
        return;
    }

    const btn = document.getElementById('generateRecommendationsBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    showLoading(true);
    
    try {
        const response = await fetch('/api/generate_recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `product_id=${productId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            const recommendationsList = document.getElementById('recommendationsText');
            recommendationsList.innerHTML = '';
            
            if (data.recommendations) {
                // Split recommendations and format them
                const recommendations = data.recommendations.split(/\n|•/).map(item => item.trim()).filter(item => item);
                
                recommendations.forEach((rec, index) => {
                    const li = document.createElement('li');
                    li.className = 'ai-generated-content';
                    li.style.animationDelay = `${index * 0.1}s`;
                    li.innerHTML = `
                        <div class="recommendation-content">
                            <div class="recommendation-icon">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="recommendation-text">${rec}</div>
                        </div>
                    `;
                    recommendationsList.appendChild(li);
                });
            } else {
                recommendationsList.innerHTML = `
                    <li class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>No recommendations could be generated.</p>
                    </li>
                `;
            }

            loadSummaryHistory(productId);
            showAlert('Recommendations generated successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to generate recommendations');
        }
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lightbulb"></i> Generate Recommendations';
        showLoading(false);
    }
}
// Ajoutez ces fonctions pour gérer les boutons de copie et d'export
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-copy')) {
            const targetId = e.target.closest('.btn-copy').getAttribute('data-target');
            const content = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(content.trim())
                .then(() => showAlert('Copied to clipboard!', 'success'))
                .catch(() => showAlert('Failed to copy', 'error'));
        }
        
        if (e.target.closest('.btn-export')) {
            const targetId = e.target.closest('.btn-export').getAttribute('data-target');
            const content = document.getElementById(targetId).textContent;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recommendations.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
});



async function loadSummaryHistory(productId) {
    try {
        const response = await fetch(`/api/get_summaries/${productId}`);
        const summaries = await response.json();
        
        const historyList = document.getElementById('summaryHistoryList');
        const historySection = document.querySelector('.summary-history');
        
        // Si les éléments n'existent pas, on sort de la fonction
        if (!historyList || !historySection) return;
        
        if (!summaries || summaries.length === 0) {
            historySection.style.display = 'none';
            return;
        }
        
        historyList.innerHTML = '';
        
        // Skip the first one (it's the current one)
        const previousSummaries = summaries.slice(1);
        
        if (previousSummaries.length > 0) {
            historySection.style.display = 'block';
            
            previousSummaries.forEach(summary => {
                const item = document.createElement('div');
                item.className = 'summary-history-item';
                item.innerHTML = `
                    <h5>${summary.product_name}</h5>
                    <div class="summary-history-date">
                        ${new Date(summary.analysis_date).toLocaleString()}
                    </div>
                    <p><strong>Summary:</strong> ${summary.summary || 'N/A'}</p>
                    <p><strong>Recommendations:</strong> ${summary.recommendations || 'N/A'}</p>
                `;
                historyList.appendChild(item);
            });
        } else {
            historySection.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading summary history:', error);
    }
}


// Table of Contents Interaction
document.addEventListener('DOMContentLoaded', () => {
    const tocItems = document.querySelectorAll('.toc-item');
    const sections = document.querySelectorAll('.summary-section');

    tocItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            tocItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Scroll to the corresponding section
            const sectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Highlight active section on scroll
    window.addEventListener('scroll', () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        tocItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === currentSection) {
                item.classList.add('active');
            }
        });
    });
});