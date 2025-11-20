import { Redirect } from 'expo-router';
import { useSession } from './ctx';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { session, isLoading } = useSession();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    const onboardingComplete = await AsyncStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(onboardingComplete === 'true');
  };

  // Show loading while initial checks are running
  if (isLoading || hasSeenOnboarding === null) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  // Redirect logic
  if (session) {
    console.log('✅ Session valid - redirecting to app');
    return <Redirect href={'/(app)' as any} />;
  }

  if (!hasSeenOnboarding) {
    console.log('📋 No onboarding - redirecting to get-started');
    return <Redirect href="/get-started" />;
  }

  console.log('🔓 No session - redirecting to login');
  return <Redirect href="/login" />;
}
