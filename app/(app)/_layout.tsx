import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { DriverContextProvider } from "../context/DriverContext";
import { useLoading } from "../context/LoadingContext";
import * as SplashScreen from "expo-splash-screen";

// Flag to track if we've already hidden the splash screen
let splashHidden = false;

export default function AppLayout() {
  const { isLoading } = useLoading();

  // Handle splash screen visibility based on loading state
  useEffect(() => {
    if (!isLoading && !splashHidden) {
      // Only try to hide the splash screen once
      splashHidden = true;
      
      // Hide the splash screen - this should only happen when map is ready
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  return (
    <DriverContextProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="navigation" options={{ headerShown: false }} />
      </Stack>
    </DriverContextProvider>
  );
}