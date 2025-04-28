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



 

class SummaryModel:
    def __init__(self):
        self.model_loaded = False
        self.llm = None
        self.model_path = None
        # Call load_model() during initialization
        self.load_model()

    def load_model(self):
        """Load the model, reusing the local file if it exists."""
        try:
            # Initialize with your HuggingFace token
            login(token="")
            
            # Verify and download model
            api = HfApi()
            repo_files = api.list_repo_files("Nourhen2001/ReviewLlama_Sum_Req_gguf")
            gguf_files = [f for f in repo_files if f.endswith('.gguf')]
            
            if not gguf_files:
                raise ValueError("No GGUF files found in repository")
                
            model_filename = gguf_files[0]
            local_model_path = os.path.join("models", model_filename)
            
            # Check if the model file already exists locally
            if os.path.exists(local_model_path):
                logging.info(f"Model found locally at {local_model_path}, reusing it.")
                self.model_path = local_model_path
            else:
                logging.info(f"Downloading model {model_filename}...")
                self.model_path = hf_hub_download(
                    repo_id="Nourhen2001/ReviewLlama_Sum_Req_gguf",
                    filename=model_filename,
                    local_dir="models"
                )
                logging.info(f"Model downloaded to {self.model_path}")
            
            # Initialize LLM with reduced requirements
            logging.info("Initializing Llama model...")
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=1024,  # Reduced context window
                n_threads=4,  # Reduced threads
                n_gpu_layers=0  # CPU only
            )
            self.model_loaded = True
            logging.info("Model loaded successfully.")
            
        except Exception as e:
            logging.error(f"Model loading failed: {str(e)}")
            self.model_loaded = False
            raise

    def generate_summary(self, sentiment_data):
        print("\n--- Starting Summary Generation ---")
        if not self.model_loaded:
            print("Error: Model not loaded")
            return {"error": "Model not initialized", "status": "failed"}
        
        try:
            print("Counting sentiment reviews...")
            analyses = sentiment_data.get('analyses', [])
            print(f"Found {len(analyses)} reviews to analyze")
            
            sentiment_counts = {
                "positive": len([a for a in analyses if a.get('sentiment') == 'positive']),
                "negative": len([a for a in analyses if a.get('sentiment') == 'negative']),
                "neutral": len([a for a in analyses if a.get('sentiment') == 'neutral'])
            }
            print(f"Sentiment counts: {sentiment_counts}")

            print("Creating summary prompt...")
            summary_prompt = self._create_summary_prompt(sentiment_counts)
            print("Prompt created, generating text...")
            
            summary = self._generate_text(summary_prompt, max_tokens=150, temperature=0.3)  # Reduced max_tokens and temperature
            print("Summary generated successfully")
            
            print("Creating recommendations prompt...")
            rec_prompt = self._create_recommendation_prompt(sentiment_counts)
            print("Generating recommendations...")
            
            recommendations = self._generate_text(rec_prompt, max_tokens=200, temperature=0.4)  # Reduced max_tokens and temperature
            print("Recommendations generated successfully")
            
            return {
                "summary": summary,
                "recommendations": recommendations,
                "status": "success"
            }
            
        except Exception as e:
            print(f"Error during generation: {str(e)}")
            return {"error": str(e), "status": "failed"}

    def _create_summary_prompt(self, counts):
        """Create the summary prompt template"""
        return f"""
        <|begin_of_text|>Below is an instruction that describes a task. 
        Write a response that appropriately completes the request.

        ### Instruction:
        Summarize customer sentiment in 2-3 concise sentences based on:
        - {counts['positive']} positive reviews
        - {counts['negative']} negative reviews
        - {counts['neutral']} neutral reviews

        Highlight:
        1. Overall satisfaction level
        2. Main strengths
        3. Key complaints

        ### Response:
        """

    def _create_recommendation_prompt(self, counts):
        """Create the recommendations prompt template"""
        return f"""
        <|begin_of_text|>Below is an instruction that describes a task. 
        Write a response that appropriately completes the request.

        ### Instruction:
        Generate 3-5 bullet-point recommendations for improvement based on:
        - {counts['negative']} negative reviews
        - Common themes in feedback

        Make each recommendation specific and actionable.

        ### Response:
        """

    def _generate_text(self, prompt, max_tokens=150, temperature=0.3):
        """Safe text generation with error handling"""
        try:
            print("Starting text generation...")
            output = self.llm.create_completion(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=["<|eot_id|>"]
            )
            print("Text generation completed")
            return output["choices"][0]["text"].strip()
        except Exception as e:
            logging.error(f"Text generation failed: {str(e)}")
            raise RuntimeError("Failed to generate text from model")