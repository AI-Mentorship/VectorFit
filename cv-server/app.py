# app.py
# Flask server - receives images from frontend

from flask import Flask, request, jsonify
from processing import load_model, process_image
# import embedding helper
from embed import embed_cv_json

app = Flask(__name__)

@app.route("/")
def index():
    return {"message": "CV Model Server Running"}

@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives image from frontend and returns prediction + colors
    
    Frontend sends: multipart/form-data with 'image' field
    Returns: JSON with clothing type and color data
    """
    try:
        # Check if image was sent
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided. Send as form-data with key "image"'
            }), 400
        
        # Get the image file
        file = request.files['image']
        
        # Read image as bytes (this is what processing.py expects)
        image_bytes = file.read()
        
        # Process it (prediction + colors)
        result = process_image(image_bytes)

        # If processing succeeded, attempt to embed the JSON into Pinecone
        if result.get('success'):
            try:
                # embed_cv_json will generate an ID if not provided
                item_id = embed_cv_json(result)
                # attach embed id to response for debugging/tracking
                result['embedded_id'] = item_id
            except Exception as e:
                # Don't fail the request if embedding fails; log into response
                result['embed_error'] = str(e)

        # Return JSON response
        return jsonify(result), 200 if result.get('success') else 500
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Starting Flask Server...")
    print("=" * 50)
    
    # Load model once at startup
    if load_model():
        print("✓ Ready to receive images")
    else:
        print("⚠ Model failed to load")
    
    print("Server: http://localhost:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)