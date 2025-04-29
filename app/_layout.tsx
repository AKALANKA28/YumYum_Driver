import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "styled-components/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import Theme from "./theme/index";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import SplashScreenController from "./components/SplashScreenController";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silent fail if splash screen can't be prevented from hiding
});

// Separate component to use context hooks
function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: "none"
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

// Main layout component that provides contexts
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={Theme}>
        <LoadingProvider>
          <AuthProvider>
            <SplashScreenController>
              <RootLayoutNav />
            </SplashScreenController>
          </AuthProvider>
        </LoadingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}