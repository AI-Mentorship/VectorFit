import React from 'react';
import { View, Text, ImageBackground, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import ClosetSenseiIcon from '../assets/ClosetSenseiIcon.svg';
import GetStartedStar from '../assets/GetStarted/GetStartedStar.svg';
import SlideToStart from '../components/SlideToStart';

export default function GetStarted() {
  const handleGetStarted = async () => {
    // Mark onboarding as complete
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    // Navigate to login
    router.replace('/login' as any);
  };

  return (
    <ImageBackground
      source={require('../assets/GetStarted/GetStartedBg.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1 pt-2" edges={['top', 'bottom']}>
        <View className='flex-1 flex-col justify-between'>
          {/* Top Content */}
          <View>
            <View className="flex-row items-center px-5 pt-2 pb-16">
              <ClosetSenseiIcon width={26} height={26} />
              <Text className="text-2xl font-semibold ml-2 text-white font-grotesk-semibold">
                Closet Sensei
              </Text>
            </View>
            <GetStartedStar width={250} height={360} />
          </View>


          {/* Bottom Content */}
          <View className='px-5 pb-5'>
            <View className='flex-row gap-2'>
              <Text className='text-white py-2 px-4 bg-[#403F3F] rounded-lg font-jakarta-medium'>Click</Text>
              <Text className='text-white py-2 px-4 bg-[#403F3F] rounded-lg font-jakarta-medium'>Select</Text>
              <Text className='text-white py-2 px-4 bg-[#403F3F] rounded-lg font-jakarta-medium'>Wear</Text>
            </View>

            <Text className='pt-4 text-white text-4xl w-3/4 font-grotesk-medium'>Stop stressing on what to wear</Text>
            <Text className='pt-2 text-white font-jakarta-medium w-3/5'>Snap your wardrobe. Unlock endless outfits.</Text>

            {/* Sliding Get Started Button */}
            <View className='pt-10'>
              <SlideToStart onComplete={handleGetStarted} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
