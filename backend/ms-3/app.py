from flask import Flask, request, jsonify
from llama_cpp import Llama
from multiprocessing import Process, Queue
import logging
import traceback
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

# Global variables
llama_model = None
model_queue = Queue()

# Function to load the model in a separate process
def load_model(queue):
    try:
        logging.info("Starting to load LLaMA model...")
        start_time = time.time()
        model = Llama(model_path="./models/unsloth.Q4_K_M.gguf", n_gpu_layers=40, verbose=True)
        logging.info(f"LLaMA model loaded successfully! Time taken: {time.time() - start_time:.2f} seconds")
        queue.put({"status": "success", "message": "Model loaded"})
        return {"status": "success", "message": "Model loaded"}  # Return statement
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        logging.error(error_msg)
        logging.error(traceback.format_exc())
        queue.put({"status": "error", "message": str(e)})
        return {"status": "error", "message": str(e)}

# Start model loading
logging.info("Initiating model loading process...")
model_process = Process(target=load_model, args=(model_queue,))
model_process.start()
logging.info("Model loading process started")

@app.route("/generate-text", methods=["POST"])
def generate_text():
    global llama_model
    if llama_model is None:
        load_result = None if model_queue.empty() else model_queue.get()
        if load_result and load_result["status"] == "success":
            try:
                logging.info("Loading model in main process...")
                llama_model = Llama(model_path="./models/unsloth.Q4_K_M.gguf", n_gpu_layers=40)
            except Exception as e:
                logging.error(f"Failed to load model in main process: {str(e)}")
                return jsonify({"error": f"Failed to load model in main process: {str(e)}"}), 500
        elif load_result and load_result["status"] == "error":
            return jsonify({"error": "Model loading failed", "details": load_result["message"]}), 500
        else:
            return jsonify({"error": "Model is still loading", "details": load_result}), 503
    
    prompt = request.json.get("prompt")
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    try:
        response = llama_model(prompt, stop=["<|eot_id|>"])
        return jsonify({"response": response["choices"][0]["text"]})
    except Exception as e:
        logging.error(f"Error generating text: {str(e)}")
        return jsonify({"error": f"Error generating text: {str(e)}"}), 500

@app.route("/model-status", methods=["GET"])
def model_status():
    global llama_model
    load_result = None if model_queue.empty() else model_queue.get()
    return jsonify({
        "status": "loaded" if llama_model is not None else "loading",
        "load_result": load_result
    })

@app.route("/test", methods=["GET"])
def hello():
    return jsonify({"message": "Hello"})

if __name__ == "__main__":
    logging.info("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000)