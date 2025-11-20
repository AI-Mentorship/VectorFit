/**
 * Friends API
 * Handles friend management including friend requests, acceptance, and active clothes viewing
 */

import { API_BASE_URL, getAuthHeaders } from './config';
import type { Friend, FriendActiveClothes } from './types';

/**
 * Get accepted friends
 */
export async function getAcceptedFriends(token: string): Promise<Friend[]> {
  const response = await fetch(`${API_BASE_URL}/friends/accepted`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch accepted friends');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch accepted friends');
    }
  }

  const data = JSON.parse(responseText);
  return data.acceptedFriends || [];
}

/**
 * Get pending friends (incoming friend requests - people who sent requests TO you)
 */
export async function getPendingFriends(token: string): Promise<Friend[]> {
  const response = await fetch(`${API_BASE_URL}/friends/pending`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch pending friends');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch pending friends');
    }
  }

  const data = JSON.parse(responseText);
  return data.pendingFriends || [];
}

/**
 * Get friend requests (outgoing friend requests - people YOU sent requests to)
 */
export async function getFriendRequests(token: string): Promise<Friend[]> {
  const response = await fetch(`${API_BASE_URL}/friends/requests`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch friend requests');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch friend requests');
    }
  }

  const data = JSON.parse(responseText);
  return data.friendRequests || [];
}

/**
 * Add friend (send friend request)
 */
export async function addFriend(email: string, token: string): Promise<void> {
  console.log('Adding friend with email:', email);

  const response = await fetch(`${API_BASE_URL}/friends/add`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ email }),
  });

  console.log('Add friend response status:', response.status);
  const responseText = await response.text();
  console.log('Add friend response body:', responseText);

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to add friend');
    } catch (e) {
      throw new Error(responseText || 'Failed to add friend');
    }
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(email: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/friends/accept`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ email }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to accept friend request');
    } catch (e) {
      throw new Error(responseText || 'Failed to accept friend request');
    }
  }
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(email: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/friends/reject`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ email }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to reject friend request');
    } catch (e) {
      throw new Error(responseText || 'Failed to reject friend request');
    }
  }
}

/**
 * Cancel friend request (for pending/sent requests)
 */
export async function cancelFriendRequest(email: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/friends/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ email }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to cancel friend request');
    } catch (e) {
      throw new Error(responseText || 'Failed to cancel friend request');
    }
  }
}

/**
 * Get all friends' active clothing
 */
export async function getFriendsActiveClothes(token: string): Promise<FriendActiveClothes[]> {
  const response = await fetch(`${API_BASE_URL}/friends/active-clothes`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch friends active clothes');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch friends active clothes');
    }
  }

  const data = JSON.parse(responseText);
  return data.friendsActiveClothes || [];
}
