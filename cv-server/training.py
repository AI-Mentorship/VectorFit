# training.py
import numpy as np
import pandas as pd
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import pickle

if __name__ == '__main__':
    print("Starting training...")

    # Hyperparameters
    BATCH_SIZE = 32  # Reduced for ResNet50 (uses more memory)
    NUM_EPOCHS = 10  # Increased for better training
    NUM_CLASSES = 15  # Your clothing categories
    LR = 1e-3
    
    # AMD GPU Detection (DirectML for Windows)
    try:
        import torch_directml
        DEVICE = torch_directml.device()
        print(f"✓ Using AMD GPU via DirectML")
        print(f"Device: {DEVICE}")
    except ImportError:
        if torch.cuda.is_available():
            DEVICE = torch.device("cuda")
            print(f"Using NVIDIA GPU: {torch.cuda.get_device_name(0)}")
        else:
            DEVICE = torch.device("cpu")
            print("GPU not available, using CPU")

    print(f"Using device: {DEVICE}")

    # Data transforms (preprocessing)
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    # Load dataset
    dataset = datasets.ImageFolder("data/Clothes_Dataset", transform=train_transforms)

    print(f"Found {len(dataset)} images in {len(dataset.classes)} classes")
    print(f"Classes: {dataset.classes}")

    # Split into train and validation
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

    # Apply validation transforms
    val_dataset.dataset.transform = val_transforms

    # Create data loaders - can use multiple workers on PC
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, 
                             num_workers=4, pin_memory=True if torch.cuda.is_available() else False)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, 
                           num_workers=4, pin_memory=True if torch.cuda.is_available() else False)

    print(f"Train set: {len(train_dataset)} images")
    print(f"Val set: {len(val_dataset)} images")

    # Load ResNet50 (pretrained on ImageNet)
    print("Loading ResNet50...")
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

    # Replace the last layer to match YOUR number of classes
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
    model = model.to(DEVICE)

    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")

    # Loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LR)
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', 
                                                     factor=0.5, patience=2)

    print("Starting training loop...")
    print("=" * 70)

    best_val_acc = 0.0

    # TRAINING LOOP
    for epoch in range(NUM_EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        # Training phase
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            # Track metrics
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            # Print progress every 20 batches
            if (batch_idx + 1) % 20 == 0:
                print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] Batch [{batch_idx+1}/{len(train_loader)}] "
                      f"Loss: {loss.item():.4f} Acc: {100.*correct/total:.2f}%")
        
        train_loss = running_loss / total
        train_acc = correct / total
        
        # Validation phase
        model.eval()
        val_correct = 0
        val_total = 0
        val_loss = 0.0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
        
        val_loss = val_loss / val_total
        val_acc = val_correct / val_total
        
        # Adjust learning rate
        scheduler.step(val_acc)
        
        print("=" * 70)
        print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] Summary:")
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f"  Val Loss: {val_loss:.4f}   | Val Acc: {val_acc*100:.2f}%")
        print("=" * 70)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            print(f"🎯 New best validation accuracy: {best_val_acc*100:.2f}%")
            
            os.makedirs('models', exist_ok=True)
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_names': dataset.classes
            }, 'models/best_model.pth')

    print("\n" + "=" * 70)
    print("Training complete!")
    print(f"Best validation accuracy: {best_val_acc*100:.2f}%")
    print("=" * 70)

    # Save the final model
    os.makedirs('models', exist_ok=True)

    # Save using pickle for easy loading
    with open('models/model.pkl', 'wb') as f:
        pickle.dump(model, f)

    # Also save class names for later use
    with open('models/class_names.pkl', 'wb') as f:
        pickle.dump(dataset.classes, f)

    print("\n✓ Final model saved to models/model.pkl")
    print("✓ Best model saved to models/best_model.pth")
    print("✓ Class names saved to models/class_names.pkl")
    print("\nYour clothing classes:")
    for i, class_name in enumerate(dataset.classes):
        print(f"  {i}: {class_name}")