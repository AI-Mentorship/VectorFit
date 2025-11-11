from flask import Flask, request, jsonify
from flask_cors import CORS
from processing import load_model, process_image
from dotenv import load_dotenv
from embed import embed_cv_json
import json

app = Flask(__name__)
CORS(app)

# load environment variables from .env (if present)
load_dotenv()

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
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided. Send as form-data with key "image"'
            }), 400
        
        file = request.files['image']
        
        print("\n" + "=" * 60)
        print("📸 IMAGE RECEIVED")
        print("=" * 60)
        
        image_bytes = file.read()
        
        result = process_image(image_bytes)
        
        if result['success']:
            print("\nPREDICTION SUCCESS")
            print("-" * 60)
            print(f"Clothing Type: {result['clothing']['predicted_class']}")
            print(f"Confidence: {result['clothing']['confidence']:.2f}%")
            print("\nTop 3 Predictions:")
            for i, pred in enumerate(result['clothing']['top_predictions'][:3], 1):
                print(f"  {i}. {pred['class']}: {pred['confidence']:.2f}%")


            # Attempt to embed the JSON result into Pinecone (won't raise on failure)
            try:
                item_id = embed_cv_json(result)
                result['embedded_id'] = item_id
                print(f"\n📌 Embedded in Pinecone: {item_id}")
            except Exception as e:
                # attach error info to response but don't fail the prediction
                result['embed_error'] = str(e)
                print(f"\n⚠️ Embedding failed: {e}")



            print(f"\n🎨 Dominant Color: {result['colors']['dominant_color']['name']}")
            print(f"   RGB: {result['colors']['dominant_color']['rgb']}")
            
            print("\nColor Palette:")
            for i, color in enumerate(result['colors']['palette'], 1):
                # Handle both with and without percentage key
                percentage_str = f" ({color['percentage']:.1f}%)" if 'percentage' in color else ""
                print(f"  {i}. {color['name']}: RGB{tuple(color['rgb'])}{percentage_str}")
            
            print("\nFull JSON Response:")
            print(json.dumps(result, indent=2))
            print("=" * 60 + "\n")
        else:
            print(f"\nPREDICTION FAILED: {result.get('error', 'Unknown error')}\n")
        
        return jsonify(result), 200 if result['success'] else 500
    
    except Exception as e:
        print(f"\nERROR processing request: {str(e)}\n")
        import traceback
        traceback.print_exc()  # This will show the full error trace
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    print("=" * 50)
    print("Starting Flask Server...")
    print("=" * 50)
    
    if load_model():
        print("✓ Ready to receive images")
    else:
        print("⚠ Model failed to load")
    
    print("Server: http://localhost:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)