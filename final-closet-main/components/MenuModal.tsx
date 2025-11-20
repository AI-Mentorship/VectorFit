import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import GoBack from '../assets/VirtualCloset/GoBack.svg';
import { useSession } from '../app/ctx';
import { getChatHistories, deleteChat, type ChatHistory } from '../utils/api';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectChat?: (chatId: string, chatName: string) => void;
  onNewChat?: () => void;
  onChatDeleted?: (deletedChatId: string) => void;
  currentChatId?: string | null;
}

export default function MenuModal({ visible, onClose, onSelectChat, onNewChat, onChatDeleted, currentChatId }: MenuModalProps) {
  const { session } = useSession();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat histories when modal opens
  useEffect(() => {
    if (visible && session) {
      fetchChatHistories();
    }
  }, [visible, session]);

  const fetchChatHistories = async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    try {
      const histories = await getChatHistories(session);
      setChatHistories(histories);
    } catch (err) {
      console.error('Error fetching chat histories:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!session) return;

    try {      const wasActiveChatDeleted = chatId === currentChatId;

      await deleteChat(chatId, session);

      // Refresh the list
      await fetchChatHistories();

      // If the deleted chat was the active one, notify parent
      if (wasActiveChatDeleted && onChatDeleted) {
        onChatDeleted(chatId);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      onShow={() => StatusBar.setBarStyle('light-content')}
      onDismiss={() => StatusBar.setBarStyle('dark-content')}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View
        className="absolute inset-0 bg-black/50"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY: slideAnim }]
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-[#F0F0F0] rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className='bg-[#F0F0F0] rounded-t-3xl px-5 pt-6 h-[600px]'>
            <View className='flex-row justify-between items-center mb-4'>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <GoBack width={22} height={22} />
              </TouchableOpacity>
              <Text className='text-2xl font-grotesk-bold text-center'>
                Chat History
              </Text>
              <View className='w-[22px]' />
            </View>

            {/* New Chat Button */}
            {onNewChat && (
              <TouchableOpacity
                className='bg-black py-3 px-4 rounded-xl mb-4'
                onPress={onNewChat}
                activeOpacity={0.7}
              >
                <Text className='text-white font-grotesk-bold text-center'>
                  + New Chat
                </Text>
              </TouchableOpacity>
            )}

            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View className='flex-1 items-center justify-center py-20'>
                  <ActivityIndicator size="large" color="#000" />
                  <Text className='font-jakarta text-black/50 mt-2'>Loading chats...</Text>
                </View>
              ) : error ? (
                <View className='flex-1 items-center justify-center py-20'>
                  <Text className='font-jakarta-medium text-red-500 text-center'>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={fetchChatHistories}
                    className='mt-4 bg-black py-2 px-6 rounded-full'
                    activeOpacity={0.7}
                  >
                    <Text className='text-white font-jakarta-semibold'>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : chatHistories.length === 0 ? (
                <View className='flex-1 items-center justify-center py-20'>
                  <Text className='font-jakarta-medium text-black/50 text-center'>
                    No chat history yet
                  </Text>
                  <Text className='font-jakarta text-black/40 text-center mt-2 px-8'>
                    Start a new conversation to begin
                  </Text>
                </View>
              ) : (
                <View className='pb-4'>
                  {chatHistories.map((chat) => (
                    <TouchableOpacity
                      key={chat.chatId}
                      className={`bg-white p-4 rounded-xl mb-3 ${
                        currentChatId === chat.chatId ? 'border-2 border-black' : ''
                      }`}
                      onPress={() => onSelectChat?.(chat.chatId, chat.chatName)}
                      activeOpacity={0.7}
                    >
                      <View className='flex-row justify-between items-start'>
                        <View className='flex-1'>
                          <Text className='font-grotesk-bold text-lg mb-1'>
                            {chat.chatName}
                          </Text>
                          <Text className='font-jakarta text-black/50 text-sm'>
                            {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                          </Text>
                          <Text className='font-jakarta text-black/40 text-xs mt-1'>
                            {new Date(chat.updatedAt).toLocaleDateString()} at{' '}
                            {new Date(chat.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.chatId);
                          }}
                          className='ml-2 p-2'
                          activeOpacity={0.7}
                        >
                          <Text className='text-red-500 font-jakarta-semibold text-sm'>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}