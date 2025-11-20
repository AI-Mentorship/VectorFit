import { useEffect, useRef, useState, useCallback } from 'react';
import { WEBSOCKET_URL, type ChatMessage } from './api';

export interface WebSocketMessage {
  type: 'chatCreated' | 'userMessage' | 'thinking' | 'streamStart' | 'chunk' | 'complete' | 'error';
  chatId?: string;
  chatName?: string;
  message?: ChatMessage | string;
  chunk?: string;
  error?: string;
  stepNumber?: number;
  totalSteps?: number;
  traceType?: 'rationale' | 'action' | 'observation' | 'generating'; // Agent's actual thinking process
}

export function useChatWebSocket(token: string | null | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatName, setCurrentChatName] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageCallbackRef = useRef<((msg: WebSocketMessage) => void) | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', {
            type: data.type,
            traceType: data.traceType,
            message: typeof data.message === 'string' ? data.message : data.message ? '(object)' : undefined,
            chunk: data.chunk ? `"${data.chunk.substring(0, 50)}..."` : undefined,
            hasError: !!data.error
          });

          switch (data.type) {
            case 'chatCreated':
              setCurrentChatId(data.chatId || null);
              setCurrentChatName(data.chatName || null);
              break;

            case 'thinking':
              console.log('🧠 Setting thinking message:', data.message, 'TraceType:', data.traceType);
              setThinkingMessage(typeof data.message === 'string' ? data.message : null);
              setIsStreaming(true);
              break;

            case 'streamStart':
              console.log('🚀 Stream starting - clearing thinking message');
              // Add a small delay before clearing to ensure thinking message is visible
              setTimeout(() => {
                setThinkingMessage(null);
              }, 300);
              setStreamingText('');
              setIsStreaming(true);
              break;

            case 'chunk':
              setStreamingText((prev) => prev + (data.chunk || ''));
              break;

            case 'complete':
              setIsStreaming(false);
              setStreamingText('');
              setThinkingMessage(null);
              break;

            case 'error':
              setIsStreaming(false);
              setStreamingText('');
              setThinkingMessage(null);
              console.error('WebSocket error:', data.error);
              break;
          }

          // Call the message callback if set
          if (messageCallbackRef.current) {
            messageCallbackRef.current(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        if (token) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setIsConnected(false);
    }
  }, [token]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send a message
  const sendMessage = useCallback((message: string, chatId?: string, useVirtualCloset?: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    if (!token) {
      console.error('No authentication token');
      return;
    }

    const payload = {
      action: 'sendMessage',
      message,
      chatId: chatId || currentChatId || undefined,
      token,
      useVirtualCloset: useVirtualCloset || false,
    };

    console.log('Sending message:', payload);
    wsRef.current.send(JSON.stringify(payload));
  }, [token, currentChatId]);

  // Set message callback
  const setMessageCallback = useCallback((callback: (msg: WebSocketMessage) => void) => {
    messageCallbackRef.current = callback;
  }, []);

  // Start a new chat
  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
    setCurrentChatName(null);
    setStreamingText('');
    setThinkingMessage(null);
    setIsStreaming(false);
  }, []);

  // Load existing chat
  const loadChat = useCallback((chatId: string, chatName: string) => {
    setCurrentChatId(chatId);
    setCurrentChatName(chatName);
    setStreamingText('');
    setThinkingMessage(null);
    setIsStreaming(false);
  }, []);

  // Connect on mount and when token changes
  useEffect(() => {
    if (token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected,
    currentChatId,
    currentChatName,
    isStreaming,
    thinkingMessage,
    streamingText,
    sendMessage,
    setMessageCallback,
    startNewChat,
    loadChat,
    connect,
    disconnect,
  };
}