import React, { useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Idea from '../../../assets/VirtualCloset/Idea.svg';
import { useCloset } from './_layout';
import SelectButton from '../../../assets/Dashboard/SelectButton.svg'
import SelectionModal from '../../../components/SelectionModal';

export default function SelectionMenu() {
  const { loading, tops, bottoms } = useCloset();
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [selectedBottomId, setSelectedBottomId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Reset selections when navigating to this screen
  useFocusEffect(
    React.useCallback(() => {
      setSelectedTopId(null);
      setSelectedBottomId(null);
      setModalVisible(false);
    }, [])
  );

  const handleTopSelect = (id: string) => {
    console.log('Top selected ID:', id);
    console.log('Current selected top ID:', selectedTopId);
    console.log('Are they equal?', selectedTopId === id);
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedTopId(selectedTopId === id ? null : id);
  };

  const handleBottomSelect = (id: string) => {
    console.log('Bottom selected ID:', id);
    console.log('Current selected bottom ID:', selectedBottomId);
    console.log('Are they equal?', selectedBottomId === id);
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedBottomId(selectedBottomId === id ? null : id);
  };

  const handleSelectPress = () => {
    if (selectedTopId && selectedBottomId) {
      setModalVisible(true);
    }
  };

  const selectedTop = tops.find(item => item.clotheItemId === selectedTopId);
  const selectedBottom = bottoms.find(item => item.clotheItemId === selectedBottomId);

  return (
    <View className='flex-1'>
      <View className='mt-4 mx-5 p-4 bg-white rounded-lg'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-row gap-2 items-center'>
            <Idea width={20} height={20} />
            <Text className='font-jakarta-bold text-lg'>Guided Advice</Text>
          </View>
          <Text className='bg-[#E5E5E5] rounded-xl font-jakarta-medium px-4 py-1'>New</Text>
        </View>


        <Text className='mt-2'>
          Since you have a business conference today, you should select items such as a polo shirt with a dark color to complement the weather of 68 degrees and dress pants with a pair of dress shoes.
        </Text>
      </View>

      <Text className='ml-5 mt-4 font-grotesk-bold text-2xl'>Select from the following</Text>
      <View>
        <Text className='ml-5 font-grotesk-bold text-lg'>
          Tops
        </Text>
        {loading ? (
          <View className='mt-2 ml-5'>
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : tops.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='mt-2 flex-grow-0'
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <View className='flex-row gap-2'>
              {tops.map((item) => (
                <TouchableOpacity
                  key={item.clotheItemId}
                  onPress={() => handleTopSelect(item.clotheItemId)}
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row gap-4 p-4 rounded-lg ${selectedTopId === item.clotheItemId ? 'bg-green-200' : 'bg-white'
                      }`}
                  >
                    <Image source={{ uri: item.imageUrl }} className='w-20 h-24 rounded-lg' resizeMode="cover" />
                    <View>
                      <Text className='font-jakarta-medium'><Text className='font-jakarta-bold'>Item:</Text> {item.clothingType}</Text>
                      <View className='flex-row items-center mt-1'>
                        <Text className='font-jakarta-bold mb-1.5'>Last Worn: </Text>
                        <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                          <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>2 days ago</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text className='mt-2 ml-5 text-gray-500 font-jakarta-medium'>No tops found</Text>
        )}
      </View>

      <View>
        <Text className='mt-4 ml-5 font-grotesk-bold text-lg'>
          Bottoms
        </Text>
        {loading ? (
          <View className='mt-2 ml-5'>
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : bottoms.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='mt-2 flex-grow-0'
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <View className='flex-row gap-2'>
              {bottoms.map((item) => (
                <TouchableOpacity
                  key={item.clotheItemId}
                  onPress={() => handleBottomSelect(item.clotheItemId)}
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row gap-4 p-4 rounded-lg ${selectedBottomId === item.clotheItemId ? 'bg-green-200' : 'bg-white'
                      }`}
                  >
                    <Image source={{ uri: item.imageUrl }} className='w-20 h-24 rounded-lg' resizeMode="cover" />
                    <View>
                      <Text className='font-jakarta-medium'><Text className='font-jakarta-bold'>Item:</Text> {item.clothingType}</Text>
                      <View className='flex-row items-center mt-1'>
                        <Text className='font-jakarta-bold mb-1.5'>Last Worn: </Text>
                        <View className='bg-[#FF3E37]/20 rounded-full border-2 border-[#FF3E37] px-2 py-1'>
                          <Text className='text-[#FF3E37] font-jakarta-medium text-xs'>2 days ago</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text className='mt-2 ml-5 text-gray-500 font-jakarta-medium'>No bottoms found</Text>
        )}
      </View>

      <View className='flex-row gap-2 mt-4 mx-6'>
        <TouchableOpacity
          onPress={handleSelectPress}
          disabled={!selectedTopId || !selectedBottomId}
          className={`self-start py-1 px-3 rounded-lg flex-row gap-2 items-center ${selectedTopId && selectedBottomId ? 'bg-[#403F3F]' : 'bg-gray-400'
            }`}
        >
          <SelectButton width={14} height={14} />
          <Text className='font-jakarta-medium text-white text-lg'>Select</Text>
        </TouchableOpacity>
      </View>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedTop={selectedTop}
        selectedBottom={selectedBottom}
      />
    </View>
  );
}