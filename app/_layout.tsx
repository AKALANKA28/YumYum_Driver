import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import theme from './src/theme';
import { AuthProvider } from './src/context/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}