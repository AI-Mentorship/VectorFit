/**
 * API Index - Barrel Export
 * Central export point for all API modules
 *
 * This file provides a single import point for all API functions and types.
 * Import pattern: import { functionName, TypeName } from '@/utils/api'
 */

// ============================================================================
// Configuration
// ============================================================================
export { API_BASE_URL, WEBSOCKET_URL, API_HEADERS, getAuthHeaders } from './config';

// ============================================================================
// Types - Export all interfaces and types
// ============================================================================
export type {
  // Auth types
  LoginCredentials,
  SignUpData,
  AuthResponse,
  UserProfile,

  // Clothing types
  DominantColor,
  PredictResponse,
  ClothingItem,

  // Outfit types
  CreateOutfitData,
  OutfitResponse,
  Outfit,
  ActiveOutfit,
  ActiveClothing,

  // Friend types
  Friend,
  FriendActiveClothes,

  // Chat types
  ChatHistory,
  ChatMessage,
} from './types';

// ============================================================================
// Authentication API
// ============================================================================
export { loginUser, signUpUser, getUserProfile } from './auth';

// ============================================================================
// Clothing API
// ============================================================================
export { predictClothing, getAllClothes, getClothingItem } from './clothing';

// ============================================================================
// Outfits API
// ============================================================================
export { createOutfit, getAllOutfits, getActiveOutfit } from './outfits';

// ============================================================================
// Friends API
// ============================================================================
export {
  getAcceptedFriends,
  getPendingFriends,
  getFriendRequests,
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriendsActiveClothes,
} from './friends';

// ============================================================================
// Chat API
// ============================================================================
export { getChatHistories, getChatMessages, deleteChat } from './chat';
