# test_model.py
import pickle
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models
from colorthief import ColorThief
import matplotlib.pyplot as plt

# Load class names
print("Loading class names...")
with open('models/class_names.pkl', 'rb') as f:
    original_classes = pickle.load(f)

print(f"Original classes: {original_classes}")

# Translation dictionary (Indonesian to English)
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

# Create English class names list (same order as original)
class_names = [translation_map[cls] for cls in original_classes]
print(f"English classes: {class_names}")

NUM_CLASSES = len(class_names)

# Recreate model architecture (ResNet50, not ResNet18!)
print("Loading model...")
model = models.resnet50(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

# Load the checkpoint
checkpoint = torch.load('models/best_model.pth', map_location='cpu', weights_only=False)

# Extract just the model weights
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()  # Set to evaluation mode

# Image preprocessing (same as training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def get_color_metadata(image_path):
    """Extract color information from the clothing image"""
    color_thief = ColorThief(image_path)
    
    # Get dominant color
    dominant_color = color_thief.get_color(quality=1)
    
    # Get color palette (5 most common colors)
    palette = color_thief.get_palette(color_count=5, quality=1)
    
    return {
        'dominant_color': dominant_color,
        'palette': palette
    }

def rgb_to_color_name(rgb):
    """Convert RGB to approximate color name"""
    r, g, b = rgb
    
    # Simple color classification
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

def predict_image(image_path):
    """Predict what clothing item is in the image"""
    # Load image
    img = Image.open(image_path).convert("RGB")
    
    # Preprocess
    input_tensor = transform(img).unsqueeze(0)  # Add batch dimension
    
    # Predict
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, pred = torch.max(probabilities, 0)
    
    # Get result
    predicted_class = class_names[pred.item()]
    confidence_percent = confidence.item() * 100
    
    return predicted_class, confidence_percent

# Test on an image
if __name__ == "__main__":
    # Test both images
    test_images = [
        "test_images/skirt.jpg",
        "test_images/shirt.jpg",
        "test_images/jeans.jpg",
        "test_images/puffercoat.jpeg",
        "test_images/red shorts.jpeg"
    ]
    
    for test_image in test_images:
        print(f"\n{'='*50}")
        print(f"Analyzing: {test_image}")
        print('='*50)
        
        # Get clothing prediction
        predicted_class, confidence = predict_image(test_image)
        print(f"\n📦 Item Type: {predicted_class}")
        print(f"🎯 Confidence: {confidence:.2f}%")
        
        # Get color metadata
        color_data = get_color_metadata(test_image)
        dominant_rgb = color_data['dominant_color']
        dominant_name = rgb_to_color_name(dominant_rgb)
        
        print(f"\n🎨 Dominant Color: {dominant_name} {dominant_rgb}")
        print(f"🌈 Color Palette:")
        for i, color in enumerate(color_data['palette'], 1):
            color_name = rgb_to_color_name(color)
            print(f"   {i}. {color_name} {color}")
        
        # Visualize dominant color
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3))
        
        # Show dominant color
        ax1.imshow([[dominant_rgb]])
        ax1.set_title(f"Dominant Color: {dominant_name}")
        ax1.axis("off")
        
        # Show palette
        palette_display = [[color] for color in color_data['palette']]
        ax2.imshow(palette_display)
        ax2.set_title("Color Palette")
        ax2.axis("off")
        
        plt.tight_layout()
        plt.show()
        
        print(f"\n{'='*50}")