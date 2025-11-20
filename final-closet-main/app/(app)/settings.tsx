import React from 'react';
import { View, Text, StatusBar, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../ctx';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const { signOut, user } = useSession();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/get-started');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 p-5">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-grotesk-bold mb-2">Settings</Text>
          {user && (
            <Text className="text-base font-jakarta-regular text-gray-600">
              {user.firstName} {user.lastName}
            </Text>
          )}
        </View>

        {/* Account Section */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-jakarta-bold mb-4">Account</Text>

          <View className="py-3">
            <Text className="text-sm font-jakarta-medium text-gray-600 mb-1">Username</Text>
            <Text className="text-base font-jakarta-semibold">{user?.userName || 'N/A'}</Text>
          </View>

          <View className="py-3 border-t border-gray-200">
            <Text className="text-sm font-jakarta-medium text-gray-600 mb-1">Email</Text>
            <Text className="text-base font-jakarta-semibold">{user?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mb-4">
          <Pressable
            onPress={handleSignOut}
            className="bg-red-600 px-6 py-2 rounded-xl active:bg-red-700 mb-3 self-start"
          >
            <Text className="text-white text-center font-jakarta-bold">
              Sign Out
            </Text>
          </Pressable>
        </View>

        {/* Version Info */}
        <Text className="text-center mt-auto text-sm font-jakarta-regular text-gray-500">
          Closet Sensei v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
