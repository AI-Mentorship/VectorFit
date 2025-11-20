import React from 'react';
import { View, Text, Image } from 'react-native';
import { type ActiveClothing } from '../utils/api';

interface FriendClothingCardProps {
  userName: string;
  firstName: string;
  lastName: string;
  activeClothes: ActiveClothing[];
  lastUpdated?: string;
}

export default function FriendClothingCard({
  userName,
  firstName,
  lastName,
  activeClothes,
  lastUpdated,
}: FriendClothingCardProps) {
  // Function to format the time difference
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      {/* Friend Info */}
      <View className="mb-3">
        <Text className="text-lg font-grotesk-bold text-black">
          {firstName} {lastName}
        </Text>
        <Text className="text-sm font-jakarta-medium text-black/50">
          @{userName}
        </Text>
      </View>

      {/* Active Clothes */}
      <View className="flex-row gap-3">
        {activeClothes.map((item) => (
          <View key={item.clotheItemId} className="flex-1">
            <View className="relative">
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full aspect-square rounded-xl"
                resizeMode="cover"
              />
              {/* Position Badge */}
              <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full">
                <Text className="text-xs font-jakarta-semibold text-white capitalize">
                  {item.position}
                </Text>
              </View>
            </View>
            {/* Clothing Info */}
            <View className="mt-2">
              <Text className="text-xs font-jakarta-semibold text-black capitalize">
                {item.clothingType}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{
                    backgroundColor: `rgb(${item.dominantColor.rgb.join(',')})`,
                  }}
                />
                <Text className="text-xs font-jakarta-medium text-black/50 capitalize">
                  {item.dominantColor.name}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Last Updated Time */}
      {lastUpdated && (
        <View className="mt-3 pt-3 border-t border-black/10">
          <Text className="text-xs font-jakarta-medium text-black/40">
            Updated {getTimeAgo(lastUpdated)}
          </Text>
        </View>
      )}
    </View>
  );
}
