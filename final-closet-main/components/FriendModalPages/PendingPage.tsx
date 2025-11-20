import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import BlankProfile from '../../assets/Dashboard/BlankProfile.svg';
import { type Friend } from '../../utils/api';

interface PendingPageProps {
  pendingFriends: Friend[];
  friendRequests: Friend[];
  loading: boolean;
  onAcceptFriend: (friend: Friend) => void;
  onRejectFriend: (friend: Friend) => void;
  onCancelRequest: (friend: Friend) => void;
  onAddFriendsClick: () => void;
}

export default function PendingPage({
  pendingFriends,
  friendRequests,
  loading,
  onAcceptFriend,
  onRejectFriend,
  onCancelRequest,
  onAddFriendsClick,
}: PendingPageProps) {
  return (
    <>
    {/* Outgoing Friend Requests */}
    <View className='flex-row justify-between items-center'>
      <Text className='font-jakarta-bold text-lg mt-2 mb-2'>Sent Requests ({friendRequests.length})</Text>
      <TouchableOpacity onPress={onAddFriendsClick} activeOpacity={0.7}>
        <Text className='font-jakarta-bold text-sm mt-2 mb-2 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg'>Add Friends</Text>
      </TouchableOpacity>
    </View>
    
      {loading ? (
        <View className='py-8'>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : friendRequests.length === 0 ? (
        <View className='bg-white p-6 rounded-lg mb-4'>
          <Text className='font-jakarta-medium text-black/50 text-center'>No pending requests</Text>
        </View>
      ) : (
        <View className='flex-col gap-2 pb-4'>
          {friendRequests.map((friend, index) => (
            <View key={friend.email || index} className='bg-white p-4 rounded-lg flex-row gap-4 items-center justify-between'>
              <View className='flex-row gap-4 items-center flex-1'>
                <BlankProfile width={28} height={28} />
                <Text className='font-jakarta-bold text-lg'>{friend.firstName} {friend.lastName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onCancelRequest(friend)}
                className='bg-gray-500 px-4 py-2 rounded-lg'
                activeOpacity={0.7}
              >
                <Text className='font-jakarta-bold text-white text-sm'>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {/* Incoming Friend Requests */}
      <Text className='font-jakarta-bold text-lg mt-2 mb-2'>Friend Requests ({pendingFriends.length})</Text>
      {loading ? (
        <View className='py-8'>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : pendingFriends.length === 0 ? (
        <View className='bg-white p-6 rounded-lg mb-4'>
          <Text className='font-jakarta-medium text-black/50 text-center'>No friend requests</Text>
        </View>
      ) : (
        <View className='flex-col gap-2 mb-4'>
          {pendingFriends.map((friend, index) => (
            <View key={friend.email || index} className='bg-white p-4 rounded-lg flex-row gap-4 items-center justify-between'>
              <View className='flex-row gap-4 items-center flex-1'>
                <BlankProfile width={28} height={28} />
                <Text className='font-jakarta-bold text-lg'>{friend.firstName} {friend.lastName}</Text>
              </View>
              <View className='flex-row gap-2'>
                <TouchableOpacity
                  onPress={() => onAcceptFriend(friend)}
                  className='bg-green-500 px-4 py-2 rounded-lg'
                  activeOpacity={0.7}
                >
                  <Text className='font-jakarta-bold text-white text-sm'>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRejectFriend(friend)}
                  className='bg-red-500 px-4 py-2 rounded-lg'
                  activeOpacity={0.7}
                >
                  <Text className='font-jakarta-bold text-white text-sm'>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      
    </>
  );
}

