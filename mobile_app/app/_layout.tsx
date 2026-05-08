import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAuthenticated } from '@/services/authService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [isReady, setIsReady] = useState(false);

  // 🌟 FIX: This effect now runs every time the screen (segments) changes
  useEffect(() => {
    const verifyAuth = async () => {
      const loggedIn = await isAuthenticated(); // Read fresh token status
      const inAuthGroup = segments[0] === '(tabs)';

      if (!loggedIn && inAuthGroup) {
        // No token? Send to login
        router.replace('/login');
      } else if (loggedIn && segments[0] === 'login') {
        // Has token? Send to tabs
        router.replace('/(tabs)');
      }
      
      setIsReady(true);
    };

    verifyAuth();
  }, [segments]); // <--- Adding segments here is the magic trick

  if (!isReady) return null; 

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}