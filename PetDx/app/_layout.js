import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { initDatabase, prepopulateBreeds, prepopulateDiseases } from '../utils/database';

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="result" options={{ presentation: 'modal' }} />
      <Stack.Screen name="breed-details" />
      <Stack.Screen name="disease-details" />
    </Stack>
  );
}

function AppInitializer({ children }) {
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await prepopulateBreeds();
        await prepopulateDiseases();
      } catch (error) {
        console.error('Database setup failed:', error);
      }
    };

    setup();
  }, []);

  return children;
}

export default function Layout() {
  return (
    <AuthProvider>
      <AppInitializer>
        <RootLayoutNav />
      </AppInitializer>
    </AuthProvider>
  );
}