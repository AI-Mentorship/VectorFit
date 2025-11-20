/**
 * Chat API
 * Handles chat history management and message retrieval
 */

import { API_BASE_URL, getAuthHeaders, WEBSOCKET_URL } from './config';
import type { ChatHistory, ChatMessage } from './types';

/**
 * Get all chat histories for the user
 */
export async function getChatHistories(token: string): Promise<ChatHistory[]> {
  const response = await fetch(`${API_BASE_URL}/chat/histories`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch chat histories');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch chat histories');
    }
  }

  const data = JSON.parse(responseText);
  return data.chatHistories || [];
}

/**
 * Get messages for a specific chat
 */
export async function getChatMessages(
  chatId: string,
  token: string
): Promise<{ messages: ChatMessage[]; chatName: string }> {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to fetch chat messages');
    } catch (e) {
      throw new Error(responseText || 'Failed to fetch chat messages');
    }
  }

  const data = JSON.parse(responseText);
  return {
    messages: data.messages || [],
    chatName: data.chatName || 'Unknown',
  };
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const error = JSON.parse(responseText);
      throw new Error(error.message || 'Failed to delete chat');
    } catch (e) {
      throw new Error(responseText || 'Failed to delete chat');
    }
  }
}

/**
 * Export WebSocket URL for chat connections
 */
export { WEBSOCKET_URL };
