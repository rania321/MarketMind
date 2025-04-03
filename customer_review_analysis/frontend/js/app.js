document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    loadProducts();
    initTrendsChart();
    initCharts();
    
    // Écouteurs d'événements
    document.getElementById('addProductForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
    
    document.getElementById('addReviewsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addReviews();
    });
    
    document.getElementById('sentimentAnalysisForm').addEventListener('submit', function(e) {
        e.preventDefault();
        analyzeSentiment();
    });
    
    document.getElementById('reviewProductSelect').addEventListener('change', function() {
        loadReviews(this.value);
    });
    // Modifiez l'écouteur d'événements pour le changement de produit
document.getElementById('reviewProductSelect').addEventListener('change', function() {
    currentReviewPage = 1;
    loadReviews(this.value);
});

    // Initialiser les graphiques
    initCharts();
});

// Variables globales
let sentimentChart;
let trendsChart;
const sentimentColors = {
    positive: '#04a4ed',
    neutral: '#666666',
    negative: '#fe3f40'
};
let currentReviewPage = 1;
const reviewsPerPage = 5;
let allReviews = [];
let filteredReviews = [];
let allSentimentResults = [];
let showingAllSentiments = false;

function initTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(ctx, {
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
            ];
            
            productsList.innerHTML = '';
            
            productSelects.forEach(select => {
                select.innerHTML = '<option value="">Sélectionnez un produit</option>';
            });
            
            products.forEach(product => {
                // Carte produit
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
                
                // Options des menus déroulants
                productSelects.forEach(select => {
                    const option = document.createElement('option');
                    option.value = product._id;
                    option.textContent = product.name;
                    select.appendChild(option);
                });
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
            showAlert('Erreur lors du chargement des produits', 'error');
        });
}

function addProduct() {
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('image', document.getElementById('image').files[0]);
    
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
    });
}

function addReviews() {
    const productId = document.getElementById('productSelect').value;
    const file = document.getElementById('reviewsFile').files[0];
    
    if (!productId || !file) {
        showAlert('Veuillez sélectionner un produit et un fichier', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('file', file);
    
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
    });
}

// Modifiez la fonction loadReviews pour gérer le filtrage et la pagination
function loadReviews(productId) {
    if (!productId) {
        document.getElementById('reviewsList').innerHTML = '';
        document.getElementById('loadMoreReviews').style.display = 'none';
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

// Ajoutez cette fonction pour mettre à jour les options de filtre de date
function updateDateFilterOptions(reviews) {
    const dateFilter = document.getElementById('reviewDateFilter');
    
    // Récupérer toutes les dates uniques
    const uniqueDates = [...new Set(reviews.map(review => review.date_added.split(' ')[0]))];
    
    // Vider et remplir le select
    dateFilter.innerHTML = '<option value="all">Toutes les dates</option>';
    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
    });
    
    // Ajouter l'écouteur d'événements
    dateFilter.addEventListener('change', (e) => {
        currentReviewPage = 1;
        filterReviewsByDate(e.target.value);
    });
}

// Ajoutez cette fonction pour filtrer les avis par date
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

// Ajoutez cette fonction pour afficher les avis paginés
function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    
    // Calculer les avis à afficher
    const reviewsToShow = filteredReviews.slice(0, currentReviewPage * reviewsPerPage);
    
    // Afficher les avis
    reviewsList.innerHTML = '';
    
    if (reviewsToShow.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">Aucun avis trouvé</p>';
        loadMoreBtn.style.display = 'none';
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
    
    // Gérer le bouton "Voir plus"
    if (filteredReviews.length > reviewsToShow.length) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.onclick = () => {
            currentReviewPage++;
            displayReviews();
            // Faire défiler vers le bas pour voir les nouveaux avis
            setTimeout(() => {
                reviewsList.lastElementChild.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function analyzeSentiment() {
    const productId = document.getElementById('analysisProductSelect').value;
    
    if (!productId) {
        showAlert('Veuillez sélectionner un produit', 'warning');
        return;
    }
    
    // Réinitialiser l'affichage
    showingAllSentiments = false;
    document.getElementById('showAllReviews').style.display = 'none';
    
    showLoading(true);
    
    fetch('/api/sentiment_analysis', {
        method: 'POST',
        body: new URLSearchParams({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sentiment_results) {
            displaySentimentResults(data.sentiment_results);
            loadWordCloud(productId);
            loadSentimentTrends(productId);
        } else {
            showAlert(data.error || 'Erreur lors de l\'analyse de sentiment', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showAlert('Erreur lors de l\'analyse de sentiment', 'error');
    })
    .finally(() => showLoading(false));
}

/* Fonctions d'affichage des résultats */
function displaySentimentResults(results) {
    const sentimentDetails = document.getElementById('sentimentDetails');
    const showAllBtn = document.getElementById('showAllReviews');
    
    // Stocker tous les résultats
    allSentimentResults = results;
    
    // Déterminer combien d'avis afficher
    const resultsToShow = showingAllSentiments ? allSentimentResults : allSentimentResults.slice(0, 3);
    
    sentimentDetails.innerHTML = '';
    
    // Compter les sentiments (pour les statistiques)
    const counts = {
        positive: 0,
        neutral: 0,
        negative: 0
    };
    
    // Afficher les avis sélectionnés
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
    
    // Gérer le bouton "Voir tout"/"Voir moins"
    if (allSentimentResults.length > 3) {
        showAllBtn.style.display = 'block';
        showAllBtn.textContent = showingAllSentiments ? 'Voir moins' : 'Voir tout';
        showAllBtn.onclick = () => {
            showingAllSentiments = !showingAllSentiments;
            displaySentimentResults(allSentimentResults); // Réafficher avec le nouvel état
        };
    } else {
        showAllBtn.style.display = 'none';
    }
    
    // Mettre à jour les statistiques globales
    updateSentimentStats({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
    
    // Mettre à jour le graphique avec toutes les données
    updateSentimentChart({
        positive: allSentimentResults.filter(r => r.sentiment === 'positive').length,
        neutral: allSentimentResults.filter(r => r.sentiment === 'neutral').length,
        negative: allSentimentResults.filter(r => r.sentiment === 'negative').length
    });
}

/* Fonctions de visualisation */
function initCharts() {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
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
     // Initialiser le bouton "Voir tout"
     document.getElementById('showAllReviews').style.display = 'none';
     document.getElementById('showAllReviews').onclick = null;
}

function updateSentimentChart(counts) {
    sentimentChart.data.datasets[0].data = [
        counts.positive,
        counts.neutral,
        counts.negative
    ];
    sentimentChart.update();
}

function updateSentimentStats(counts) {
    const total = counts.positive + counts.neutral + counts.negative;
    const positivePercent = Math.round((counts.positive / total) * 100);
    const neutralPercent = Math.round((counts.neutral / total) * 100);
    const negativePercent = Math.round((counts.negative / total) * 100);
    
    document.querySelector('.stat.positive .count').textContent = counts.positive;
    document.querySelector('.stat.neutral .count').textContent = counts.neutral;
    document.querySelector('.stat.negative .count').textContent = counts.negative;
    
    document.getElementById('positivePercent').textContent = `${positivePercent}%`;
    document.getElementById('neutralPercent').textContent = `${neutralPercent}%`;
    document.getElementById('negativePercent').textContent = `${negativePercent}%`;
}

async function loadWordCloud(productId) {
    try {
        const response = await fetch(`/api/word_frequencies/${productId}`);
        const wordData = await response.json();
        
        const wordcloud = document.getElementById('wordcloud');
        wordcloud.innerHTML = '';
        
        // Dimensions du conteneur
        const width = wordcloud.offsetWidth;
        const height = wordcloud.offsetHeight;
        
        // Traiter chaque catégorie de sentiment
        const allWords = [];
        ['positive', 'neutral', 'negative'].forEach(sentiment => {
            const words = wordData[sentiment] || {};
            const wordEntries = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 30);
            
            wordEntries.forEach(([word, count]) => {
                allWords.push({
                    text: word,
                    size: 10 + (count * 0.8), // Taille basée sur la fréquence
                    sentiment: sentiment
                });
            });
        });
        
        // Trier par taille décroissante pour placer les gros mots en premier
        allWords.sort((a, b) => b.size - a.size);
        
        // Positionner les mots sans chevauchement
        const placedWords = [];
        
        allWords.forEach((wordObj) => {
            const wordElement = document.createElement('div');
            wordElement.className = `word ${wordObj.sentiment}`;
            wordElement.textContent = wordObj.text;
            wordElement.style.fontSize = `${wordObj.size}px`;
            
            // Mesurer la taille du mot
            wordElement.style.visibility = 'hidden';
            wordcloud.appendChild(wordElement);
            const wordWidth = wordElement.offsetWidth;
            const wordHeight = wordElement.offsetHeight;
            wordElement.remove();
            
            let attempts = 0;
            let placed = false;
            
            while (!placed && attempts < 100) {
                attempts++;
                
                // Position aléatoire
                const left = Math.random() * (width - wordWidth);
                const top = Math.random() * (height - wordHeight);
                
                // Vérifier les collisions
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
                // Si on n'a pas trouvé de place, on le met quand même
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
        const response = await fetch(`/api/sentiment_trends/${productId}?nocache=${Date.now()}`);
        const trendsData = await response.json();
        
        // Vérification des données reçues
        if (!trendsData.dates || !trendsData.positive || !trendsData.neutral || !trendsData.negative) {
            throw new Error("Format de données invalide");
        }
        
        // Mettre à jour le graphique avec les pourcentages
        trendsChart.data.labels = trendsData.dates;
        trendsChart.data.datasets[0].data = trendsData.positive;
        trendsChart.data.datasets[1].data = trendsData.neutral;
        trendsChart.data.datasets[2].data = trendsData.negative;
        
        // Mettre à jour les options pour afficher des pourcentages
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