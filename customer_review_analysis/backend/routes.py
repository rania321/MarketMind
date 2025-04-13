from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId  # Import corrected from bson
from datetime import datetime
import os
import re
from transformers import CamembertTokenizer
import pandas as pd
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from config import products_collection, reviews_collection, sentiment_results_collection, IMAGE_FOLDER, CSV_FOLDER
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import re
import pandas as pd
import torch
from transformers import (
    AutoModelForSequenceClassification, 
    AutoTokenizer,
    pipeline
)
from sklearn.preprocessing import LabelEncoder
from config import (
    products_collection, 
    reviews_collection, 
    sentiment_results_collection,
    topic_results_collection,  # Nouvelle collection ajoutée
    IMAGE_FOLDER, 
    CSV_FOLDER
)

api_routes = Blueprint('api_routes', __name__)

# Modèle d'analyse de sentiment
sentiment_model_name = "Nourhen2001/fine-tuned-bert-sentiment-v1"
sentiment_model = AutoModelForSequenceClassification.from_pretrained(sentiment_model_name)
sentiment_tokenizer = AutoTokenizer.from_pretrained(sentiment_model_name)

print("Le modèle et le tokenizer ont été chargés avec succès.")
# Modèle de classification thématique
topic_model_name = "Nourhen2001/camembert-base-Topic-v1"
topic_model = AutoModelForSequenceClassification.from_pretrained(topic_model_name)
topic_tokenizer = CamembertTokenizer.from_pretrained(topic_model_name)

# Création du pipeline de classification thématique
topic_classifier = pipeline(
    "text-classification",
    model=topic_model,
    tokenizer=topic_tokenizer,
    device=0 if torch.cuda.is_available() else -1
)

# Labels thématiques - à adapter selon les classes de votre modèle
topic_classes = ['price', 'service', 'quality', 'delivery']
topic_le = LabelEncoder()
topic_le.fit(topic_classes)

print("Tous les modèles et tokenizers ont été chargés avec succès")

# ➤ Ajouter un Produit
@api_routes.route("/add_product", methods=["POST"])
def add_product():
    name = request.form.get("name")
    category = request.form.get("category")
    description = request.form.get("description")
    image = request.files.get("image")

    if not all([name, category, description, image]):
        return jsonify({"error": "All fields are required"}), 400

    # Enregistrer l'image localement
    image_filename = f"{name.replace(' ', '_')}.jpg"
    image_path = os.path.join(IMAGE_FOLDER, image_filename)
    image.save(image_path)

    # Date formatée (DD-MM-YYYY)
    date_added = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    product_data = {
        "name": name,
        "category": category,
        "description": description,
        "image": image_filename,
        "date_added": date_added
    }

    product_id = products_collection.insert_one(product_data).inserted_id
    return jsonify({"message": "Product added", "product_id": str(product_id)})

# ➤ Obtenir tous les Produits
@api_routes.route("/products", methods=["GET"])
def get_products():
    products = list(products_collection.find({}, {"_id": 1, "name": 1, "category": 1, "description": 1, "image": 1, "date_added": 1}))
    for product in products:
        product["_id"] = str(product["_id"])
    return jsonify(products)

# ➤ Ajouter des Reviews via CSV
@api_routes.route("/add_reviews", methods=["POST"])
def add_reviews():
    if "file" not in request.files or "product_id" not in request.form:
        return jsonify({"error": "File and product_id are required"}), 400

    file = request.files["file"]
    product_id = request.form["product_id"]

    # Vérifier si le produit existe
    if not products_collection.find_one({"_id": ObjectId(product_id)}):
        return jsonify({"error": "Product not found"}), 404

    # Sauvegarde temporaire
    file_path = os.path.join(CSV_FOLDER, file.filename)
    file.save(file_path)

    # Lire le fichier CSV / Excel
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Invalid file format. Use CSV or Excel"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Vérifier la présence de "review_text"
    if "review_text" not in df.columns:
        return jsonify({"error": "Missing 'review_text' column in file"}), 400

    # Insérer les reviews avec la date formatée
    reviews = []
    for review_text in df["review_text"]:
        date_added = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        review_data = {
            "product_id": product_id,
            "review_text": review_text,
            "date_added": date_added
        }
        reviews.append(review_data)

    if reviews:
        reviews_collection.insert_many(reviews)

    return jsonify({"message": "Reviews added successfully"}), 201

# ➤ Obtenir les Reviews d'un Produit
@api_routes.route("/reviews/<product_id>", methods=["GET"])
def get_reviews(product_id):
    # Tri par date décroissante
    reviews = list(reviews_collection.find(
        {"product_id": product_id}, 
        {"_id": 1, "review_text": 1, "date_added": 1}
    ).sort("date_added", -1))
    
    for review in reviews:
        review["_id"] = str(review["_id"])
    return jsonify(reviews)

# ➤ Obtenir tous les Reviews (de tous les produits)
@api_routes.route("/reviews", methods=["GET"])
def get_all_reviews():
    reviews = list(reviews_collection.find({}, {"_id": 1, "product_id": 1, "review_text": 1, "date_added": 1}))
    for review in reviews:
        review["_id"] = str(review["_id"])
    return jsonify(reviews)

@api_routes.route("/simple_reviews_count", methods=["GET"])
def get_simple_reviews_count():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$product_id",
                    "total_reviews": {"$sum": 1}
                }
            }
        ]
        results = list(reviews_collection.aggregate(pipeline))
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api_routes.route("/product/<product_id>/reviews_count", methods=["GET"])
def get_product_reviews_count(product_id):
    try:
        count = reviews_collection.count_documents({"product_id": product_id})
        product = products_collection.find_one(
            {"_id": ObjectId(product_id)},
            {"name": 1}
        )
        
        return jsonify({
            "product_id": product_id,
            "product_name": product.get("name") if product else "Unknown Product",
            "total_reviews": count
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_routes.route("/sentiment_analysis", methods=["POST"])
def sentiment_analysis():
    product_id = request.form.get("product_id")
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
    
    # Récupérer tous les avis pour le produit spécifié
    reviews = list(reviews_collection.find({"product_id": product_id}))

    if not reviews:
        return jsonify({"error": "No reviews found for this product"}), 404

    # Trouver la date et l'heure la plus récente
    latest_datetime = max([datetime.strptime(review["date_added"], "%d-%m-%Y %H:%M:%S") for review in reviews])
    latest_datetime_str = latest_datetime.strftime("%d-%m-%Y %H:%M:%S")

    # Filtrer les avis pour ne garder que ceux de la date et heure les plus récentes
    latest_reviews = [review for review in reviews if review["date_added"] == latest_datetime_str]

    if not latest_reviews:
        return jsonify({"error": "No reviews found for the latest date and time"}), 404

    # Liste pour stocker les résultats de l'analyse de sentiment
    sentiment_results = []

    # Vérifier si un document existe déjà pour ce produit et cette date
    existing_document = sentiment_results_collection.find_one({
        "product_id": ObjectId(product_id),
        "date_added": latest_datetime_str
    })

    # Date d'analyse actuelle
    analysis_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    if existing_document:
        # Si le document existe, ajouter les nouvelles analyses dans le tableau 'analyses'
        for review in latest_reviews:
            review_text = review["review_text"]

            # Vérifier si l'avis a déjà été analysé pour ce produit et cette date
            if not any(analysis["review_text"] == review_text for analysis in existing_document["analyses"]):
                # Tokeniser le texte de l'avis
                inputs = sentiment_tokenizer(review_text, return_tensors="pt", padding=True, truncation=True)

                # Effectuer la prédiction avec le modèle
                outputs = sentiment_model(**inputs)

                # Extraire les logits et appliquer la fonction softmax
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=-1)

                # Trouver l'index de la classe avec la plus haute probabilité
                predicted_class_index = torch.argmax(probabilities, dim=-1).item()

                # Mapper l'indice à une étiquette de classe
                class_labels = ["negative", "neutral", "positive"]
                predicted_class_label = class_labels[predicted_class_index]

                # Ajouter l'analyse au tableau 'analyses' avec la date d'analyse spécifique
                sentiment_results_collection.update_one(
                    {"_id": existing_document["_id"]},
                    {
                        "$push": {
                            "analyses": {
                                "review_text": review_text,
                                "sentiment": predicted_class_label,
                                "probabilities": {
                                    "positive": probabilities[0][2].item(),
                                    "neutral": probabilities[0][1].item(),
                                    "negative": probabilities[0][0].item()
                                },
                                "analysis_date": analysis_date,  # Ajouter la date d'analyse ici
                                "date_added": review["date_added"]  # Garder la date d'ajout initiale
                            }
                        }
                    }
                )

                # Ajouter à la liste des résultats pour la réponse
                sentiment_results.append({
                    "review_text": review_text,
                    "sentiment": predicted_class_label,
                    "probabilities": {
                        "positive": probabilities[0][2].item(),
                        "neutral": probabilities[0][1].item(),
                        "negative": probabilities[0][0].item()
                    },
                    "analysis_date": analysis_date,  # Ajouter la date d'analyse ici
                    "date_added": review["date_added"]  # Garder la date d'ajout initiale
                })

    else:
        # Si le document n'existe pas, insérer un nouveau document avec le produit et la date
        analyses = []

        for review in latest_reviews:
            review_text = review["review_text"]

            # Tokeniser le texte de l'avis
            inputs = sentiment_tokenizer(review_text, return_tensors="pt", padding=True, truncation=True)

            # Effectuer la prédiction avec le modèle
            outputs = sentiment_model(**inputs)

            # Extraire les logits et appliquer la fonction softmax
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)

            # Trouver l'index de la classe avec la plus haute probabilité
            predicted_class_index = torch.argmax(probabilities, dim=-1).item()

            # Mapper l'indice à une étiquette de classe
            class_labels = ["negative", "neutral", "positive"]
            predicted_class_label = class_labels[predicted_class_index]

            # Ajouter l'analyse au tableau des analyses avec la date d'analyse spécifique
            analyses.append({
                "review_text": review_text,
                "sentiment": predicted_class_label,
                "probabilities": {
                    "positive": probabilities[0][2].item(),
                    "neutral": probabilities[0][1].item(),
                    "negative": probabilities[0][0].item()
                },
                "analysis_date_review": analysis_date,  # Ajouter la date d'analyse ici
                "date_added": review["date_added"]  # Garder la date d'ajout initiale
            })

        # Créer un nouveau document avec la liste des analyses
        sentiment_data = {
            "product_id": ObjectId(product_id),
            "analysis_date": analysis_date,  # Remplacer par la date d'analyse
            "analyses": analyses
        }

        sentiment_results_collection.insert_one(sentiment_data)

        # Ajouter les résultats de l'analyse de sentiment à la liste de réponse
        sentiment_results = analyses

    return jsonify({"message": "Sentiment analysis completed", "sentiment_results": sentiment_results})

@api_routes.route("/sentiment_results", methods=["GET"])
def check_existing_analysis():
    product_id = request.args.get("product_id")
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
    
    # Rechercher toutes les analyses pour ce produit
    existing_analyses = list(sentiment_results_collection.find({"product_id": ObjectId(product_id)}))
    
    if not existing_analyses:
        return jsonify([]), 200
    
    # Convertir ObjectId en string pour le JSON
    for analysis in existing_analyses:
        analysis["_id"] = str(analysis["_id"])
    
    return jsonify(existing_analyses), 200

@api_routes.route("/word_frequencies/<product_id>", methods=["GET"])
def get_word_frequencies(product_id):
    # Récupérer les analyses de sentiment pour ce produit
    sentiment_data = list(sentiment_results_collection.find({"product_id": ObjectId(product_id)}))
    
    if not sentiment_data:
        return jsonify({"error": "No sentiment analysis found for this product"}), 404
    
    # Liste des mots à exclure (stop words)
    stop_words = {"le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "avec", "pour", "dans"}
    
    word_data = {
        "positive": {},
        "neutral": {},
        "negative": {}
    }
    
    for analysis in sentiment_data:
        for review_analysis in analysis.get("analyses", []):
            review_text = review_analysis["review_text"]
            sentiment = review_analysis["sentiment"]
            
            words = re.findall(r'\b\w{4,}\b', review_text.lower())
            for word in words:
                if word not in stop_words:
                    word_data[sentiment][word] = word_data[sentiment].get(word, 0) + 1
    
    # Retourner les données organisées par sentiment
    return jsonify(word_data)

@api_routes.route("/sentiment_trends/<product_id>", methods=["GET"])
def get_sentiment_trends(product_id):
    # Pipeline d'agrégation pour obtenir les pourcentages par date
    pipeline = [
        {"$match": {"product_id": ObjectId(product_id)}},
        {"$unwind": "$analyses"},
        # Groupement par date d'analyse et sentiment
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$toDate": "$analyses.analysis_date_review"}}},
                "sentiment": "$analyses.sentiment"
            },
            "count": {"$sum": 1}
        }},
        # Groupement par date pour calculer les totaux
        {"$group": {
            "_id": "$_id.date",
            "sentiments": {
                "$push": {
                    "sentiment": "$_id.sentiment",
                    "count": "$count"
                }
            },
            "total": {"$sum": "$count"}
        }},
        # Calcul des pourcentages
        {"$project": {
            "date": "$_id",
            "sentiments": {
                "$map": {
                    "input": "$sentiments",
                    "as": "s",
                    "in": {
                        "sentiment": "$$s.sentiment",
                        "percentage": {
                            "$multiply": [
                                {"$divide": ["$$s.count", "$total"]},
                                100
                            ]
                        }
                    }
                }
            }
        }},
        {"$sort": {"date": 1}}  # Tri chronologique
    ]
    
    results = list(sentiment_results_collection.aggregate(pipeline))
    
    # Formater les données pour le frontend
    trends = {
        "dates": [],
        "positive": [],
        "neutral": [],
        "negative": []
    }
    
    for result in results:
        trends["dates"].append(result["date"])
        
        # Initialiser les pourcentages à 0 pour cette date
        percentages = {"positive": 0, "neutral": 0, "negative": 0}
        
        # Mettre à jour les pourcentages avec les données réelles
        for sentiment_data in result["sentiments"]:
            percentages[sentiment_data["sentiment"]] = round(sentiment_data["percentage"], 1)
        
        # Ajouter les valeurs aux séries
        trends["positive"].append(percentages["positive"])
        trends["neutral"].append(percentages["neutral"])
        trends["negative"].append(percentages["negative"])
    
    return jsonify(trends)




# ➤ Endpoint de Classification Thématique
@api_routes.route("/topic_classification", methods=["POST"])
def topic_classification():
    product_id = request.form.get("product_id")
    
    if not product_id:
        return jsonify({"error": "L'ID du produit est requis"}), 400

    # Récupérer les analyses de sentiment existantes pour ce produit
    sentiment_data = sentiment_results_collection.find_one(
        {"product_id": ObjectId(product_id)},
        sort=[("analysis_date", -1)]  # Prendre la plus récente
    )

    if not sentiment_data:
        return jsonify({"error": "Aucune analyse de sentiment trouvée pour ce produit"}), 404

    try:
        # Utiliser les mêmes avis que ceux analysés pour le sentiment
        sentiment_analyses = sentiment_data.get("analyses", [])
        
        if not sentiment_analyses:
            return jsonify({"error": "Aucun avis analysé trouvé"}), 404

        # Date d'analyse actuelle
        analysis_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        
        # Vérifier si un document thématique existe déjà pour cette analyse
        existing_topic_doc = topic_results_collection.find_one({
            "product_id": ObjectId(product_id),
            "analysis_date": analysis_date
        })

        topic_results = []

        if existing_topic_doc:
            # Si le document existe, vérifier les avis déjà analysés
            existing_reviews = {a["review_text"] for a in existing_topic_doc.get("analyses", [])}
            
            new_analyses = []
            for sa in sentiment_analyses:
                if sa["review_text"] not in existing_reviews:
                    try:
                        # Classification thématique
                        result = topic_classifier(sa["review_text"])
                        label_idx = int(result[0]['label'].split('_')[-1])
                        topic = topic_le.inverse_transform([label_idx])[0]
                        confidence = result[0]['score']

                        new_analyses.append({
                            "review_text": sa["review_text"],
                            "topic": topic,
                            "confidence": float(confidence),
                            "analysis_date": analysis_date,
                            "date_added": sa["date_added"],
                            "sentiment": sa.get("sentiment")  # Optionnel: stocker aussi le sentiment
                        })
                    except Exception as e:
                        print(f"Erreur classification: {str(e)}")
                        continue

            if new_analyses:
                topic_results_collection.update_one(
                    {"_id": existing_topic_doc["_id"]},
                    {"$push": {"analyses": {"$each": new_analyses}}}
                )
                topic_results.extend(new_analyses)

        else:
            # Créer un nouveau document avec toutes les analyses
            analyses = []
            for sa in sentiment_analyses:
                try:
                    result = topic_classifier(sa["review_text"])
                    label_idx = int(result[0]['label'].split('_')[-1])
                    topic = topic_le.inverse_transform([label_idx])[0]
                    confidence = result[0]['score']

                    analyses.append({
                        "review_text": sa["review_text"],
                        "topic": topic,
                        "confidence": float(confidence),
                        "analysis_date": analysis_date,
                        "date_added": sa["date_added"],
                        "sentiment": sa.get("sentiment")  # Optionnel
                    })
                except Exception as e:
                    print(f"Erreur classification: {str(e)}")
                    continue

            if analyses:
                topic_data = {
                    "product_id": ObjectId(product_id),
                    "analysis_date": analysis_date,
                    "analyses": analyses
                }
                topic_results_collection.insert_one(topic_data)
                topic_results = analyses

        return jsonify({
            "message": "Classification thématique terminée",
            "topic_results": topic_results,
            "count": len(topic_results)
        })

    except Exception as e:
        return jsonify({"error": f"Erreur du serveur: {str(e)}"}), 500

# ➤ Distribution des Thématiques
@api_routes.route("/topic_distribution/<product_id>", methods=["GET"])
def get_topic_distribution(product_id):
    try:
        # Pipeline d'agrégation pour calculer la distribution
        pipeline = [
            {"$match": {"product_id": ObjectId(product_id)}},
            {"$unwind": "$analyses"},
            {"$group": {
                "_id": "$analyses.topic",
                "count": {"$sum": 1}
            }},
            {"$project": {
                "topic": "$_id",
                "count": 1,
                "_id": 0
            }}
        ]
        
        results = list(topic_results_collection.aggregate(pipeline))
        
        if not results:
            return jsonify({"error": "Aucune donnée d'analyse trouvée"}), 404
        
        # Calculer les pourcentages
        total = sum(item['count'] for item in results)
        for item in results:
            item['percentage'] = round((item['count'] / total) * 100, 1) if total > 0 else 0
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": f"Erreur du serveur: {str(e)}"}), 500

@api_routes.route("/combined_sentiment_topic/<product_id>", methods=["GET"])
def combined_sentiment_topic(product_id):
    try:
        # Charger toutes les analyses sentimentales
        sentiment_doc = sentiment_results_collection.find_one({"product_id": ObjectId(product_id)})
        topic_doc = topic_results_collection.find_one({"product_id": ObjectId(product_id)})

        if not sentiment_doc or not topic_doc:
            return jsonify({"error": "Données non trouvées pour ce produit"}), 404

        sentiment_analyses = sentiment_doc.get("analyses", [])
        topic_analyses = topic_doc.get("analyses", [])

        # Indexer les topics par texte d'avis
        topic_map = {ta["review_text"]: ta["topic"] for ta in topic_analyses}

        # Initialiser la structure
        correlation_counts = {
            "price": {"positive": 0, "neutral": 0, "negative": 0},
            "service": {"positive": 0, "neutral": 0, "negative": 0},
            "quality": {"positive": 0, "neutral": 0, "negative": 0},
            "delivery": {"positive": 0, "neutral": 0, "negative": 0}
        }

        for sa in sentiment_analyses:
            review_text = sa["review_text"]
            sentiment = sa["sentiment"]
            topic = topic_map.get(review_text)

            if topic in correlation_counts:
                correlation_counts[topic][sentiment] += 1

        return jsonify(correlation_counts)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

