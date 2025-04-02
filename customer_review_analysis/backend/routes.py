from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId  # Import corrected from bson
from datetime import datetime
import os
import re
import pandas as pd
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from config import products_collection, reviews_collection, sentiment_results_collection, IMAGE_FOLDER, CSV_FOLDER

api_routes = Blueprint('api_routes', __name__)

# Nom du modèle fine-tuné sur Hugging Face
model_name = "Nourhen2001/fine-tuned-bert-sentiment-v1"

# Charger le modèle fine-tuné
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Charger le tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

print("Le modèle et le tokenizer ont été chargés avec succès.")

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
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 1, "review_text": 1, "date_added": 1}))
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
                inputs = tokenizer(review_text, return_tensors="pt", padding=True, truncation=True)

                # Effectuer la prédiction avec le modèle
                outputs = model(**inputs)

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
            inputs = tokenizer(review_text, return_tensors="pt", padding=True, truncation=True)

            # Effectuer la prédiction avec le modèle
            outputs = model(**inputs)

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
    # Pipeline d'agrégation optimisé pour éviter les doublons
    pipeline = [
        {"$match": {"product_id": ObjectId(product_id)}},
        {"$unwind": "$analyses"},
        # Groupement par texte d'avis et date pour éliminer les doublons
        {"$group": {
            "_id": {
                "review_text": "$analyses.review_text",
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$toDate": "$analyses.analysis_date_review"}}}
            },
            "sentiment": {"$first": "$analyses.sentiment"}
        }},
        # Ensuite groupement par date et sentiment
        {"$group": {
            "_id": {
                "date": "$_id.date",
                "sentiment": "$sentiment"
            },
            "count": {"$sum": 1}
        }},
        # Final groupement par date
        {"$group": {
            "_id": "$_id.date",
            "sentiments": {
                "$push": {
                    "sentiment": "$_id.sentiment",
                    "count": "$count"
                }
            }
        }},
        {"$sort": {"_id": 1}}  # Tri chronologique
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
        trends["dates"].append(result["_id"])
        
        # Initialiser les compteurs à 0 pour cette date
        counts = {"positive": 0, "neutral": 0, "negative": 0}
        
        # Mettre à jour les compteurs avec les données réelles
        for sentiment_data in result["sentiments"]:
            counts[sentiment_data["sentiment"]] = sentiment_data["count"]
        
        # Ajouter les valeurs aux séries
        trends["positive"].append(counts["positive"])
        trends["neutral"].append(counts["neutral"])
        trends["negative"].append(counts["negative"])
    
    return jsonify(trends)