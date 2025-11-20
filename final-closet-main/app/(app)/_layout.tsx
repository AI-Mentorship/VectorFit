import { Redirect, Tabs, useRouter } from 'expo-router';
import { useSession } from '../ctx';
import { View, Platform, Pressable, Text } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from '../../assets/NavBar/Home.svg';
import ClosetIcon from '../../assets/NavBar/Closet.svg';
import ChatIcon from '../../assets/NavBar/Chat.svg';
import SettingsIcon from '../../assets/NavBar/Settings.svg';
import AddIcon from '../../assets/NavBar/Add.svg';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);

  if (isLoading) {
    return <View />;
  }
  if (!session) {
    return <Redirect href="/get-started" />;
  }
  const handleAddPress = () => {
    router.push('/(app)/add');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5E5',
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            paddingHorizontal: 5,
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#000000',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <HomeIcon width={24} height={24} style={{ opacity: focused ? 1 : 0.4 }} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text className={`text-xs font-jakarta-medium text-black ${focused ? 'opacity-100' : 'opacity-40'}`}>
                Home
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="closet"
          options={{
            title: 'Closet',
            tabBarIcon: ({ focused }) => (
              <ClosetIcon width={24} height={24} style={{ opacity: focused ? 1 : 0.4 }} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text className={`text-xs font-jakarta-medium text-black ${focused ? 'opacity-100' : 'opacity-40'}`}>
                Closet
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Pressable
                  onPress={handleAddPress}
                  style={{
                    position: 'absolute',
                    bottom: 15,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: '#000000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                  }}
                >
                  <AddIcon width={28} height={28} />
                </Pressable>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ focused }) => (
              <ChatIcon width={24} height={24} style={{ opacity: focused ? 1 : 0.4 }} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text className={`text-xs font-jakarta-medium text-black ${focused ? 'opacity-100' : 'opacity-40'}`}>
                Chat
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => (
              <SettingsIcon width={24} height={24} style={{ opacity: focused ? 1 : 0.4 }} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text className={`text-xs font-jakarta-medium text-black ${focused ? 'opacity-100' : 'opacity-40'}`}>
                Settings
              </Text>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
