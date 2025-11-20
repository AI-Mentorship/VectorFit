# processing.py
# Takes your test_model.py logic and makes it work with Flask

import pickle
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models
from colorthief import ColorThief # type: ignore
import io
import os


# Translation dictionary
translation_map = {
    'Blazer': 'Blazer',
    'Celana_Panjang': 'Trousers/Long Pants',
    'Celana_Pendek': 'Shorts',
    'Gaun': 'Dress',
    'Hoodie': 'Hoodie',
    'Jaket': 'Jacket',
    'Jaket_Denim': 'Denim Jacket',
    'Jaket_Olahraga': 'Sports Jacket',
    'Jeans': 'Jeans',
    'Kaos': 'T-Shirt',
    'Kemeja': 'Button-Up Shirt',
    'Mantel': 'Coat',
    'Polo': 'Polo Shirt',
    'Rok': 'Skirt',
    'Sweter': 'Sweater'
}

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Global variables (loaded once at startup)
model = None
class_names = None

def rgb_to_color_name(rgb):
    """Convert RGB to color name"""
    r, g, b = rgb
    
    if r > 200 and g > 200 and b > 200:
        return "White"
    elif r < 50 and g < 50 and b < 50:
        return "Black"
    elif r > 150 and g < 100 and b < 100:
        return "Red"
    elif r < 100 and g > 150 and b < 100:
        return "Green"
    elif r < 100 and g < 100 and b > 150:
        return "Blue"
    elif r > 150 and g > 150 and b < 100:
        return "Yellow"
    elif r > 150 and g < 100 and b > 150:
        return "Purple"
    elif r < 150 and g > 150 and b > 150:
        return "Cyan"
    elif r > 150 and g > 100 and b < 100:
        return "Orange"
    elif r > 100 and g > 100 and b > 100:
        return "Gray"
    else:
        return "Mixed"

def load_model():
    """Load model once at startup - optimized for speed"""
    global model, class_names

    try:
        # Fast class name loading
        with open('models/class_names.pkl', 'rb') as f:
            original_classes = pickle.load(f)

        class_names = [translation_map[cls] for cls in original_classes]
        NUM_CLASSES = len(class_names)

        # Fast model loading with optimizations
        model = models.resnet50(pretrained=False)
        model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

        # Load checkpoint with CPU optimization
        checkpoint = torch.load(
            'models/best_model.pth',
            map_location='cpu',
            weights_only=False
        )
        model.load_state_dict(checkpoint['model_state_dict'])

        # Set to eval mode and optimize for inference
        model.eval()

        # JIT compile for faster inference (optional, adds ~1s to cold start but faster inference)
        # model = torch.jit.script(model)

        print(f"✓ Model loaded ({NUM_CLASSES} classes)")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def get_color_metadata(image_bytes):
    """
    Extract dominant color from IMAGE BYTES (not file path!)
    Uses in-memory processing with BytesIO
    """
    try:
        # Use BytesIO to create file-like object from bytes
        image_file = io.BytesIO(image_bytes)

        color_thief = ColorThief(image_file)
        dominant_color = color_thief.get_color(quality=1)

        return {
            'rgb': list(dominant_color),
            'name': rgb_to_color_name(dominant_color)
        }
    except Exception as e:
        print(f"Color extraction error: {e}")
        import traceback
        traceback.print_exc()
        return None

def predict_image(image_bytes):
    """
    Predict from IMAGE BYTES (not file path!)
    Frontend sends raw image data, not a file path
    """
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Preprocess
        input_tensor = transform(img).unsqueeze(0)

        # Predict
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            confidence, pred = torch.max(probabilities, 0)

        return {
            'clothing_type': class_names[pred.item()],
            'confidence': round(confidence.item() * 100, 2)
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return None

def process_image(image_bytes):
    """
    Main processing function
    Takes raw image bytes, returns simplified JSON response
    """
    if model is None:
        return {'success': False, 'error': 'Model not loaded'}

    # Get prediction
    prediction = predict_image(image_bytes)
    if prediction is None:
        return {'success': False, 'error': 'Prediction failed'}

    # Get dominant color only
    dominant_color = get_color_metadata(image_bytes)

    # Return simplified JSON response
    return {
        'success': True,
        'clothing_type': prediction['clothing_type'],
        'confidence': prediction['confidence'],
        'dominant_color': dominant_color
    }