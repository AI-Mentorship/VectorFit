import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, TextInput, TouchableOpacity, Platform, ScrollView, Keyboard, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useSession } from '../ctx';
import { useChatWebSocket, type WebSocketMessage } from '../../utils/useChatWebSocket';
import { getChatMessages, type ChatMessage } from '../../utils/api';
import MenuModal from '../../components/MenuModal';
import Bot from '../../assets/Chat/Bot.svg'
import Closet from '../../assets/Chat/Closet.svg'
import Options from '../../assets/Chat/Options.svg'
import AccessVirtualCloset from '../../assets/Chat/AccessVirtualCloset.svg'
import History from '../../assets/VirtualCloset/History.svg'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isThinking?: boolean;
  traceType?: 'rationale' | 'action' | 'observation' | 'generating';
}

export default function Chat() {
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [useVirtualCloset, setUseVirtualCloset] = useState(false);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Use WebSocket hook
  const {
    isConnected,
    currentChatId,
    thinkingMessage,
    streamingText,
    sendMessage,
    setMessageCallback,
    startNewChat,
    loadChat,
  } = useChatWebSocket(session);

  // Tab bar height calculation: 60 (base height) + bottom inset (if > 0, else 8)
  const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 8);

  // Handle WebSocket messages
  useEffect(() => {
    setMessageCallback((msg: WebSocketMessage) => {
      if (msg.type === 'complete' && msg.message && typeof msg.message === 'object') {
        // Type guard to ensure msg.message is ChatMessage
        const chatMessage = msg.message as ChatMessage;
        // Add the complete message to the chat
        setMessages(prev => [...prev, {
          id: chatMessage.messageId || Date.now().toString(),
          text: chatMessage.content || '',
          sender: chatMessage.role === 'user' ? 'user' : 'bot',
          timestamp: new Date(chatMessage.timestamp || Date.now()),
        }]);
        scrollToBottom();
      }
    });
  }, [setMessageCallback]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        // Subtract tab bar height from keyboard height to close the gap
        const offset = e.endCoordinates.height - tabBarHeight;
        Animated.timing(keyboardHeight, {
          toValue: offset,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [tabBarHeight]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !isConnected) return;

    const messageText = inputText.trim();

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    // Send message via WebSocket with useVirtualCloset flag
    // Pass currentChatId to continue the conversation
    sendMessage(messageText, currentChatId || undefined, useVirtualCloset);
  };

  // Load chat history when user selects a chat
  const handleSelectChat = async (chatId: string, chatName: string) => {
    if (!session) return;

    setIsLoadingHistory(true);
    setIsMenuModalVisible(false);

    try {
      const { messages: chatMessages } = await getChatMessages(chatId, session);

      // Convert ChatMessage[] to Message[]
      const formattedMessages: Message[] = chatMessages.map((msg) => ({
        id: msg.messageId || `${msg.timestamp}-${msg.role}`,
        text: msg.content || '',
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.timestamp || Date.now()),
      }));

      // Update messages state with loaded history
      setMessages(formattedMessages);

      // Load the chat context in the WebSocket hook
      loadChat(chatId, chatName);

      scrollToBottom();
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([]);
    startNewChat();
    setIsMenuModalVisible(false);
  };

  // Handle chat deletion
  const handleChatDeleted = (deletedChatId: string) => {
    // If the deleted chat was the active one, clear messages and start new chat
    if (deletedChatId === currentChatId) {
      setMessages([]);
      startNewChat();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 pt-3">
        <View className='flex-row justify-between items-center px-5 mb-3'>
          <View className='flex-row gap-2 items-center'>
            <Bot width={24} height={24} />
            <Text className="text-2xl font-grotesk-bold">
              Outfit Finder
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsMenuModalVisible(true)} activeOpacity={0.7}>
            <History width={24} height={24} />
          </TouchableOpacity>
        </View>


        {/* Messages Area */}
        {isLoadingHistory ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="#000" />
            <Text className='font-jakarta text-black/50 mt-2'>Loading chat history...</Text>
          </View>
        ) : messages.length === 0 && !thinkingMessage && !streamingText ? (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View className='flex-1 flex gap-2 items-center justify-center'>
              <Closet width={26} height={26} />
              <Text className='px-10 text-2xl text-center font-grotesk-medium'>
                What outfits are you looking for today
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className='flex-1 px-5'
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            {messages.map((message) => (
              <View key={message.id}>
                {message.sender === 'user' ? (
                  <View className='bg-white p-2 rounded-lg self-start'>
                    <Text className='font-jakarta text-black/80'>
                      {message.text}
                    </Text>
                  </View>
                ) : (
                  <View className='mb-8'>
                    <Markdown
                      style={{
                        body: { fontFamily: 'PlusJakartaSans-SemiBold', color: '#000000' },
                      }}
                    >
                      {message.text}
                    </Markdown>
                  </View>
                )}
              </View>
            ))}

            {/* Show agent's thinking process (real-time from Bedrock Agent traces) */}
            {thinkingMessage && (
              <View className='mb-3'>
                <View className='p-2 rounded-lg self-start'>
                  <View className='flex-row items-center gap-2'>
                    <ActivityIndicator size="small" color="#666" />
                    <Text className='font-jakarta text-gray-700'>
                      {thinkingMessage}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Show streaming response */}
            {streamingText && (
              <View className='mb-3'>
                <View>
                  <Markdown
                    style={{
                      body: { fontFamily: 'PlusJakartaSans-SemiBold', color: '#000000' },
                    }}
                  >
                    {streamingText}
                  </Markdown>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Chat box with config buttons*/}
        <Animated.View
          className='bg-white px-6 rounded-t-3xl pt-4 pb-6'
          style={{ marginBottom: keyboardHeight }}
        >
          <TextInput
            className='font-jakarta-semibold text-black'
            placeholder='Search for outfits...'
            placeholderTextColor='rgba(0,0,0,0.5)'
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType='send'
            multiline
          />
          <View className='flex-row justify-between pb-2'>
            {/* Left button group*/}
            <View className='flex-row gap-2 items-center'>
              <TouchableOpacity
                className='flex items-center justify-center p-1 border-[0.5px] border-black/50 rounded-full'
                activeOpacity={0.7}
              >
                <Options width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-row gap-2 px-4 items-center justify-center p-1 border-[0.5px] ${
                  useVirtualCloset ? 'bg-black/20' : 'bg-transparent'
                } border-black/50 rounded-full`}
                onPress={() => setUseVirtualCloset(!useVirtualCloset)}
                activeOpacity={0.7}
              >
                <AccessVirtualCloset width={14} height={14} fill="#000" />
                <Text className='font-jakarta-medium text-black'>Use Virtual Closet</Text>
              </TouchableOpacity>
            </View>

            {/* Right button group - Send button */}
            <TouchableOpacity
              className='flex items-center justify-center bg-black px-6 py-1 rounded-full'
              onPress={handleSendMessage}
              activeOpacity={0.7}
            >
              <Text className='text-white font-jakarta-semibold pb-1'>Send</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Menu Modal for Chat History */}
      <MenuModal
        visible={isMenuModalVisible}
        onClose={() => setIsMenuModalVisible(false)}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onChatDeleted={handleChatDeleted}
        currentChatId={currentChatId}
      />
    </SafeAreaView>
  );
}
