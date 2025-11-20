import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from './ctx';
import { router } from 'expo-router';
import ClosetSenseiIcon from '../assets/ClosetSenseiIcon.svg';

export default function SignUp() {
  const { signUp } = useSession();
  const [step, setStep] = useState(1);

  // Form fields
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!firstName || !lastName) {
        Alert.alert('Error', 'Please enter your first and last name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!userName || !email) {
        Alert.alert('Error', 'Please enter username and email');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    try {
      await signUp({ userName, firstName, lastName, email, password });
      router.replace('/(app)' as any);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-8">
      <View className={`h-2 w-2 rounded-full mx-1 ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
      <View className={`h-2 w-2 rounded-full mx-1 ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
      <View className={`h-2 w-2 rounded-full mx-1 ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text className="text-white text-3xl font-grotesk-bold mb-2">What's your name?</Text>
      <Text className="text-gray-300 text-base font-jakarta-regular mb-8">Let's get to know you</Text>

      <View className="mb-4">
        <Text className="text-white text-sm font-jakarta-medium mb-2">First Name</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="John"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
          returnKeyType="next"
        />
      </View>

      <View className="mb-8">
        <Text className="text-white text-sm font-jakarta-medium mb-2">Last Name</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="Doe"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>

      <TouchableOpacity
        className="bg-white py-4 rounded-2xl"
        onPress={handleNext}
        disabled={loading}
      >
        <Text className="text-black text-center text-base font-jakarta-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-white text-3xl font-grotesk-bold mb-2">Create your account</Text>
      <Text className="text-gray-300 text-base font-jakarta-regular mb-8">Choose a unique username</Text>

      <View className="mb-4">
        <Text className="text-white text-sm font-jakarta-medium mb-2">Username</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="johndoe"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          editable={!loading}
          returnKeyType="next"
        />
      </View>

      <View className="mb-8">
        <Text className="text-white text-sm font-jakarta-medium mb-2">Email</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="john@example.com"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-white/20 py-4 rounded-2xl border border-white/30"
          onPress={handleBack}
          disabled={loading}
        >
          <Text className="text-white text-center text-base font-jakarta-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-white py-4 rounded-2xl"
          onPress={handleNext}
          disabled={loading}
        >
          <Text className="text-black text-center text-base font-jakarta-bold">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-white text-3xl font-grotesk-bold mb-2">Secure your account</Text>
      <Text className="text-gray-300 text-base font-jakarta-regular mb-8">Create a strong password</Text>

      <View className="mb-4">
        <Text className="text-white text-sm font-jakarta-medium mb-2">Password</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="••••••••"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          returnKeyType="next"
        />
        <Text className="text-gray-400 text-xs font-jakarta-regular mt-1">At least 6 characters</Text>
      </View>

      <View className="mb-8">
        <Text className="text-white text-sm font-jakarta-medium mb-2">Confirm Password</Text>
        <TextInput
          className="bg-white/10 text-white px-4 py-4 rounded-2xl font-jakarta-regular border border-white/20 text-base"
          placeholder="••••••••"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-white/20 py-4 rounded-2xl border border-white/30"
          onPress={handleBack}
          disabled={loading}
        >
          <Text className="text-white text-center text-base font-jakarta-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-white py-4 rounded-2xl"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black text-center text-base font-jakarta-bold">Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
            <View className="px-6 pt-6">
              {/* Header with Logo */}
              <View className="flex-row items-center mb-8">
                <ClosetSenseiIcon width={26} height={26} />
                <Text className="text-2xl font-semibold ml-2 text-white font-grotesk-semibold">
                  Closet Sensei
                </Text>
              </View>

              {/* Step Indicator */}
              {renderStepIndicator()}

              {/* Step Content */}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </View>

            {/* Login Link - Always at bottom */}
            <View className="px-6 pb-6">
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-300 font-jakarta-regular">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)} disabled={loading}>
                  <Text className="text-white font-jakarta-bold mb-1">Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}