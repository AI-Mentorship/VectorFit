# processing.py
# Takes your test_model.py logic and makes it work with Flask

import pickle
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models
from colorthief import ColorThief
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
    """Load model once at startup"""
    global model, class_names
    
    try:
        print("Loading class names...")
        with open('models/class_names.pkl', 'rb') as f:
            original_classes = pickle.load(f)
        
        # Translate to English
        class_names = [translation_map[cls] for cls in original_classes]
        NUM_CLASSES = len(class_names)
        
        print("Loading model...")
        model = models.resnet50(pretrained=False)
        model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
        
        checkpoint = torch.load('models/best_model.pth', map_location='cpu', weights_only=False)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        
        print(f"✓ Model loaded with {NUM_CLASSES} classes")
        return True
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return False

def get_color_metadata(image_bytes):
    """
    Extract colors from IMAGE BYTES (not file path!)
    This is the key difference from test_model.py
    """
    try:
        # Save bytes to temp file for ColorThief
        temp_path = '/tmp/temp_image.jpg'
        with open(temp_path, 'wb') as f:
            f.write(image_bytes)
        
        color_thief = ColorThief(temp_path)
        dominant_color = color_thief.get_color(quality=1)
        palette = color_thief.get_palette(color_count=5, quality=1)
        
        os.remove(temp_path)
        
        return {
            'dominant_color': {
                'rgb': list(dominant_color),
                'name': rgb_to_color_name(dominant_color)
            },
            'palette': [
                {'rgb': list(color), 'name': rgb_to_color_name(color)}
                for color in palette
            ]
        }
    except Exception as e:
        print(f"Color extraction error: {e}")
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
        
        # Get top 3 predictions
        top3_probs, top3_indices = torch.topk(probabilities, 3)
        top3_predictions = [
            {
                'class': class_names[idx.item()],
                'confidence': round(prob.item() * 100, 2)
            }
            for prob, idx in zip(top3_probs, top3_indices)
        ]
        
        return {
            'predicted_class': class_names[pred.item()],
            'confidence': round(confidence.item() * 100, 2),
            'top_predictions': top3_predictions
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return None

def process_image(image_bytes):
    """
    Main processing function
    Takes raw image bytes, returns complete JSON response
    """
    if model is None:
        return {'success': False, 'error': 'Model not loaded'}
    
    # Get prediction
    prediction = predict_image(image_bytes)
    if prediction is None:
        return {'success': False, 'error': 'Prediction failed'}
    
    # Get colors
    colors = get_color_metadata(image_bytes)
    
    # Return JSON response
    return {
        'success': True,
        'clothing': prediction,
        'colors': colors
    }