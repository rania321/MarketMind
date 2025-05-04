from flask import Flask, render_template, request, jsonify
from llama_cpp import Llama
import os

app = Flask(__name__)

# Configuration du modèle
MODEL_PATH = os.path.join("models", "unslothModelSum.gguf")

# Chargement du modèle GGUF avec llama-cpp-python
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,  # Taille du contexte
    n_threads=4,  # Nombre de threads CPU à utiliser
    n_gpu_layers=0  # Nombre de couches à mettre sur GPU (si disponible)
)

# Template ALPACA modifié
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input}

### Response:
"""

def generate_response(instruction, input_text, max_tokens=128):
    prompt = alpaca_prompt.format(
        instruction=instruction,
        input=input_text
    )
    
    # Génération avec le modèle GGUF
    output = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=0.7,
        top_p=0.9,
        echo=False,
        stop=["###"]
    )
    
    return output['choices'][0]['text'].strip()

@app.route('/')
def home():
    return render_template('indexTest.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    review_text = data.get('text')
    analysis_type = data.get('type')
    
    if not review_text:
        return jsonify({"success": False, "error": "No text provided"})
    
    try:
        if analysis_type == "summary":
            instruction = "Summarize these customer reviews highlighting key positives and negatives."
            max_tokens = 150
        elif analysis_type == "recommendations":
            instruction = "Generate 3 actionable product improvement recommendations based on this feedback:"
            max_tokens = 200
        else:
            instruction = "Analyze this customer review and provide insights:"
            max_tokens = 128
        
        result = generate_response(
            instruction=instruction,
            input_text=review_text,
            max_tokens=max_tokens
        )
        
        return jsonify({"success": True, "result": result})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)