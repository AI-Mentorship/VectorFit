import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useCloset } from './_layout';
import HistoryIcon from '../../../assets/VirtualCloset/History.svg'

export default function History() {
  const { outfits, loading, clothingCache } = useCloset();

  console.log('History page - outfits:', outfits);
  console.log('History page - outfits length:', outfits.length);
  console.log('History page - loading:', loading);
  console.log('History page - clothingCache size:', clothingCache.size);

  const formatDateTime = (timestamp: string) => {
    console.log('Raw timestamp:', timestamp);
    console.log('Type of timestamp:', typeof timestamp);

    // Create date object from ISO string
    const date = new Date(timestamp);
    console.log('Parsed date:', date);
    console.log('Date toString:', date.toString());
    console.log('Date is valid:', !isNaN(date.getTime()));

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected, returning fallback');
      return 'Date not available';
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    console.log('Formatted date:', formattedDate);
    console.log('Formatted time:', formattedTime);

    return `${formattedDate} at ${formattedTime}`;
  };

  if (loading && outfits.length === 0) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" color="#000" />
        <Text className='font-jakarta-medium text-gray-500 mt-2'>Loading outfit history...</Text>
      </View>
    );
  }

  if (outfits.length === 0) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='font-jakarta-medium text-gray-500'>No outfits saved yet</Text>
        <Text className='font-jakarta-regular text-gray-400 mt-2 text-center px-8'>
          Create your first outfit in the Selection Menu
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 mx-5 mt-4 mb-2 rounded-lg' showsVerticalScrollIndicator={false}>
      <View>
        {outfits.map((outfit) => {
          const topItem = clothingCache.get(outfit.topId);
          const bottomItem = clothingCache.get(outfit.bottomId);

          return (
            <View key={outfit.timestamp} className='bg-white p-4 rounded-lg mb-3'>
              <View className='flex-row gap-2 items-center mb-3'>
                <HistoryIcon width={20} height={20}/>
                <Text className='font-grotesk-bold text-lg'>
                  {formatDateTime(outfit.timestamp)}
                </Text>
              </View>


              {/* Top Item */}
              {topItem && (
                <View key={`top-${outfit.topId}-${outfit.timestamp}`} className='flex-row gap-4 mb-3'>
                  <Image
                    source={{ uri: topItem.imageUrl }}
                    className='w-20 h-24 rounded-lg'
                    resizeMode="cover"
                  />
                  <View className='flex-1'>
                    <Text className='font-jakarta-medium'>
                      <Text className='font-jakarta-bold'>Item:</Text> {topItem.clothingType}
                    </Text>
                    <View className='flex-row items-center mt-1'>
                      <Text className='font-jakarta-bold mb-1.5'>Color: </Text>
                      <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                        <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>
                          {topItem.dominantColor.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Bottom Item */}
              {bottomItem && (
                <View key={`bottom-${outfit.bottomId}-${outfit.timestamp}`} className='flex-row gap-4'>
                  <Image
                    source={{ uri: bottomItem.imageUrl }}
                    className='w-20 h-24 rounded-lg'
                    resizeMode="cover"
                  />
                  <View className='flex-1'>
                    <Text className='font-jakarta-medium'>
                      <Text className='font-jakarta-bold'>Item:</Text> {bottomItem.clothingType}
                    </Text>
                    <View className='flex-row items-center mt-1'>
                      <Text className='font-jakarta-bold mb-1.5'>Color: </Text>
                      <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                        <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>
                          {bottomItem.dominantColor.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Show loading state if items not in cache */}
              {(!topItem || !bottomItem) && (
                <View key={`loading-${outfit.timestamp}`} className='py-4'>
                  <ActivityIndicator size="small" color="#000" />
                  <Text className='font-jakarta-medium text-gray-500 text-center mt-2'>
                    Loading outfit details...
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
