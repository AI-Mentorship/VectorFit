/**
 * API Configuration
 * Contains base URLs and configuration constants for API requests
 */

export const API_BASE_URL = 'https://32vp8vyiii.execute-api.us-east-1.amazonaws.com/Prod';
export const WEBSOCKET_URL = 'wss://4y9wbbf7z1.execute-api.us-east-1.amazonaws.com/prod';

export const API_HEADERS = {
  'Content-Type': 'application/json',
} as const;

export const getAuthHeaders = (token: string) => ({
  ...API_HEADERS,
  'x-auth-token': token,
});