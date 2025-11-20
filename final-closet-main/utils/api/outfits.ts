/**
 * Outfits API
 * Handles outfit creation, retrieval, and active outfit management
 */

import { API_BASE_URL, getAuthHeaders } from './config';
import { getClothingItem } from './clothing';
import type { CreateOutfitData, OutfitResponse, Outfit, ActiveOutfit } from './types';

/**
 * Create a new outfit
 */
export async function createOutfit(outfitData: CreateOutfitData, token: string): Promise<OutfitResponse> {
  console.log('Creating outfit with data:', outfitData);
  console.log('Using token:', token ? 'Token exists' : 'No token');

  const response = await fetch(`${API_BASE_URL}/outfits`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(outfitData),
  });

  console.log('Create outfit response status:', response.status);
  const responseText = await response.text();
  console.log('Create outfit response body:', responseText);

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to create outfit');
    } catch (e) {
      throw new Error(responseText || 'Failed to create outfit');
    }
  }

  const data = JSON.parse(responseText);
  return data;
}

/**
 * Get outfit history for the user
 */
export async function getAllOutfits(token: string): Promise<Outfit[]> {
  console.log('Fetching outfit history');

  const response = await fetch(`${API_BASE_URL}/outfits/history`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  console.log('Get outfit history response status:', response.status);
  const responseText = await response.text();
  console.log('Get outfit history response body:', responseText.substring(0, 200));

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch outfit history');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch outfit history');
    }
  }

  const data = JSON.parse(responseText);
  return data.outfitHistory || [];
}

/**
 * Get current user's active outfit with clothing items
 */
export async function getActiveOutfit(token: string): Promise<ActiveOutfit> {
  const response = await fetch(`${API_BASE_URL}/outfits/active`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch active outfit');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch active outfit');
    }
  }

  const data = JSON.parse(responseText);
  const activeOutfit = data.activeOutfit || { topId: null, bottomId: null };

  // Fetch the actual clothing items if IDs exist
  const outfit: ActiveOutfit = {
    top: null,
    bottom: null,
  };

  if (activeOutfit.topId) {
    try {
      outfit.top = await getClothingItem(activeOutfit.topId, token);
    } catch (error) {
      console.error('Error fetching top clothing item:', error);
    }
  }

  if (activeOutfit.bottomId) {
    try {
      outfit.bottom = await getClothingItem(activeOutfit.bottomId, token);
    } catch (error) {
      console.error('Error fetching bottom clothing item:', error);
    }
  }

  return outfit;
}
