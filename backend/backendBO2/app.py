from flask import Flask, request, jsonify
import pickle
import xgboost as xgb
import numpy as np
import pandas as pd
import random
from utils.llm_handler import generate_llm_strategy
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../../frontend/build')
CORS(app, resources={r"/api/*": {"origins": "*"}})
# Charger le modèle avec XGBoost's load_model
model = xgb.XGBClassifier()
model.load_model("models/xgboost_model.pkl")

# Charger les encodeurs pour les features (Industry, Target Customer, Customer Age Range, Trends)
with open("models/label_encoders.pkl", "rb") as f:
    label_encoders = pickle.load(f)

# Charger l'encodeur pour le target (Strategy Category)
with open("models/strategy_encoder.pkl", "rb") as f:
    strategy_encoder = pickle.load(f)

# Debug: Check strategy_encoder classes
print("Strategy Encoder Classes:", strategy_encoder.classes_)

# Dictionnaire de mapping (industry + age + target_customer) → liste de tendances
trend_mappings = {
    "Food & Beverage": {
        "18-35 ans": {
            "Jeunes professionnels": ["Healthy snacks, plant-based diets", "Organic living, self-care"],
            "Startups et PME": ["Healthy snacks, plant-based diets", "Sustainable food practices"]
        },
        "25-50 ans": {
            "Jeunes professionnels": ["Meal kits, premium beverages", "Gourmet cooking classes"],
            "Startups et PME": ["Meal kits, premium beverages", "Sustainable food practices"]
        }
    },
    "Fashion": {
        "18-35 ans": {
            "Jeunes professionnels": ["Athleisure, sustainability", "Eco-friendly fashion"],
            "Startups et PME": ["Minimalist fashion, capsule wardrobes", "Eco-friendly fashion"]
        },
        "25-50 ans": {
            "Jeunes professionnels": ["Luxury fashion, timeless styles", "Minimalist fashion, capsule wardrobes"],
            "Startups et PME": ["Pet wellness fashion", "Luxury fashion, timeless styles"]
        }
    },
    "Health": {
        "18-35 ans": {
            "Jeunes professionnels": ["Fitness trackers, mental health apps", "Yoga, meditation retreats"],
            "Startups et PME": ["Mobile apps, remote health tools", "Digital health solutions"]
        },
        "25-50 ans": {
            "Jeunes professionnels": ["Wellness retreats, personalized healthcare", "Digital health solutions"],
            "Startups et PME": ["Sustainable healthcare products", "Wellness retreats, personalized healthcare"]
        }
    },
    "Tech": {
        "18-35 ans": {
            "Jeunes professionnels": ["Gaming, AR/VR experiences", "Smart home devices, IoT"],
            "Startups et PME": ["Smart home devices, IoT", "AI-driven innovations"]
        },
        "25-50 ans": {
            "Jeunes professionnels": ["Productivity tools, automation", "Cybersecurity, data privacy"],
            "Startups et PME": ["Smart home solutions", "AI-driven innovations"]
        }
    },
    "Education": {
        "18-35 ans": {
            "Jeunes professionnels": ["Online courses, skill development", "Coding bootcamps, tech certifications"],
            "Startups et PME": ["Language learning apps", "Online learning platforms"]
        },
        "25-50 ans": {
            "Jeunes professionnels": ["Professional certifications, executive education", "Online MBA programs"],
            "Startups et PME": ["Leadership training, soft skills", "Professional certifications, executive education"]
        }
    }
}

# Helper function to extract all trends from trend_mappings
def get_all_trends():
    all_trends = set()
    for industry in trend_mappings:
        for age_range in trend_mappings[industry]:
            for target_customer in trend_mappings[industry][age_range]:
                trends = trend_mappings[industry][age_range][target_customer]
                all_trends.update(trends)
    return sorted(list(all_trends))  # Sort for consistency

# List of all trends for fallback
all_trends = get_all_trends()

# Fonction pour choisir un trend automatiquement
def auto_select_trend(industry, age_range, target_customer):
    try:
        options = trend_mappings.get(industry, {}).get(age_range, {}).get(target_customer, [])
        if not options:
            return all_trends[0]  # Fallback to the first trend in all_trends
        return options[0]  # Select the first trend deterministically
    except (KeyError, IndexError):
        return all_trends[0]  # Fallback to the first trend in all_trends
# Obtenir les catégories valides à partir des encodeurs
valid_categories = {
    'industry': list(label_encoders['Industry'].classes_),
    'target_customer': list(label_encoders['Target Customer'].classes_),
    'customer_age': list(label_encoders['Customer Age Range'].classes_),
    'trend': list(label_encoders['Trends'].classes_)
}

# Utiliser les encodeurs pour transformer les features
def preprocess_input(form):
    industry = form["industry"]
    target_customer = form["target_customer"]
    age_range = form["customer_age"]
    marketing_budget = float(form["marketing_budget"])
    trend = form["trend"]

    # Valider les catégories
    for field, value in [('industry', industry), ('target_customer', target_customer),
                         ('customer_age', age_range), ('trend', trend)]:
        if value not in valid_categories[field]:
            raise ValueError(f"Valeur invalide pour {field}: '{value}'. Valeurs acceptées: {valid_categories[field]}")

    # Encoder chaque colonne catégorique avec son encodeur correspondant
    try:
        industry_encoded = label_encoders['Industry'].transform([industry])[0]
        target_customer_encoded = label_encoders['Target Customer'].transform([target_customer])[0]
        age_range_encoded = label_encoders['Customer Age Range'].transform([age_range])[0]
        trend_encoded = label_encoders['Trends'].transform([trend])[0]
    except ValueError as e:
        raise ValueError(f"Erreur lors de l'encodage: {str(e)}")

    # Combiner les features encodées avec le budget marketing
    row = [
        marketing_budget,
        age_range_encoded,
        trend_encoded,
        industry_encoded,
        target_customer_encoded
    ]
    print("✅ Feature vector envoyé au modèle:", row)

    return np.array(row).reshape(1, -1)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to MarketMind Backend! Use /api/predict for predictions."})

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        form_data = request.get_json()
        print("Received request:", form_data)
        required_fields = ['industry', 'target_customer', 'customer_age', 'marketing_budget']
        for field in required_fields:
            if field not in form_data:
                return jsonify({"error": f"Champ manquant: {field}"}), 400

        trend = auto_select_trend(form_data["industry"], form_data["customer_age"], form_data["target_customer"])
        form_with_trend = {**form_data, "trend": trend}
        
        user_input = preprocess_input(form_with_trend)
        prediction_encoded = model.predict(user_input)
        prediction_encoded = np.array(prediction_encoded).flatten()
        strategy_type = strategy_encoder.inverse_transform(prediction_encoded)[0]
        
        print("Calling generate_llm_strategy with:", form_with_trend, strategy_type)
        llm_strategy = generate_llm_strategy(form_with_trend, strategy_type)
        
        return jsonify({
            "prediction": strategy_type,
            "trend_used": trend,
            "llm_strategy": llm_strategy
        })
    except Exception as e:
        print("Error in predict:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)