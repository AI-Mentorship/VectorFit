import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, StatusBar, ScrollView, Alert } from 'react-native';
import GoBack from '../assets/VirtualCloset/GoBack.svg';
import Search from '../assets/Dashboard/Search.svg';
import Sync from '../assets/Dashboard/Sync.svg'
import { 
  getAcceptedFriends, 
  getPendingFriends, 
  getFriendRequests, 
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  Friend 
} from '../utils/api';
import { useSession } from '../app/ctx';
import FriendsPage from './FriendModalPages/FriendsPage';
import PendingPage from './FriendModalPages/PendingPage';
import AddFriendPage from './FriendModalPages/AddFriendPage';

interface FriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'friends' | 'pending' | 'add';

export default function FriendsModal({ visible, onClose }: FriendsModalProps) {
  const { session } = useSession();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [acceptedFriends, setAcceptedFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

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

      // Fetch friends data when modal opens
      if (session) {
        fetchFriendsData();
      }
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible, session]);

  const fetchFriendsData = async () => {
    if (!session) {
      console.error('No session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [accepted, pending, requests] = await Promise.all([
        getAcceptedFriends(session),
        getPendingFriends(session),    // Incoming requests (people who sent requests TO you)
        getFriendRequests(session),    // Outgoing requests (people YOU sent requests to)
      ]);

      console.log('Accepted friends:', accepted);
      console.log('Pending friends (incoming):', pending);
      console.log('Friend requests (outgoing):', requests);

      setAcceptedFriends(accepted);
      setPendingFriends(pending);      // These are INCOMING - use Accept/Reject
      setFriendRequests(requests);     // These are OUTGOING - use Cancel
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFriendsData();
  };

  const handleAcceptFriend = async (friend: Friend) => {
    if (!session) return;
    
    try {
      console.log('Accepting friend request from:', friend.email);
      await acceptFriendRequest(friend.email, session);
      Alert.alert('Success', `You are now friends with ${friend.firstName} ${friend.lastName}!`);
      fetchFriendsData(); // Refresh the lists
    } catch (error: any) {
      console.error('Accept friend error:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    }
  };

  const handleRejectFriend = async (friend: Friend) => {
    if (!session) return;
    
    try {
      console.log('Rejecting friend request from:', friend.email);
      await rejectFriendRequest(friend.email, session);
      Alert.alert('Rejected', `Friend request from ${friend.firstName} ${friend.lastName} has been rejected`);
      fetchFriendsData(); // Refresh the lists
    } catch (error: any) {
      console.error('Reject friend error:', error);
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    }
  };

  const handleCancelRequest = async (friend: Friend) => {
    if (!session) return;
    
    try {
      console.log('Cancelling friend request to:', friend.email);
      await cancelFriendRequest(friend.email, session);
      Alert.alert('Cancelled', `Friend request to ${friend.firstName} ${friend.lastName} has been cancelled`);
      fetchFriendsData(); // Refresh the lists
    } catch (error: any) {
      console.error('Cancel friend request error:', error);
      Alert.alert('Error', error.message || 'Failed to cancel friend request');
    }
  };

  const handleAddFriend = async (email: string) => {
    if (!session) return;
    
    console.log('Adding friend:', email);
    await addFriend(email, session);
    fetchFriendsData(); // Refresh the lists
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
          <View className='bg-[#F0F0F0] rounded-t-3xl px-5 pt-6 h-[600px] flex justify-between'>
            <View>
              <View className='flex-row justify-between items-center'>
                <TouchableOpacity 
                  onPress={() => activeTab === 'add' ? setActiveTab('pending') : onClose()} 
                  activeOpacity={0.7}
                >
                  <GoBack width={22} height={22} />
                </TouchableOpacity>
                <Text className='text-2xl font-grotesk-bold text-center'>
                  {activeTab === 'add' ? 'Add Friend' : 'Add Friends'}
                </Text>
                <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7} disabled={loading}>
                  <Sync width={22} height={22} />
                </TouchableOpacity>
              </View>

              {/* Search box and nav toggle - hidden on Add Friends page */}
              {activeTab !== 'add' && (
                <View className='flex-row gap-2 items-center mt-2'>
                  <View className='flex-row flex-1 gap-1 items-center p-2 bg-white rounded-xl '>
                    <Search width={20} height={20} />
                    <Text className='font-jakarta-medium text-black/50 text-lg'>Search</Text>
                  </View>
                  <View className='bg-white rounded-xl p-2 flex-row gap-1 self-start'>
                    <TouchableOpacity onPress={() => setActiveTab('friends')} activeOpacity={0.7}>
                      <Text className={`px-4 py-1 rounded-lg font-jakarta-bold text-sm ${
                        activeTab === 'friends' ? 'bg-[#D9D9D9]' : 'text-black/50'
                      }`}>
                        Friends
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('pending')} activeOpacity={0.7}>
                      <Text className={`px-4 py-1 rounded-lg font-jakarta-bold text-sm ${
                        activeTab === 'pending' ? 'bg-[#D9D9D9]' : 'text-black/50'
                      }`}>
                        Pending
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <ScrollView className='mt-2' showsVerticalScrollIndicator={false}>
                {activeTab === 'friends' && (
                  <FriendsPage 
                    acceptedFriends={acceptedFriends}
                    loading={loading}
                  />
                )}

                {activeTab === 'pending' && (
                  <PendingPage 
                    pendingFriends={pendingFriends}
                    friendRequests={friendRequests}
                    loading={loading}
                    onAcceptFriend={handleAcceptFriend}
                    onRejectFriend={handleRejectFriend}
                    onCancelRequest={handleCancelRequest}
                    onAddFriendsClick={() => setActiveTab('add')}
                  />
                )}

                {activeTab === 'add' && (
                  <AddFriendPage 
                    onAddFriend={handleAddFriend}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
