# test_model.py
import pickle
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models

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
        "test_images/shirt.jpg",
        "test_images/jeans.jpg"
    ]
    
    for test_image in test_images:
        print(f"\nTesting image: {test_image}")
        predicted_class, confidence = predict_image(test_image)
        print(f"✓ Prediction: {predicted_class}")
        print(f"✓ Confidence: {confidence:.2f}%")