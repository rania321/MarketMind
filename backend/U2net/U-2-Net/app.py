import os
import base64
import json
import io
from flask import Flask, request, jsonify
import pika

import torch

from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import numpy as np
from PIL import Image
from model import U2NET  # full size version 173.6 MB
from model import U2NETP  # small version u2net 4.7 MB
import sys
app = Flask(__name__)

# RabbitMQ configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
INPUT_QUEUE = os.getenv('input_queue', 'input_queue')
OUTPUT_QUEUE = os.getenv('output_queue', 'output_queue')

# Model configuration
MODEL_NAME = os.getenv('MODEL_NAME', 'u2net')  # or 'u2netp'
MODEL_DIR = os.path.join(os.getcwd(), 'saved_models', MODEL_NAME, MODEL_NAME + '.pth')

# Initialize model
if MODEL_NAME == 'u2net':
    print("...load U2NET---173.6 MB")
    net = U2NET(3, 1)
elif MODEL_NAME == 'u2netp':
    print("...load U2NEP---4.7 MB")
    net = U2NETP(3, 1)

if torch.cuda.is_available():
    net.load_state_dict(torch.load(MODEL_DIR))
    net.cuda()
else:
    net.load_state_dict(torch.load(MODEL_DIR, map_location='cpu'))
net.eval()

class ImageProcessor:
    def __init__(self):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST))
        self.channel = self.connection.channel()
        #self.channel.queue_declare(queue=INPUT_QUEUE)
        #self.channel.queue_declare(queue=OUTPUT_QUEUE)

    def normalize_pred(self, d):
        ma = torch.max(d)
        mi = torch.min(d)
        dn = (d - mi) / (ma - mi)
        return dn

    def process_image(self, image_data):

        print("hey",flush=True)
        # Convert base64 to PIL Image
        image = Image.open(io.BytesIO(base64.b64decode(image_data))).convert('RGB')
        print("converted",flush=True)
        # Transform the image for the model
        transform = transforms.Compose([
            transforms.Resize((320, 320)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        print("transform",flush=True)
        inputs = transform(image).unsqueeze(0)
        
        if torch.cuda.is_available():
            inputs = Variable(inputs.cuda())
        else:
            inputs = Variable(inputs)

        # Run inference
        with torch.no_grad():
            d1, d2, d3, d4, d5, d6, d7 = net(inputs)

        # Normalize the prediction
        pred = d1[:, 0, :, :]
        pred = self.normalize_pred(pred)

        # Convert prediction to mask image
        predict_np = pred.squeeze().cpu().data.numpy()
        mask_image = Image.fromarray(predict_np * 255).convert('L')
        print("predict",flush=True)
        # Resize to original dimensions
        original_size = image.size
        mask_image = mask_image.resize(original_size, Image.BILINEAR)
        print("mask",flush=True)
        # Convert mask to base64
        buffered = io.BytesIO()
        mask_image.save(buffered, format="PNG")
        mask_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        print("base64   ",flush=True)
        return mask_base64

    def callback(self, ch, method, properties, body):
        try:
            print("hey hey hey",flush=True)
            message = json.loads(body)
            image_id = message['id']
            image_data = message['imagedata']
            
            print(f"Processing image ID: {image_id}")
            
            # Process the image
            mask_data = self.process_image(image_data)
            
            # Prepare response
            response = {
                'id': image_id,
                'imagedata': mask_data
            }
            
            print(f"about to send")
            self.channel.basic_publish(
                exchange='',
                routing_key=OUTPUT_QUEUE,
                body=json.dumps(response)
            )
            print(f"already sent")
            print(f"Processed image ID: {image_id} and sent to output queue")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"Error processing message: {str(e)}")

    def start_consuming(self):
        print(f"I work ")
        self.channel.basic_consume(
            queue=INPUT_QUEUE,
            on_message_callback=self.callback,
            auto_ack=False
        )
        print(' [*] Waiting for messages. To exit press CTRL+C')
        self.channel.start_consuming()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    processor = ImageProcessor()
    
    # Start RabbitMQ consumer in a separate thread
    import threading
    rabbit_thread = threading.Thread(target=processor.start_consuming)
    rabbit_thread.daemon = True
    rabbit_thread.start()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5002)