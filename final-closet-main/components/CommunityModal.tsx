import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useSession } from '../app/ctx';
import { getFriendsActiveClothes, type FriendActiveClothes } from '../utils/api';
import FriendClothingCard from './FriendClothingCard';
import GoBack from '../assets/VirtualCloset/GoBack.svg';
import Sync from '../assets/Dashboard/Sync.svg';

interface CommunityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CommunityModal({ visible, onClose }: CommunityModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { session } = useSession();
  const [friendsClothes, setFriendsClothes] = useState<FriendActiveClothes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch friends' active clothes
      fetchFriendsClothes();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);

  const fetchFriendsClothes = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getFriendsActiveClothes(session);
      console.log('Friends clothes data:', data);
      console.log('Number of friends:', data.length);
      setFriendsClothes(data);
    } catch (err) {
      console.error('Error fetching friends active clothes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load friends clothes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFriendsClothes();
  };

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
          <View className='bg-[#F0F0F0] rounded-t-3xl px-6 py-6 h-[85vh]'>
            <View className='flex-row justify-between items-center mb-6'>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <GoBack width={22} height={22}/>
              </TouchableOpacity>
              <Text className='text-2xl font-grotesk-bold text-center'>
                Community
              </Text>
              <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7} disabled={loading}>
                <Sync width={22} height={22} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className='flex-1 items-center justify-center py-12'>
                <ActivityIndicator size="large" color="#000" />
                <Text className='text-sm font-jakarta-medium text-black/50 mt-4'>
                  Loading friends' outfits...
                </Text>
              </View>
            ) : error ? (
              <View className='flex-1 items-center justify-center py-12'>
                <Text className='text-lg font-jakarta-semibold text-red-600 text-center'>
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={fetchFriendsClothes}
                  className='mt-4 bg-black px-6 py-3 rounded-full'
                >
                  <Text className='text-white font-jakarta-semibold'>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : friendsClothes.length === 0 ? (
              <View className='flex-1 items-center justify-center py-12'>
                <Text className='text-xl font-jakarta-semibold text-gray-600 text-center'>
                  No friends with active outfits yet
                </Text>
                <Text className='text-sm font-jakarta-medium text-gray-400 text-center mt-2'>
                  Add friends to see what they're wearing!
                </Text>
              </View>
            ) : (
              <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {friendsClothes.map((friend, index) => (
                  <>
                  <FriendClothingCard
                    key={`${friend.email}-${index}`}
                    userName={friend.userName}
                    firstName={friend.firstName}
                    lastName={friend.lastName}
                    activeClothes={friend.activeClothes}
                    lastUpdated={friend.lastUpdated}
                  />
                  </>
                ))}
                <View className='mt-4'/>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
