import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllClothes } from './api';

/**
 * Refreshes the clothing cache by fetching all clothes from the API
 * and updating AsyncStorage
 */
export async function refreshClothingCache(session: string): Promise<void> {
  try {
    console.log('Refreshing clothing cache...');
    const clothes = await getAllClothes(session);
    await AsyncStorage.setItem('cached_clothes', JSON.stringify(clothes));
    console.log('Clothing cache refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh clothing cache:', error);
    throw error;
  }
}

/**
 * Clears the clothing cache from AsyncStorage
 */
export async function clearClothingCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem('cached_clothes');
    console.log('Clothing cache cleared');
  } catch (error) {
    console.error('Failed to clear clothing cache:', error);
  }
}
