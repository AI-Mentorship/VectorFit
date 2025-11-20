import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import BlankProfile from '../../assets/Dashboard/BlankProfile.svg';
import { type Friend } from '../../utils/api';

interface FriendsPageProps {
  acceptedFriends: Friend[];
  loading: boolean;
}

export default function FriendsPage({ acceptedFriends, loading }: FriendsPageProps) {
  return (
    <>
      <Text className='font-jakarta-bold text-lg mt-2 mb-2'>Friends ({acceptedFriends.length})</Text>
      {loading ? (
        <View className='py-8'>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : acceptedFriends.length === 0 ? (
        <View className='bg-white p-6 rounded-lg'>
          <Text className='font-jakarta-medium text-black/50 text-center'>No friends yet</Text>
        </View>
      ) : (
        <View className='flex-col gap-2 pb-4'>
          {acceptedFriends.map((friend, index) => (
            <View key={friend.email || index} className='bg-white p-4 rounded-lg flex-row gap-4 items-center'>
              <BlankProfile width={28} height={28} />
              <Text className='font-jakarta-bold mb-1 text-lg'>{friend.firstName} {friend.lastName}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

