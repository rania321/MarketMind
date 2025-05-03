import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import torch
from transformers import pipeline
import re
from llama_cpp import Llama
import logging
from huggingface_hub import login, hf_hub_download, HfApi
import os



# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000)
        self.classifier = MultinomialNB()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=0 if self.device == "cuda" else -1
        )

    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def train(self, texts, labels):
        cleaned_texts = [self.clean_text(text) for text in texts]
        X = self.vectorizer.fit_transform(cleaned_texts)
        self.classifier.fit(X, labels)

    def predict(self, texts):
        cleaned_texts = [self.clean_text(text) for text in texts]
        X = self.vectorizer.transform(cleaned_texts)
        probabilities = self.classifier.predict_proba(X)
        
        results = []
        for text, prob in zip(texts, probabilities):
            transformer_result = self.sentiment_pipeline(text)[0]
            label = transformer_result['label'].lower()
            
            if label == 'positive':
                sentiment = 'positive'
                confidence = transformer_result['score']
            elif label == 'negative':
                sentiment = 'negative'
                confidence = transformer_result['score']
            else:
                sentiment = 'neutral'
                confidence = transformer_result['score']
            
            results.append({
                'sentiment': sentiment,
                'confidence': confidence,
                'probabilities': {
                    'positive': prob[2] if len(prob) > 2 else 0,
                    'neutral': prob[1] if len(prob) > 1 else 0,
                    'negative': prob[0]
                }
            })
        
        return results

class TopicClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000)
        self.classifier = MultinomialNB()

    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def train(self, texts, topics):
        cleaned_texts = [self.clean_text(text) for text in texts]
        X = self.vectorizer.fit_transform(cleaned_texts)
        self.classifier.fit(X, topics)

    def predict(self, texts):
        cleaned_texts = [self.clean_text(text) for text in texts]
        X = self.vectorizer.transform(cleaned_texts)
        topics = self.classifier.predict(X)
        probabilities = self.classifier.predict_proba(X)
        
        results = []
        for topic, prob in zip(topics, probabilities):
            results.append({
                'topic': topic,
                'probabilities': prob.tolist()
            })
        
        return results

class WordFrequencyAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')

    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def analyze(self, texts, sentiments):
        positive_texts = [self.clean_text(text) for text, sentiment in zip(texts, sentiments) if sentiment == 'positive']
        neutral_texts = [self.clean_text(text) for text, sentiment in zip(texts, sentiments) if sentiment == 'neutral']
        negative_texts = [self.clean_text(text) for text, sentiment in zip(texts, sentiments) if sentiment == 'negative']
        
        word_freq = {
            'positive': {},
            'neutral': {},
            'negative': {}
        }
        
        for sentiment, text_group in [('positive', positive_texts), ('neutral', neutral_texts), ('negative', negative_texts)]:
            if text_group:
                tfidf_matrix = self.vectorizer.fit_transform(text_group)
                feature_names = self.vectorizer.get_feature_names_out()
                for i, word in enumerate(feature_names):
                    word_freq[sentiment][word] = tfidf_matrix[:, i].sum()
        
        return word_freq


import os
import logging
from huggingface_hub import login, hf_hub_download, HfApi
from llama_cpp import Llama

class SummaryModel:
    def __init__(self):
        """Initialise le modèle avec des paramètres par défaut"""
        self.model_loaded = False
        self.llm = None
        self.model_path = None
        self.load_model()

    def load_model(self):
        """Charge le modèle depuis HuggingFace Hub ou le cache local"""
        try:
            login(token="##")
            api = HfApi()
            repo_files = api.list_repo_files("Nourhen2001/ReviewLlama_Sum_Req_gguf")
            gguf_files = [f for f in repo_files if f.endswith('.gguf')]
            
            if not gguf_files:
                raise ValueError("No GGUF files found in repository")
                
            model_filename = gguf_files[0]
            local_model_path = os.path.join("models", model_filename)
            
            if os.path.exists(local_model_path):
                logging.info(f"Using cached model at {local_model_path}")
                self.model_path = local_model_path
            else:
                logging.info(f"Downloading model {model_filename}...")
                self.model_path = hf_hub_download(
                    repo_id="Nourhen2001/ReviewLlama_Sum_Req_gguf",
                    filename=model_filename,
                    local_dir="models"
                )
            
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=2048,
                n_threads=6,
                n_gpu_layers=1 if os.getenv('USE_GPU') == '1' else 0
            )
            self.model_loaded = True
            logging.info("Model successfully loaded")
            
        except Exception as e:
            logging.error(f"Model loading failed: {str(e)}")
            raise

    def _format_reviews(self, sentiment_data):
        """Formate les avis selon le format spécifique demandé"""
        product_name = sentiment_data.get('product_name', 'Unknown Product')
        analyses = sentiment_data.get('analyses', [])
        
        def clean_text(text):
            return text.replace('"', "'").strip().replace('\n', ' ')
        
        positives = [clean_text(a['review_text']) for a in analyses 
                    if a.get('sentiment') == 'positive'][:3]
        negatives = [clean_text(a['review_text']) for a in analyses 
                    if a.get('sentiment') == 'negative'][:3]
        
        return {
            'product': product_name,
            'positives': positives,
            'negatives': negatives
        }

    def _build_prompt(self, instruction, reviews_data):
        """Construit le prompt dans le format Alpaca"""
        input_str = f"Product: {reviews_data['product']} | "
        input_str += "Positive: " + ", ".join([f"'{r}'" for r in reviews_data['positives']]) + " | "
        input_str += "Negative: " + ", ".join([f"'{r}'" for r in reviews_data['negatives']])
        
        return f"""Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input_str}

### Response:
"""

    def _generate_text(self, prompt, max_tokens=200, temperature=0.3):
        """Génère du texte avec le modèle"""
        try:
            output = self.llm.create_completion(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=["<|eot_id|>", "###"]
            )
            return output["choices"][0]["text"].strip()
        except Exception as e:
            logging.error(f"Generation failed: {str(e)}")
            raise

    def _log_generation(self, prompt_type, input_data, output):
        """Journalise le processus de génération"""
        print(f"\n=== {prompt_type.upper()} GENERATION ===")
        print("\nINPUT DATA:\n")
        print(input_data)
        print("\nOUTPUT:\n")
        print(output)
        print("\n" + "="*50 + "\n")

    def generate_summary(self, sentiment_data):
        """Génère un résumé concis des avis"""
        if not self.model_loaded:
            return {"error": "Model not loaded", "status": "failed"}
        
        reviews = self._format_reviews(sentiment_data)
        prompt = self._build_prompt(
            "Generate a concise 2-3 sentence product summary. "
            "First mention the product name, then highlight key strengths "
            "followed by main criticisms. Keep it balanced and professional.",
            reviews
        )
        
        try:
            summary = self._generate_text(prompt)
            self._log_generation("SUMMARY", prompt, summary)
            
            return {
                "summary": summary,
                "status": "success",
                "input_data": prompt.split("### Input:")[1].strip()
            }
        except Exception as e:
            return {"error": str(e), "status": "failed"}

    def generate_recommendations(self, sentiment_data):
        """Génère des recommandations d'amélioration"""
        if not self.model_loaded:
            return {"error": "Model not loaded", "status": "failed"}
        
        reviews = self._format_reviews(sentiment_data)
        prompt = self._build_prompt(
            "Generate 3-5 specific improvement recommendations. "
            "based on the negative reviews. Use bullet points (•) and focus "
            "on actionable solutions. Address the company directly.",
            reviews
        )
        
        try:
            recommendations = self._generate_text(prompt, max_tokens=300)
            recommendations = self._format_recommendations(recommendations)
            self._log_generation("RECOMMENDATIONS", prompt, recommendations)
            
            return {
                "recommendations": recommendations,
                "status": "success",
                "input_data": prompt.split("### Input:")[1].strip()
            }
        except Exception as e:
            return {"error": str(e), "status": "failed"}

    def _format_recommendations(self, text):
        """Formate les recommandations générées"""
        # Standardise les puces
        text = text.replace("1.", "•").replace("2.", "•").replace("3.", "•")
        text = text.replace("- ", "• ").replace("* ", "• ")
        
        # Nettoie les sauts de ligne
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        return "\n".join(lines)

    def generate_full_analysis(self, sentiment_data):
        """Génère un rapport complet (résumé + recommandations)"""
        summary = self.generate_summary(sentiment_data)
        recommendations = self.generate_recommendations(sentiment_data)
        
        return {
            "summary": summary.get("summary", ""),
            "recommendations": recommendations.get("recommendations", ""),
            "status": "success" if all(r["status"] == "success" for r in [summary, recommendations]) else "partial",
            "input_data": {
                "summary": summary.get("input_data", ""),
                "recommendations": recommendations.get("input_data", "")
            }
        }