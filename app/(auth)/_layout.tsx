import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="vehicle-info" />
      <Stack.Screen name="document-upload" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}