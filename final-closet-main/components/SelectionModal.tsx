import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { type ClothingItem, createOutfit } from '../utils/api';
import { useSession } from '../app/ctx';
import { useCloset } from '../app/(app)/closet/_layout';
import GoBack from '../assets/VirtualCloset/GoBack.svg'
interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTop?: ClothingItem;
  selectedBottom?: ClothingItem;
}

export default function SelectionModal({ visible, onClose, selectedTop, selectedBottom }: SelectionModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { session } = useSession();
  const { handleSync } = useCloset();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);

  const handleFinalizeSelection = async () => {
    if (!selectedTop || !selectedBottom) {
      Alert.alert('Error', 'Please select both a top and bottom item');
      return;
    }

    if (!session) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      const response = await createOutfit(
        {
          topId: selectedTop.clotheItemId,
          bottomId: selectedBottom.clotheItemId,
        },
        session
      );
      console.log('Outfit created successfully:', response);

      // Refresh outfits data to show the new outfit in history
      handleSync();

      Alert.alert('Success', 'Outfit saved successfully!', [
        {
          text: 'OK',
          onPress: () => onClose(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create outfit:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save outfit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      onShow={() => StatusBar.setBarStyle('light-content')}
      onDismiss={() => StatusBar.setBarStyle('dark-content')}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View
        className="absolute inset-0 bg-black/50"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY: slideAnim }]
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-[#F0F0F0] rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className='bg-[#F0F0F0] rounded-t-3xl px-6 py-6 min-h-[600px] flex justify-between'>
            <View>
              <View className='flex-row justify-between items-center mb-6'>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <GoBack width={22} height={22}/>
                </TouchableOpacity>
                <Text className='text-2xl font-grotesk-bold text-center'>
                  Save Selection
                </Text>
                <View className='w-[22px]'/>
              </View>
              {selectedTop && (
                <View className='flex-row gap-4 bg-[#FFFFFF] rounded-lg p-4'>
                  <Image source={{ uri: selectedTop.imageUrl }} className='w-20 h-24 rounded-lg' resizeMode="cover" />
                  <View className='flex-1'>
                    <Text className='font-jakarta-medium'><Text className='font-jakarta-bold'>Item:</Text> {selectedTop.clothingType}</Text>
                    <View className='flex-row items-center mt-1'>
                      <Text className='font-jakarta-bold mb-1.5'>Color: </Text>
                      <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                        <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>{selectedTop.dominantColor.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {selectedBottom && (
                <View className='flex-row gap-4 bg-[#FFFFFF] rounded-lg p-4 mt-2'>
                  <Image source={{ uri: selectedBottom.imageUrl }} className='w-20 h-24 rounded-lg' resizeMode="cover" />
                  <View className='flex-1'>
                    <Text className='font-jakarta-medium'><Text className='font-jakarta-bold'>Item:</Text> {selectedBottom.clothingType}</Text>
                    <View className='flex-row items-center mt-1'>
                      <Text className='font-jakarta-bold mb-1.5'>Color: </Text>
                      <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                        <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>{selectedBottom.dominantColor.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleFinalizeSelection}
              disabled={loading}
              className='bg-[#0DB22B] mb-6 rounded-full py-2'
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className='text-center text-lg text-white font-jakarta-semibold'>
                  Finalize Selection
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}