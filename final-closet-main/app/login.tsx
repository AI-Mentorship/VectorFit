import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from './ctx';
import { router } from 'expo-router';
import ClosetSenseiIcon from '../assets/ClosetSenseiIcon.svg';

export default function Login() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    try {
      await signIn({ email, password });
      router.replace('/(app)' as any);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/GetStarted/GetStartedBg.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-8">
              {/* Header with Logo */}
              <View className="flex-row items-center mb-12">
                <ClosetSenseiIcon width={26} height={26} />
                <Text className="text-2xl font-semibold ml-2 text-white font-grotesk-semibold">
                  Closet Sensei
                </Text>
              </View>

              {/* Welcome Message */}
              <View className="mb-10">
                <Text className="text-white text-4xl font-grotesk-bold mb-3">Welcome back</Text>
                <Text className="text-gray-300 text-lg font-jakarta-regular">Sign in to your account</Text>
              </View>

              {/* Form */}
              <View>
                <View className="mb-5">
                  <Text className="text-white text-sm font-jakarta-semibold mb-3 ml-1">Email Address</Text>
                  <TextInput
                    className="bg-white/10 text-white px-5 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                <View className="mb-8">
                  <Text className="text-white text-sm font-jakarta-semibold mb-3 ml-1">Password</Text>
                  <TextInput
                    className="bg-white/10 text-white px-5 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  className="bg-white py-5 rounded-2xl shadow-lg mb-4"
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black text-center text-base font-jakarta-bold">Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link - Always at bottom */}
            <View className="px-6 pb-8">
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-300 font-jakarta-regular text-base">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup' as any)} disabled={loading}>
                  <Text className="text-white font-jakarta-bold text-base mb-1">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
