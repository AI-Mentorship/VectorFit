import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

interface AddFriendPageProps {
  onAddFriend: (email: string) => Promise<void>;
}

export default function AddFriendPage({ onAddFriend }: AddFriendPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await onAddFriend(email.trim());
      Alert.alert('Success', `Friend request sent to ${email}`);
      setEmail(''); // Clear the input
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Text className='font-jakarta-bold text-lg mt-2 mb-2'>Add Friend</Text>
      <View className='bg-white p-6 rounded-lg mb-4'>
        <Text className='font-jakarta-medium text-base mb-3'>
          Enter your friend's email address
        </Text>
        
        <View className='mb-4'>
          <Text className='font-jakarta-semibold text-sm mb-2 text-gray-700'>Email Address</Text>
          <TextInput
            className='bg-gray-100 px-4 py-3 rounded-lg font-jakarta-regular text-base border border-gray-200'
            placeholder="friend@example.com"
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          onPress={handleAddFriend}
          className='bg-blue-500 py-3 rounded-lg self-start px-4'
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className='font-jakarta-bold text-white text-center text-sm'>
              Send Friend Request
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

