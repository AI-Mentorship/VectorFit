import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClosetSenseiDark from '../../assets/Dashboard/ClosetSenseiDark.svg'
import AddFriends from '../../assets/Dashboard/AddFriends.svg'
// import Search from '../../assets/Dashboard/Search.svg'
// import Menu from '../../assets/Dashboard/Menu.svg'
import TotalItems from '../../assets/Dashboard/TotalItems.svg'
import TotalFriends from '../../assets/Dashboard/TotalFriends.svg'
import TopCardOptions from '../../assets/Dashboard/TopCardOptions.svg'
import SelectButton from '../../assets/Dashboard/SelectButton.svg'
import { useSession } from '../ctx';
import { type UserProfile, getAllClothes, getActiveOutfit, type ActiveOutfit, getFriendsActiveClothes } from '../../utils/api';
import FriendsModal from '../../components/FriendsModal';
import CommunityModal from '../../components/CommunityModal';

export default function Home() {
  const { user, session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [clothingItemsCount, setClothingItemsCount] = useState(0);
  const [activeOutfit, setActiveOutfit] = useState<ActiveOutfit | null>(null);
  const [loadingOutfit, setLoadingOutfit] = useState(false);
  const [friendsActiveCount, setFriendsActiveCount] = useState(0);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [communityModalVisible, setCommunityModalVisible] = useState(false);
  const router = useRouter();

  // Animation values
  const translateX = useSharedValue(1000);

  useEffect(() => {
    // Trigger slide-in animation when component mounts
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 150,
      mass: 1,
      overshootClamping: true,
    });
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Using cached user data:', user);
      setUserProfile(user);
      setLoading(false);
    }
  }, [user]);

  const fetchClothingCount = async () => {
    if (!session) return;

    try {
      // First check AsyncStorage cache for faster updates
      const cachedClothes = await AsyncStorage.getItem('cached_clothes');
      if (cachedClothes) {
        const clothes = JSON.parse(cachedClothes);
        setClothingItemsCount(clothes.length);
      }

      // Then fetch fresh data from API
      const clothes = await getAllClothes(session);
      setClothingItemsCount(clothes.length);
    } catch (error) {
      console.error('Failed to fetch clothing count:', error);
    }
  };

  const fetchActiveOutfit = async () => {
    if (!session) return;

    try {
      setLoadingOutfit(true);
      const outfit = await getActiveOutfit(session);
      setActiveOutfit(outfit);
    } catch (error) {
      console.error('Failed to fetch active outfit:', error);
    } finally {
      setLoadingOutfit(false);
    }
  };

  const fetchFriendsActiveCount = async () => {
    if (!session) return;

    try {
      const friendsClothes = await getFriendsActiveClothes(session);
      setFriendsActiveCount(friendsClothes.length);
    } catch (error) {
      console.error('Failed to fetch friends active clothes count:', error);
    }
  };

  useEffect(() => {
    fetchClothingCount();
    fetchActiveOutfit();
    fetchFriendsActiveCount();
  }, [session]);

  // Refresh clothing count and active outfit when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchClothingCount();
      fetchActiveOutfit();
      fetchFriendsActiveCount();
    }, [session])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (loading) return '...';
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.firstName) return userProfile.firstName;
    if (userProfile?.userName) return userProfile.userName;
    if (userProfile?.email) return userProfile.email.split('@')[0];
    return 'User';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={animatedStyle} className="flex px-5 pt-2">
        {/* Top 2 buttons and title with just inbetween*/}
        <View className='flex-row justify-between items-center'>
          <View className='p-1 w-12 h-12 flex items-center justify-center rounded-lg bg-[#D9D9D9]'>
            <ClosetSenseiDark width={30} height={30} />
          </View>

          <View className='flex-1 mx-4'>
            <Text className='text-lg font-jakarta-semibold text-black text-center'>{getGreeting()}</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className='text-sm font-grotesk-medium text-black text-center'>{getUserName()}</Text>
            )}
          </View>

          <TouchableOpacity
            className='p-1 w-12 h-12 flex items-center justify-center rounded-lg border border-black/50'
            onPress={() => setFriendsModalVisible(true)}
            activeOpacity={0.7}
          >
            <AddFriends width={30} height={30} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        {/* <View className='flex-row pt-4 gap-2'>
          <View className='flex-1 flex-row gap-2 items-center bg-white rounded-xl p-2'>
            <Search width={20} height={20} />
            <Text className='text-base font-jakarta-medium opacity-50'>Search for outfits</Text>
          </View>

          <View className='bg-[#373030] rounded-lg flex items-center justify-center p-2'>
            <Menu width={28} height={28} />
          </View>
        </View> */}

        {/* Top Cards */}
        <View className='flex-row gap-2 mt-4'>
          <TouchableOpacity
            className='flex-1 rounded-lg bg-white p-2'
            onPress={() => router.push('/closet')}
            activeOpacity={0.7}
          >
            {/* Top side buttons*/}
            <View className='flex-row justify-between mb-3'>
              <TotalItems width={20} height={20} />
              <TopCardOptions width={18} height={18} />
            </View>
            <Text className='font-jakarta-bold text-xl'>{clothingItemsCount}</Text>
            <Text className='font-jakarta-medium text-lg'>Clothing Items</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-1 rounded-lg bg-white p-2'
            onPress={() => setCommunityModalVisible(true)}
            activeOpacity={0.7}
          >
            {/* Top side buttons*/}
            <View className='flex-row justify-between mb-3'>
              <TotalFriends width={20} height={20} />
              <TopCardOptions width={18} height={18} />
            </View>
            <Text className='font-jakarta-bold text-xl'>{friendsActiveCount}</Text>
            <Text className='font-jakarta-medium text-lg'>Community</Text>
          </TouchableOpacity>
        </View>

        {/* Current Active Outfit*/}
        <Text className='mt-4 font-grotesk-bold text-2xl'>
          Current Active Outfit
        </Text>

        {loadingOutfit ? (
          <View className='bg-white p-4 rounded-lg mt-3 items-center justify-center py-12'>
            <ActivityIndicator size="large" color="#000" />
            <Text className='text-sm font-jakarta-medium text-black/50 mt-4'>
              Loading outfit...
            </Text>
          </View>
        ) : !activeOutfit?.top && !activeOutfit?.bottom ? (
          <TouchableOpacity
            className='bg-white p-8 rounded-lg mt-3 items-center justify-center'
            onPress={() => router.push('/closet')}
            activeOpacity={0.7}
          >
            <SelectButton width={60} height={60} />
            <Text className='text-xl font-jakarta-bold text-black mt-4 text-center'>
              No Active Outfit Selected
            </Text>
            <Text className='text-sm font-jakarta-medium text-black/60 mt-2 text-center'>
              Tap to visit your Virtual Closet and select an outfit
            </Text>
          </TouchableOpacity>
        ) : (
          <View className='bg-white p-4 rounded-lg mt-3 flex gap-3'>
            {/* Top clothing item */}
            {activeOutfit?.top && (
              <View className='flex-row gap-4'>
                <Image
                  source={{ uri: activeOutfit.top.imageUrl }}
                  className='w-28 h-28 rounded-lg'
                  resizeMode="cover"
                />
                <View className='flex-1'>
                  <Text className='font-jakarta-medium capitalize'>
                    <Text className='font-jakarta-bold'>Type: </Text>
                    {activeOutfit.top.clothingType}
                  </Text>
                  <View className='flex-row items-center gap-2 mt-2'>
                    <View
                      className='w-4 h-4 rounded-full border border-black/20'
                      style={{
                        backgroundColor: `rgb(${activeOutfit.top.dominantColor.rgb.join(',')})`,
                      }}
                    />
                    <Text className='text-sm font-jakarta-medium text-black/70 capitalize'>
                      {activeOutfit.top.dominantColor.name}
                    </Text>
                  </View>
                  <Text className='text-xs font-jakarta-medium text-black/50 mt-2'>
                    Position: Top
                  </Text>
                </View>
              </View>
            )}

            {/* Bottom clothing item */}
            {activeOutfit?.bottom && (
              <View className='flex-row gap-4'>
                <Image
                  source={{ uri: activeOutfit.bottom.imageUrl }}
                  className='w-28 h-28 rounded-lg'
                  resizeMode="cover"
                />
                <View className='flex-1'>
                  <Text className='font-jakarta-medium capitalize'>
                    <Text className='font-jakarta-bold'>Type: </Text>
                    {activeOutfit.bottom.clothingType}
                  </Text>
                  <View className='flex-row items-center gap-2 mt-2'>
                    <View
                      className='w-4 h-4 rounded-full border border-black/20'
                      style={{
                        backgroundColor: `rgb(${activeOutfit.bottom.dominantColor.rgb.join(',')})`,
                      }}
                    />
                    <Text className='text-sm font-jakarta-medium text-black/70 capitalize'>
                      {activeOutfit.bottom.dominantColor.name}
                    </Text>
                  </View>
                  <Text className='text-xs font-jakarta-medium text-black/50 mt-2'>
                    Position: Bottom
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      <FriendsModal
        visible={friendsModalVisible}
        onClose={() => setFriendsModalVisible(false)}
      />

      <CommunityModal
        visible={communityModalVisible}
        onClose={() => setCommunityModalVisible(false)}
      />
    </SafeAreaView>
  );
}
