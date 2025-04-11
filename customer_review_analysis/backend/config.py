import os
from pymongo import MongoClient

# Connexion à MongoDB
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "review_analysis"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
products_collection = db["products"]
reviews_collection = db["reviews"]
sentiment_results_collection = db["sentiment_results"]
topic_results_collection = db["topic_results"]
summary_results_collection = db["summary_results"]

# Configuration des dossiers
UPLOAD_FOLDER = "backend/uploads"
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, "images")
CSV_FOLDER = os.path.join(UPLOAD_FOLDER, "csv")

# Création des dossiers si non existants
os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(CSV_FOLDER, exist_ok=True)
