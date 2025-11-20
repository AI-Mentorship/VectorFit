import React, { createContext, useContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from './useStorageState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, signUpUser, getUserProfile, type LoginCredentials, type SignUpData, type AuthResponse } from '../utils/api';

interface AuthContextType {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  user?: any;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[, user], setUser] = useStorageState('user');

  // Fetch and cache user profile
  const fetchAndCacheUserProfile = async (token: string) => {
    try {
      console.log('Fetching user profile');
      const profile = await getUserProfile(token);
      console.log('User profile fetched:', profile);
      setUser(JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Sign in with credentials
  const signIn = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await loginUser(credentials);
      setSession(response.token);
      await fetchAndCacheUserProfile(response.token);
      console.log('Login successful');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign up new user
  const signUp = async (userData: SignUpData) => {
    try {
      const response: AuthResponse = await signUpUser(userData);
      setSession(response.token);
      await fetchAndCacheUserProfile(response.token);
      console.log('Signup successful');
    } catch (error) {
      console.error('Sign up error in ctx:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (session && !user && !isLoading) {
      fetchAndCacheUserProfile(session);
    }
  }, [session, user, isLoading]);

  // Sign out - clear everything
  const signOut = async () => {
    setSession(null);
    setUser(null);
    await AsyncStorage.multiRemove(['user']);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        session,
        isLoading,
        user: user ? JSON.parse(user) : null,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
