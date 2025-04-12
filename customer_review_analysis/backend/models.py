from pymongo import MongoClient
from config import DB_NAME, MONGO_URI

class Database:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
    
    def get_products_collection(self):
        return self.db["products"]
    
    def get_reviews_collection(self):
        return self.db["reviews"]
    
    def get_sentiment_results_collection(self):
        return self.db["sentiment_results"]
    
    def get_topic_results_collection(self):
        return self.db["topic_results"]
    
    def close_connection(self):
        self.client.close()

# Sentiment Analysis Model
class SentimentModel:
    def __init__(self, model_name="Nourhen2001/fine-tuned-bert-sentiment-v1"):
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    def analyze(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        outputs = self.model(**inputs)
        probabilities = outputs.logits.softmax(dim=-1).tolist()[0]
        
        sentiment_labels = ["negative", "neutral", "positive"]
        predicted_index = probabilities.index(max(probabilities))
        
        return {
            "sentiment": sentiment_labels[predicted_index],
            "probabilities": {
                "negative": probabilities[0],
                "neutral": probabilities[1],
                "positive": probabilities[2]
            }
        }

# Topic Classification Model
class TopicModel:
    def __init__(self, model_name="Nourhen2001/camembert-base-Topic-v1"):
        from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
        from sklearn.preprocessing import LabelEncoder
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(['price', 'service', 'quality', 'delivery'])
        
        self.classifier = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer
        )
    
    def classify(self, text):
        result = self.classifier(text)
        label_idx = int(result[0]['label'].split('_')[-1])
        
        return {
            "topic": self.label_encoder.inverse_transform([label_idx])[0],
            "confidence": float(result[0]['score'])
        }

# Word Frequency Analyzer
class WordFrequencyAnalyzer:
    def __init__(self):
        self.stop_words = {
            'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 
            'avec', 'pour', 'dans', 'sur', 'est', 'son', 'sa', 'ses', 'qui', 
            'que', 'qu', 'au', 'aux', 'en', 'a', 'à', 'pas', 'ne', 'ce', 'cet',
            'cette', 'ces', 'il', 'elle', 'ils', 'elles', 'je', 'tu', 'nous',
            'vous', 'on', 'se', 'sont', 'comme', 'mais', 'donc', 'or', 'ni', 'car'
        }
    
    def analyze(self, texts):
        from collections import defaultdict
        import re
        
        word_counts = {
            'positive': defaultdict(int),
            'neutral': defaultdict(int),
            'negative': defaultdict(int)
        }
        
        for text_data in texts:
            text = text_data.get('review_text', '')
            sentiment = text_data.get('sentiment', 'neutral')
            
            words = re.findall(r'\b\w{4,}\b', text.lower())
            for word in words:
                if word not in self.stop_words:
                    word_counts[sentiment][word] += 1
        
        return word_counts