/**
 * Authentication API
 * Handles user authentication, registration, and profile management
 */

import { API_BASE_URL, API_HEADERS, getAuthHeaders } from './config';
import type { LoginCredentials, SignUpData, AuthResponse, UserProfile } from './types';

/**
 * Login user and get JWT token
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(credentials),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Login failed');
    } catch (e) {
      throw new Error(responseText || 'Login failed');
    }
  }

  // Try to parse as JSON first, fallback to plain text
  try {
    const data = JSON.parse(responseText);
    return { token: data.token || data };
  } catch {
    // If not JSON, assume it's the raw token
    return { token: responseText };
  }
}

/**
 * Sign up new user
 */
export async function signUpUser(userData: SignUpData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(userData),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Sign up failed');
    } catch (e) {
      throw new Error(responseText || 'Sign up failed');
    }
  }

  return { token: responseText };
}

/**
 * Get user profile using JWT token
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch user profile');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch user profile');
    }
  }

  const data = JSON.parse(responseText);
  return data;
}
