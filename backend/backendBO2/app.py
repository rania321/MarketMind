from flask import Flask, render_template, request, jsonify
import pickle
import xgboost as xgb
import numpy as np
import pandas as pd
import random
from utils.llm_handler import generate_llm_strategy
from flask_cors import CORS

from flask import send_from_directory
import os

app = Flask(__name__, static_folder='../frontend/build')

# Initialiser l'application Flask
#app = Flask(__name__)
CORS(app)

# Charger le modèle
model = xgb.XGBClassifier()
model.load_model("models/best_model.json")

# Donne-lui deux inputs très différents :
x1 = np.array([[1000, 0, 123, 0, 1, 0, 0, 1, 0, 0]])   # ex: PPC
x2 = np.array([[80000, 1, 999, 1, 0, 0, 0, 0, 1, 0]])

print("Pred 1:", model.predict(x1))
print("Pred 2:", model.predict(x2))

# Dictionnaire de mapping (industry + age) → liste de tendances
trend_mappings = {
    "Food & Beverage": {
        "18-35 ans": [
            "Organic living, self-care",
            "Healthy snacks, plant-based diets",
            "Cold-pressed juices, superfoods"
        ],
        "25-40 ans": [
            "Meal planning apps",
            "Functional foods, probiotic drinks",
            "Farm-to-table experiences"
        ],
        "25-50 ans": [
            "Home workouts",
            "Meal kits, premium beverages",
            "Wine tasting experiences, gourmet cooking"
        ],
        "50+ ans": [
            "Healthy aging diets",
            "Cooking for wellness",
            "Tea culture, low-sodium recipes"
        ]
    },
    "Fashion": {
        "18-35 ans": [
            "Athleisure, sustainability",
            "Streetwear, eco-friendly fashion",
            "Minimalist fashion, capsule wardrobes"
        ],
        "25-40 ans": [
            "Smart casual, versatile outfits",
            "Sustainable materials",
            "Fashion-tech integration"
        ],
        "25-50 ans": [
            "Luxury fashion, timeless styles",
            "Pet wellness, eco-friendly products",
            "Experiential art, fashion shows"
        ],
        "50+ ans": [
            "Comfort-first fashion",
            "Elegant essentials, classic cuts",
            "Adaptive clothing, age-positive styles"
        ]
    },
    "Health": {
        "18-35 ans": [
            "Mobile apps, remote work tools",
            "Fitness trackers, mental health apps",
            "Yoga, meditation retreats"
        ],
        "25-40 ans": [
            "Holistic health programs",
            "Stress management coaching",
            "Preventive healthcare"
        ],
        "25-50 ans": [
            "Wellness retreats, personalized healthcare",
            "Sustainable travel, remote work locations",
            "Virtual events, hybrid events"
        ],
        "50+ ans": [
            "Chronic disease management",
            "Mind-body balance",
            "Age-friendly fitness programs"
        ]
    },
    "Technology": {
        "18-35 ans": [
            "Gaming, AR/VR experiences",
            "Smart home devices, IoT",
            "Social media platforms, content creation tools"
        ],
        "25-40 ans": [
            "Tech for productivity",
            "Work-life balance apps",
            "Voice assistants, smart devices"
        ],
        "25-50 ans": [
            "Smart home devices, productivity tools",
            "AI-driven solutions, automation",
            "Cybersecurity, data privacy"
        ],
        "50+ ans": [
            "Digital literacy tools",
            "Telemedicine, health tech",
            "Simplified smart tech for seniors"
        ]
    },
    "Education": {
        "18-35 ans": [
            "Online courses, skill development",
            "Coding bootcamps, tech certifications",
            "Language learning apps, study abroad programs"
        ],
        "25-40 ans": [
            "Career switches, reskilling platforms",
            "Online MBA programs",
            "Leadership and communication skills"
        ],
        "25-50 ans": [
            "Professional certifications, executive education",
            "Leadership training, soft skills development",
            "Online MBA programs, career coaching"
        ],
        "50+ ans": [
            "Lifelong learning platforms",
            "Personal enrichment courses",
            "Mentoring and teaching opportunities"
        ]
    }
}


# Fonction pour choisir un trend automatiquement
def auto_select_trend(industry, age_range):
    try:
        options = trend_mappings[industry][age_range]
        return random.choice(options)
    except KeyError:
        return "General wellness, digital presence"  # Valeur par défaut si aucune correspondance


# Charger l'encodeur
with open("models/strategy_encoder.pkl", "rb") as f:
    strategy_encoder = pickle.load(f)

# Pour simplifier, on encode les valeurs manuellement (comme dans l'entraînement)
def preprocess_input(form):
    industry = form["industry"]
    target_customer = form["target_customer"]
    age_range = form["customer_age"]
    marketing_budget = float(form["marketing_budget"])
    trend = form["trend"]

    # On recrée les colonnes manuellement avec les mêmes transformations
    industry_cols = {
        'Food & Beverage': 0, 'Health': 0, 'Tech': 0, 'Education': 0, 'Fashion': 0
    }
    if industry != 'Food & Beverage':
        industry_cols[industry] = 1

    customer_cols = {
        'Jeunes professionnels': 0, 'Startups et PME': 0, 'Femmes 25-40 ans': 0
    }
    if target_customer == 'Jeunes professionnels':
        customer_cols['Jeunes professionnels'] = 1
    elif target_customer == 'Startups et PME':
        customer_cols['Startups et PME'] = 1
    elif target_customer == 'Femmes 25-40 ans':
        customer_cols['Femmes 25-40 ans'] = 1

    age_range_num = 0 if age_range == '18-35 ans' else 1  # encodé comme dans le LabelEncoder

    # Pour simplifier, on encode le trend par son hash (à améliorer avec un encoder sauvegardé si besoin)
    trend_encoded = abs(hash(trend)) % 1000  # pas optimal mais fonctionnel pour une démo

    row = [
        marketing_budget,
        age_range_num,
        trend_encoded,
        industry_cols['Education'],
        industry_cols['Fashion'],
        industry_cols['Health'],
        industry_cols['Tech'],
        customer_cols['Jeunes professionnels'],
        customer_cols['Startups et PME'],
        customer_cols['Femmes 25-40 ans']
    ]
    print("✅ Feature vector envoyé au modèle:", row)

    return np.array(row).reshape(1, -1)




@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        # Récupération des données JSON
        form_data = request.get_json()
        
        # Validation des données
        required_fields = ['industry', 'target_customer', 'customer_age', 'marketing_budget']
        for field in required_fields:
            if field not in form_data:
                return jsonify({"error": f"Champ manquant: {field}"}), 400

        # Sélection automatique du trend
        trend = auto_select_trend(form_data["industry"], form_data["customer_age"])
        form_with_trend = {**form_data, "trend": trend}
        
        # Prédiction XGBoost
        user_input = preprocess_input(form_with_trend)
        prediction_encoded = model.predict(user_input)
        strategy_type = strategy_encoder.inverse_transform(prediction_encoded)[0]
        
        # Génération LLM
        llm_strategy = generate_llm_strategy(form_with_trend, strategy_type)
        
        return jsonify({
            "prediction": strategy_type,
            "trend_used": trend,
            "llm_strategy": llm_strategy
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):  # Laissez Flask gérer les routes API
        pass
    elif path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == "__main__":
    app.run(debug=True)
