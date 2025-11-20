/**
 * Clothing API
 * Handles clothing item operations including prediction, retrieval, and management
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { API_BASE_URL, getAuthHeaders } from './config';
import type { ClothingItem, PredictResponse } from './types';

/**
 * Predict clothing from image using ML model
 */
export async function predictClothing(imageUri: string, token: string): Promise<PredictResponse> {
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024 } }], // Resize to max width of 1024px
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality JPEG
  );

  const imageResponse = await fetch(manipulatedImage.uri);
  const blob = await imageResponse.blob();
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  console.log('Image converted to base64, length:', base64Image.length);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      image: base64Image,
    }),
  });

  console.log('Response status:', response.status);

  const responseText = await response.text();
  console.log('Response body:', responseText.substring(0, 200));

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.error || 'Prediction failed');
    } catch (e) {
      throw new Error(responseText || 'Prediction failed');
    }
  }

  const data = JSON.parse(responseText);
  return data;
}

/**
 * Get all clothing items for the user
 */
export async function getAllClothes(token: string): Promise<ClothingItem[]> {
  const response = await fetch(`${API_BASE_URL}/clothes`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch clothing items');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch clothing items');
    }
  }

  const data = JSON.parse(responseText);
  const clothesArray = data.clothes || data || [];

  // Normalize the data structure to ensure clotheItemId is present
  return clothesArray.map((item: any) => ({
    clotheItemId: item.clotheItemId || item._id,
    userId: item.userId,
    clothingType: item.clothingType,
    dominantColor: item.dominantColor,
    imageUrl: item.imageUrl || item.imageKey,
    confidence: item.confidence,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

/**
 * Get single clothing item by ID
 */
export async function getClothingItem(clotheItemId: string, token: string): Promise<ClothingItem> {
  console.log('Fetching clothing item with ID:', clotheItemId);
  console.log('Using token:', token ? 'Token exists' : 'No token');

  const response = await fetch(`${API_BASE_URL}/clothes/${clotheItemId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  console.log('Get clothing item response status:', response.status);
  const responseText = await response.text();
  console.log('Get clothing item response body:', responseText.substring(0, 200));

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch clothing item');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch clothing item');
    }
  }

  const data = JSON.parse(responseText);
  console.log('Parsed clothing item data:', data);

  // Extract the clotheItem from the response and normalize the structure
  const clotheItem = data.clotheItem || data;

  return {
    clotheItemId: clotheItem.clotheItemId || clotheItem._id,
    userId: clotheItem.userId,
    clothingType: clotheItem.clothingType,
    dominantColor: clotheItem.dominantColor,
    imageUrl: clotheItem.imageUrl || clotheItem.imageKey, // Handle both imageUrl and imageKey
    confidence: clotheItem.confidence,
    createdAt: clotheItem.createdAt,
    updatedAt: clotheItem.updatedAt,
  };
}
