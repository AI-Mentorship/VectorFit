import React, { useState, useRef } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Alert, Animated, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '../ctx';
import { predictClothing, type PredictResponse } from '../../utils/api';
import { refreshClothingCache } from '../../utils/cacheManager';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type UploadStage = 'camera' | 'uploading' | 'processing' | 'complete' | 'results';

export default function Add() {
  const { session } = useSession();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<UploadStage>('camera');
  const [result, setResult] = useState<PredictResponse | null>(null);
  const cameraRef = useRef<any>(null);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!permission) {
    return <View className="flex-1 bg-[#F0F0F0]" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="camera-outline" size={80} color="#373030" style={{ marginBottom: 20 }} />
          <Text className="text-black text-2xl font-grotesk-bold mb-4 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-gray-600 text-base font-jakarta-regular mb-8 text-center">
            We need access to your camera to take photos of your clothing items.
          </Text>
          <TouchableOpacity
            className="bg-[#373030] py-4 px-8 rounded-2xl"
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-jakarta-bold">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      await uploadImage(photo.uri);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to capture photo');
      console.error(error);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to select image');
      console.error(error);
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!session) {
      Alert.alert('Error', 'You must be logged in to upload images');
      return;
    }

    try {
      setStage('uploading');
      Animated.timing(progressAnim, {
        toValue: 0.5,
        duration: 500,
        useNativeDriver: false,
      }).start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStage('processing');
      Animated.timing(progressAnim, {
        toValue: 0.75,
        duration: 500,
        useNativeDriver: false,
      }).start();
      const predictResult = await predictClothing(imageUri, session);
      setStage('complete');
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh the clothing cache in the background
      refreshClothingCache(session).catch(err => {
        console.error('Failed to refresh cache after prediction:', err);
      });

      // Fade out progress, fade in results
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setResult(predictResult);
        setStage('results');
        fadeAnim.setValue(1);
      });

    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
      setStage('camera');
      progressAnim.setValue(0);
    }
  };

  const resetToCamera = () => {
    setStage('camera');
    setResult(null);
    progressAnim.setValue(0);
    fadeAnim.setValue(1);
  };

  // Camera View
  if (stage === 'camera') {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
        />
        {/* Overlay UI with absolute positioning */}
        <View
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{ pointerEvents: 'box-none' }}
        >
          <View className="flex-1 justify-end items-center pb-10" style={{ pointerEvents: 'box-none' }}>
            <View className="flex-row items-center justify-center gap-8" style={{ pointerEvents: 'auto' }}>
              {/* Upload Button */}
              <TouchableOpacity
                className="bg-white/20 backdrop-blur-md p-5 rounded-full border-2 border-white/30"
                onPress={handleUpload}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={32} color="white" />
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                className="bg-white p-2 rounded-full"
                onPress={handleCapture}
                activeOpacity={0.8}
              >
                <View className="w-20 h-20 bg-transparent border-4 border-black rounded-full" />
              </TouchableOpacity>

              {/* Flip Camera Button */}
              <TouchableOpacity
                className="bg-white/20 backdrop-blur-md p-5 rounded-full border-2 border-white/30"
                onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-reverse-outline" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Upload Progress View
  if (stage === 'uploading' || stage === 'processing' || stage === 'complete') {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <Animated.View
          className="flex-1 justify-center items-center p-8"
          style={{ opacity: fadeAnim }}
        >
          {/* Icon */}
          <View className="mb-8">
            {stage === 'complete' ? (
              <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
            ) : (
              <ActivityIndicator size="large" color="#373030" />
            )}
          </View>

          {/* Status Text */}
          <Text className="text-black text-2xl font-grotesk-bold mb-2 text-center">
            {stage === 'uploading' && 'Uploading Image...'}
            {stage === 'processing' && 'Analyzing Clothing...'}
            {stage === 'complete' && 'Upload Complete!'}
          </Text>

          <Text className="text-gray-600 text-base font-jakarta-regular mb-12 text-center">
            {stage === 'uploading' && 'Sending your image to our servers'}
            {stage === 'processing' && 'Our AI is identifying your clothing'}
            {stage === 'complete' && 'Getting your results ready'}
          </Text>

          {/* Progress Bar */}
          <View className="w-full">
            <View className="bg-gray-300 h-2 rounded-full overflow-hidden">
              <Animated.View
                className="bg-[#373030] h-full rounded-full"
                style={{ width: progressWidth }}
              />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Results View
  if (stage === 'results' && result) {
    const [r, g, b] = result.dominantColor.rgb;
    const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    const borderColor = `rgb(${r}, ${g}, ${b})`;

    return (
      <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4">
          <TouchableOpacity
            onPress={() => router.push('/(app)/home')}
            className="mr-2 flex-row gap-2"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
            <Text className="text-black text-xl font-grotesk-bold">Home</Text>
          </TouchableOpacity>
          
        </View>

        {/* Result Card */}
        <View className="flex-1 px-6">
          <View className=" pt-8">
            <View
              className="rounded-3xl p-8 border-4"
              style={{
                backgroundColor,
                borderColor,
              }}
            >
              {/* Success Icon */}
              <View className="items-center mb-6">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: borderColor }}
                >
                  <Ionicons name="checkmark" size={48} color="white" />
                </View>
              </View>

              {/* Clothing Type */}
              <Text className="text-white text-3xl font-grotesk-bold text-center mb-2">
                {result.clothingType}
              </Text>

              {/* Confidence */}
              <Text className="text-white/80 text-lg font-jakarta-regular text-center mb-8">
                {result.confidence.toFixed(1)}% confident
              </Text>

              {/* Dominant Color */}
              <View className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
                <Text className="text-white text-sm font-jakarta-semibold mb-3">Dominant Color</Text>
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full mr-4"
                    style={{ backgroundColor: borderColor }}
                  />
                  <View>
                    <Text className="text-white text-xl font-grotesk-bold">
                      {result.dominantColor.name}
                    </Text>
                    <Text className="text-white/60 text-sm font-jakarta-regular">
                      RGB({r}, {g}, {b})
                    </Text>
                  </View>
                </View>
              </View>

              {/* Item ID */}
              <Text className="text-white/40 text-xs font-jakarta-regular text-center">
                Item ID: {result.clotheItemId.substring(0, 8)}...
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2 flex-row pt-4">
            <TouchableOpacity
              className="bg-[#373030] rounded-2xl px-4 py-2 flex items-center justify-center"
              onPress={() => router.push('/(app)/closet')}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center text-base font-jakarta-bold">
                View in Closet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white px-4 py-2 flex items-center justify-center rounded-2xl border-2 border-gray-300"
              onPress={resetToCamera}
              activeOpacity={0.8}
            >
              <Text className="text-black text-center text-base font-jakarta-bold">
                Add More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}
