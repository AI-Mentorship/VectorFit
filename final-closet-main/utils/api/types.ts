/**
 * API Types and Interfaces
 * Contains all TypeScript interfaces and types used across the API
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Clothing Types
// ============================================================================

export interface DominantColor {
  name: string;
  rgb: number[];
}

export interface PredictResponse {
  success: boolean;
  clotheItemId: string;
  clothingType: string;
  confidence: number;
  dominantColor: DominantColor;
  message: string;
}

export interface ClothingItem {
  clotheItemId: string;
  userId: string;
  clothingType: string;
  dominantColor: DominantColor;
  imageUrl: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Outfit Types
// ============================================================================

export interface CreateOutfitData {
  topId: string;
  bottomId: string;
}

export interface OutfitResponse {
  success: boolean;
  outfitId: string;
  message: string;
}

export interface Outfit {
  outfitId: string;
  userId: string;
  topId: string;
  bottomId: string;
  timestamp: string;
  updatedAt: string;
}

export interface ActiveOutfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
}

export interface ActiveClothing {
  clotheItemId: string;
  clothingType: string;
  dominantColor: DominantColor;
  imageUrl: string;
  position: 'top' | 'bottom';
}

// ============================================================================
// Friend Types
// ============================================================================

export interface Friend {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
}

export interface FriendActiveClothes {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  activeClothes: ActiveClothing[];
  lastUpdated: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatHistory {
  chatId: string;
  userId: string;
  chatName: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
