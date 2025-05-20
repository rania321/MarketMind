from flask import Flask, request, jsonify
import base64
import pika
import jwt
import json
from PIL import Image
import io
import requests
import threading
import logging
import time
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# RabbitMQ host and JWT secret
RABBITMQ_HOST = 'rabbitmq'
JWT_SECRET = 'your_jwt_secret'

# Store responses for async handling
llama_response = {}
u2net_response = {}
audio_response = {}
original_image_data = None  # Store original image from API request

# Create RabbitMQ connection for a thread
def get_connection():
    try:
        return pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    except pika.exceptions.AMQPConnectionError:
        logging.error("RabbitMQ connection failed, retrying in 5 seconds...")
        time.sleep(5)
        return get_connection()

# Consumer thread function
def run_consumers():
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue='llm.prompt.queue', durable=True)
    channel.queue_declare(queue='llm.response.queue', durable=True)
    channel.queue_declare(queue='input_queue', durable=True)
    channel.queue_declare(queue='output_queue', durable=True)
    channel.queue_declare(queue='audio_queue', durable=True)
    channel.queue_declare(queue='audio_response_queue', durable=True)

    def llama3_consumer(ch, method, properties, body):
        global llama_response
        llama_response = json.loads(body)
        logging.info(f"Received Llama3 response: {body}")
        process_llama_response()
        check_and_send_to_stablediffusion()

    def u2net_consumer(ch, method, properties, body):
        global u2net_response
        u2net_response = json.loads(body)
        logging.info(f"Received U2Net response: {body}")

    def audio_consumer(ch, method, properties, body):
        global audio_response
        audio_response = json.loads(body)
        logging.info(f"Received Audio response: {body}")
        send_audio_to_user()

    channel.basic_consume(queue='llm.response.queue', on_message_callback=llama3_consumer, auto_ack=True)
    channel.basic_consume(queue='output_queue', on_message_callback=u2net_consumer, auto_ack=True)
    channel.basic_consume(queue='audio_response_queue', on_message_callback=audio_consumer, auto_ack=True)
    
    try:
        logging.info("Starting consumer thread")
        channel.start_consuming()
    except Exception as e:
        logging.error(f"Consumer error: {str(e)}")
        channel.close()
        connection.close()
        run_consumers()

# Simulate BLIP text extraction (replace with actual BLIP model integration)
def extract_text_from_image(image):
    return "A dark-brown glass bottle of hemp seed oil for body care  sits on a light beige surface.(america)"

# Format BLIP text into the specified prompt
def format_llama_prompt(blip_text):
    return {
        "prompt": (
            "Below is an instruction that describes a task, paired with an input that provides further context. "
            "Write a response that appropriately completes the request.\n\n"
            "### Instruction:\nGenerate a design informations for the following product.\n\n"
            f"### Input:\n{blip_text}\n\n"
            "### Response:"
        )
    }

# Process Llama3 response
def process_llama_response():
    if not llama_response:
        return
    user_id = llama_response.get('id', '')
    response_text = llama_response.get('response', '')
    
    # Log raw response for debugging
    logging.info(f"Raw Llama3 response text: {response_text}")
    
    # Parse response into sections
    def parse_llama_response(response_text):
        try:
            # Decode escaped Unicode and clean leading/trailing colons
            response_text = response_text.encode().decode('unicode_escape')
            response_text = response_text.strip(':\n')
            # Normalize newlines
            response_text = re.sub(r'\n+', '\n', response_text)
            logging.info(f"Cleaned response text: {response_text}")
            
            sections = {'Inpainting Prompt': '', 'Audio Narration': '', 'Social Media Post': '', 'Hashtags': ''}
            current_section = None
            lines = response_text.split('\n')
            for line in lines:
                line = line.strip()
                logging.info(f"Processing line: {line}")
                # Match headers like ### Inpainting Prompt, ### Social Media Post
                header_match = re.match(r'^###\s*(.+)$', line)
                if header_match:
                    section_name = header_match.group(1).strip()
                    logging.info(f"Detected section: {section_name}")
                    if section_name in sections:
                        current_section = section_name
                elif current_section and line:
                    sections[current_section] += line + '\n'
            
            parsed_sections = {k: v.strip() for k, v in sections.items()}
            logging.info(f"Final parsed sections: {parsed_sections}")
            return parsed_sections
        except Exception as e:
            logging.error(f"Failed to parse Llama3 response: {str(e)}")
            return {'Inpainting Prompt': '', 'Audio Narration': '', 'Social Media Post': '', 'Hashtags': ''}
    
    parsed = parse_llama_response(response_text)
    logging.info(f"Parsed Llama3 response: {parsed}")
    frontend_queue = f'user_123_frontend'
    
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=frontend_queue, durable=True)
    channel.queue_declare(queue='audio_queue', durable=True)
    
    # Send Social Media Post + Hashtags to userfrontend
    frontend_data = {
        'social_media_post': parsed.get('Social Media Post', ''),
        'hashtags': parsed.get('Hashtags', '')
    }
    channel.basic_publish(exchange='', routing_key=frontend_queue, body=json.dumps(frontend_data))
    logging.info(f"Sent to frontend queue: {frontend_data}")
    
    # Send Audio Narration to audio microservice
    audio_data = {'narration': parsed.get('Audio Narration', ''), 'id': user_id}
    channel.basic_publish(exchange='', routing_key='audio_queue', body=json.dumps(audio_data))
    logging.info(f"Sent to audio queue: {audio_data}")
    
    # Store Inpainting Prompt for StableDiffusion
    llama_response['inpainting_prompt'] = parsed.get('Inpainting Prompt', '')
    
    channel.close()
    connection.close()

# Check and send to StableDiffusion
def check_and_send_to_stablediffusion():
    global llama_response, u2net_response, original_image_data
    print(llama_response,flush=True)
    print(u2net_response,flush=True)
    print(original_image_data,flush=True)
    stablediffusion_url = 'https://5000-dep-01jtzvaanrd4yr9q9yzwffrkw5-d.cloudspaces.litng.ai/predict'
    headers = {
        'HOST': '5000-dep-01jtzvaanrd4yr9q9yzwffrkw5-d.cloudspaces.litng.ai'
    }
    payload = {
        'prompt': llama_response.get('inpainting_prompt', ''),
        'mask': u2net_response.get('imagedata', ''),
        'image': original_image_data  # Original image from API request
    }
    try:
        logging.info("Sending request to StableDiffusion with headers")
        response = requests.post(stablediffusion_url, json=payload, headers=headers)
        print(response,flush=True)
        logging.info(f"StableDiffusion response: {response.status_code}, {response}")
        if response.status_code == 200:
            with open("restored_image_base64.txt", "w") as f:
                f.write(response.json().get('image', ''))
            send_image_to_user(response.json().get('image', ''))
        # Clear responses to prevent reuse
        llama_response = {}
        u2net_response = {}
        original_image_data = None
    except Exception as e:
        logging.error(f"StableDiffusion request failed: {str(e)}")
# Send audio to user
def send_audio_to_user():
    user_id = audio_response.get('id', '')
    frontend_queue = f'user_123_frontend'
    
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=frontend_queue, durable=True)
    channel.basic_publish(exchange='', routing_key=frontend_queue, body=json.dumps({'audio': audio_response.get('audio', '')}))
    channel.close()
    connection.close()

# Send image to user
def send_image_to_user(image_data):
    user_id = llama_response.get('id', '') or u2net_response.get('id', '')
    frontend_queue = f'user_123_frontend'
    
    connection = get_connection()
    channel = connection.channel()
    channel.queue_declare(queue=frontend_queue, durable=True)
    channel.basic_publish(exchange='', routing_key=frontend_queue, body=json.dumps({'image': image_data}))
    channel.close()
    connection.close()

# API endpoint to accept image
@app.route('/upload', methods=['POST'])
def upload_image():
    connection = None
    try:
        # Hardcoded user_id (JWT commented out)
        user_id = "123"

        # Get image
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        image_file = request.files['image']
        image = Image.open(image_file.stream)

        # Extract text with BLIP
        text = extract_text_from_image(image)

        # Format text for Llama3
        llama_prompt = format_llama_prompt(text)

        # Encode image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        global original_image_data
        original_image_data = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Publish messages
        connection = get_connection()
        channel = connection.channel()
        channel.queue_declare(queue='llm.prompt.queue', durable=True)
        channel.queue_declare(queue='input_queue', durable=True)
        channel.queue_declare(queue='audio_queue', durable=True)

        # Send to Llama3
        llama_data = {'prompt': llama_prompt['prompt'], 'id': user_id}
        channel.basic_publish(exchange='', routing_key='llm.prompt.queue', body=json.dumps(llama_data))
        logging.info(f"Sent to llm.prompt.queue: {llama_data}")

        # Send to U2Net
        u2net_data = {'imagedata': original_image_data, 'id': user_id}
        channel.basic_publish(exchange='', routing_key='input_queue', body=json.dumps(u2net_data))
        logging.info(f"Sent to input_queue: {u2net_data}")

        return jsonify({'status': 'Processing started'}), 202
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and not connection.is_closed:
            connection.close()

if __name__ == '__main__':
    threading.Thread(target=run_consumers, daemon=True).start()
    app.run(host='0.0.0.0', port=8001)