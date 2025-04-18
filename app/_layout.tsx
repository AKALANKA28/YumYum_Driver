import { useEffect } from "react";
import { ThemeProvider } from "styled-components/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Theme from "./src/theme/index";
import { AuthProvider } from "./src/context/AuthContext";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={Theme}>
        <StatusBar style="auto" backgroundColor="transparent" />

        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
