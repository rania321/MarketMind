from flask import Flask, send_from_directory
from routes import api_routes
import os
from flask_cors import CORS

app = Flask(__name__, static_folder='..../../frontend') 
CORS(app)  # Enable CORS for all routes

# Register Blueprint
app.register_blueprint(api_routes, url_prefix="/api")

# Route to serve images
@app.route('/api/uploads/images/<filename>')
def serve_image(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'images')
    return send_from_directory(uploads_dir, filename)

# Serve frontend
@app.route('/')
def serve_frontend():
    return send_from_directory('../../frontend', 'homeAnalyseBO1.html')

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../../frontend', path)

if __name__ == "__main__":
    app.run(debug=True)