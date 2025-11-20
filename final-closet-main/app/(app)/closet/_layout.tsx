import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot, useRouter, usePathname, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClosetIcon from '../../../assets/NavBar/Closet.svg';
import Sync from '../../../assets/VirtualCloset/Sync.svg';
import { useSession } from '../../ctx';
import { getAllClothes, getAllOutfits, type ClothingItem, type Outfit } from '../../../utils/api';

export const clothingCategoryMap: Record<string, 'tops' | 'bottoms'> = {
  'Blazer': 'tops',
  'Trousers/Long Pants': 'bottoms',
  'Shorts': 'bottoms',
  'Dress': 'tops',
  'Hoodie': 'tops',
  'Jacket': 'tops',
  'Denim Jacket': 'tops',
  'Sports Jacket': 'tops',
  'Jeans': 'bottoms',
  'T-Shirt': 'tops',
  'Button-Up Shirt': 'tops',
  'Coat': 'tops',
  'Polo Shirt': 'tops',
  'Skirt': 'bottoms',
  'Sweater': 'tops',
};

// Create a context to share clothing data and sync function
interface ClosetContextType {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  loading: boolean;
  handleSync: () => void;
  tops: ClothingItem[];
  bottoms: ClothingItem[];
  clothingCache: Map<string, ClothingItem>;
  refreshClothes: () => Promise<void>;
}

const ClosetContext = createContext<ClosetContextType | undefined>(undefined);

export const useCloset = () => {
  const context = useContext(ClosetContext);
  if (!context) {
    throw new Error('useCloset must be used within ClosetLayout');
  }
  return context;
};

export default function ClosetLayout() {
  const { session } = useSession();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [clothingCache, setClothingCache] = useState<Map<string, ClothingItem>>(new Map());
  const router = useRouter();
  const pathname = usePathname();

  // Function to load cached data
  const loadCachedData = async () => {
    try {
      const cachedClothes = await AsyncStorage.getItem('cached_clothes');
      const cachedOutfits = await AsyncStorage.getItem('cached_outfits');

      if (cachedClothes) {
        const clothes = JSON.parse(cachedClothes);
        setClothingItems(clothes);
        // Build cache map
        const cache = new Map();
        clothes.forEach((item: ClothingItem) => {
          cache.set(item.clotheItemId, item);
        });
        setClothingCache(cache);
      }

      if (cachedOutfits) {
        setOutfits(JSON.parse(cachedOutfits));
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Reload cached data when navigating to closet routes
  useEffect(() => {
    if (pathname.startsWith('/closet')) {
      loadCachedData();
    }
  }, [pathname]);

  const fetchClothes = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const clothes = await getAllClothes(session);
      setClothingItems(clothes);

      // Cache the data
      await AsyncStorage.setItem('cached_clothes', JSON.stringify(clothes));

      // Build cache map
      const cache = new Map();
      clothes.forEach((item: ClothingItem) => {
        cache.set(item.clotheItemId, item);
      });
      setClothingCache(cache);
    } catch (error) {
      console.error('Failed to fetch clothes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutfits = async () => {
    if (!session) {
      console.log('No session available for fetching outfits');
      return;
    }

    try {
      console.log('Fetching outfits with session token');
      const outfitsList = await getAllOutfits(session);
      console.log('Fetched outfits list:', outfitsList);
      console.log('Number of outfits:', outfitsList.length);
      setOutfits(outfitsList);

      // Cache the data
      await AsyncStorage.setItem('cached_outfits', JSON.stringify(outfitsList));
      console.log('Outfits cached successfully');
    } catch (error) {
      console.error('Failed to fetch outfits:', error);
      // Don't throw - just log the error so the app continues working
    }
  };

  useEffect(() => {
    if (session) {
      fetchClothes();
      fetchOutfits();
    }
  }, [session]);

  const handleSync = () => {
    fetchClothes();
    fetchOutfits();
  };

  const tops = clothingItems.filter(
    item => clothingCategoryMap[item.clothingType] === 'tops'
  );
  const bottoms = clothingItems.filter(
    item => clothingCategoryMap[item.clothingType] === 'bottoms'
  );

  const isSelectionMenu = pathname === '/closet' || pathname === '/closet/selection-menu';
  const isHistory = pathname === '/closet/history';

  return (
    <ClosetContext.Provider value={{ clothingItems, outfits, loading, handleSync, tops, bottoms, clothingCache, refreshClothes: fetchClothes }}>
      <SafeAreaView className="flex-1 bg-[#F0F0F0]" edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View className="flex-row gap-2 items-center px-5 py-3">
          <ClosetIcon width={26} height={26} />
          <Text className="text-2xl font-grotesk-bold">
            Virtual Closet
          </Text>
        </View>

        <View className='flex-row justify-between px-5'>
          <View className='bg-white rounded-xl p-2 flex-row gap-1 self-start'>
            <TouchableOpacity onPress={() => router.push('/closet/selection-menu')}>
              <Text className={`px-4 py-1 rounded-lg font-jakarta-bold text-sm ${isSelectionMenu ? 'bg-[#D9D9D9]' : 'text-black/50'}`}>
                Selection Menu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/closet/history')}>
              <Text className={`px-4 py-1 rounded-lg font-jakarta-bold text-sm ${isHistory ? 'bg-[#D9D9D9]' : 'text-black/50'}`}>
                History
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSync} disabled={loading}>
            <Sync width={26} height={26} style={{ opacity: loading ? 0.5 : 1 }} />
          </TouchableOpacity>
        </View>

        <Slot />
      </SafeAreaView>
    </ClosetContext.Provider>
  );
}