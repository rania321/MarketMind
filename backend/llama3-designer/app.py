from flask import Flask, request, jsonify
from llama_cpp import Llama
import os
import json
import pika
from multiprocessing import Process, Queue
import logging
import threading
from queue import Empty
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError

app = Flask(__name__)

# Configuration
MODEL_PATH = "./models/unsloth.Q4_K_M_v2.gguf"
RABBITMQ_HOST = "rabbitmq"
PROMPT_QUEUE = "llm.prompt.queue"
RESPONSE_QUEUE = "llm.response.queue"
INFERENCE_TIMEOUT = 320  # Increased to handle 300-second inference
MAX_TOKENS = 300  # Kept at 200 to avoid excessive generation time
HEARTBEAT_INTERVAL = 600  # RabbitMQ heartbeat to keep connection alive
BLOCKED_CONNECTION_TIMEOUT = 360  # Extended to support long-running tasks

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Queues for LLM inference (kept for Flask compatibility)
inference_queue = Queue()
result_queue = Queue()

# Thread pool for async inference
executor = ThreadPoolExecutor(max_workers=4)  # Supports up to 4 concurrent inferences

# Flask routes
@app.route("/inference", methods=["POST"])
def inference():
    data = request.get_json(silent=True)
    prompt = data.get("prompt") if data else None
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    inference_queue.put(("flask", prompt))
    try:
        result = result_queue.get(timeout=INFERENCE_TIMEOUT)
        return jsonify({"response": result})
    except Empty:
        logger.error("[ERROR] Timed out waiting for LLM response")
        return jsonify({"error": "Timed out waiting for response"}), 500

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# RabbitMQ Consumer Process
def rabbitmq_consumer():
    def process_message(ch, method, properties, body, llm):
        start_time = time.time()
        msg_id = "unknown"
        try:
            data = json.loads(body)
            prompt = data.get("prompt")
            msg_id = data.get("id", "unknown")
            if not prompt:
                raise ValueError("Missing 'prompt' in message")

            logger.info(f"[INFO] Processing message (id: {msg_id}) with prompt: {prompt[:50]}...")

            # Submit inference to thread pool
            future = executor.submit(llm, prompt, max_tokens=MAX_TOKENS)
            try:
                result = future.result(timeout=INFERENCE_TIMEOUT)
                response = result["choices"][0]["text"]
                inference_time = time.time() - start_time
                logger.info(f"[INFO] Inference completed in {inference_time:.2f} seconds (id: {msg_id})")
            except TimeoutError:
                inference_time = time.time() - start_time
                logger.error(f"[ERROR] Timed out after {inference_time:.2f} seconds waiting for LLM response (id: {msg_id})")
                raise TimeoutError("Timed out waiting for LLM response")

            # Publish response
            if ch.is_open:
                ch.basic_publish(
                    exchange='',
                    routing_key=RESPONSE_QUEUE,
                    body=json.dumps({"id": msg_id, "response": response})
                )
                logger.info(f"[INFO] Message sent (id: {msg_id})")
                ch.basic_ack(delivery_tag=method.delivery_tag)
            else:
                logger.error("[ERROR] Channel closed, cannot publish response (id: {msg_id})")
                raise ValueError("Channel closed during publish")
        except Exception as e:
            inference_time = time.time() - start_time
            logger.error(f"[ERROR] Failed to process message after {inference_time:.2f} seconds: {e} (id: {msg_id})")
            if ch.is_open:
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            else:
                logger.error("[ERROR] Channel closed, cannot nack message (id: {msg_id})")

    def on_connection_open(connection):
        logger.info("[INFO] RabbitMQ connection opened")
        connection.channel(on_open_callback=on_channel_open)

    def on_channel_open(channel):
        logger.info("[INFO] RabbitMQ channel opened")
        channel.queue_declare(queue=PROMPT_QUEUE, durable=True, callback=lambda x: None)
        channel.queue_declare(queue=RESPONSE_QUEUE, durable=True, callback=lambda x: None)
        channel.basic_qos(prefetch_count=1)
        
        # Initialize LLM in consumer process for async processing
        try:
            llm = Llama(model_path=MODEL_PATH, n_threads=8)
            logger.info("[INFO] LLama initialized in RabbitMQ consumer")
        except Exception as e:
            logger.error(f"[ERROR] Failed to load LLama in consumer: {e}")
            connection.close()
            return

        def on_message(ch, method, properties, body):
            # Process message in a separate thread to avoid blocking the I/O loop
            threading.Thread(target=process_message, args=(ch, method, properties, body, llm), daemon=True).start()

        channel.basic_consume(queue=PROMPT_QUEUE, on_message_callback=on_message)
        global consumer_channel
        consumer_channel = channel
        logger.info("[INFO] RabbitMQ consumer ready")

    def on_connection_closed(connection, reason):
        logger.error(f"[ERROR] Connection closed: {reason}. Reconnecting...")
        global consumer_channel
        consumer_channel = None
        connection.ioloop.stop()
        start_connection()

    def start_connection():
        global consumer_channel
        consumer_channel = None
        credentials = pika.PlainCredentials('guest', 'guest')  # Replace with your credentials
        parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            credentials=credentials,
            heartbeat=HEARTBEAT_INTERVAL,
            blocked_connection_timeout=BLOCKED_CONNECTION_TIMEOUT
        )
        connection = pika.SelectConnection(
            parameters=parameters,
            on_open_callback=on_connection_open,
            on_close_callback=on_connection_closed
        )
        try:
            connection.ioloop.start()
        except KeyboardInterrupt:
            connection.close()
            connection.ioloop.stop()
            logger.info("[INFO] RabbitMQ consumer stopped")

    start_connection()

# Main
if __name__ == "__main__":
    if not os.path.exists(MODEL_PATH):
        logger.error(f"[ERROR] Model not found at {MODEL_PATH}")
        exit(1)

    # Start RabbitMQ consumer process
    rabbitmq_process = Process(target=rabbitmq_consumer, daemon=True)
    rabbitmq_process.start()

    # Start Flask in main process
    app.run(host="0.0.0.0", port=5000, threaded=True)