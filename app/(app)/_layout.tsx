// import { Stack } from 'expo-router';

// export default function AppLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Stack.Screen name="home" />
//     </Stack>
//   );
// }

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, DefaultTheme } from "styled-components/native";
import { Stack } from "expo-router";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      border: string;
      background: string;
      secondary: string;
      error: string;
    };
  }
}

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
