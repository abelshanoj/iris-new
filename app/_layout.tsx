// _layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { AudioProvider } from "@/context/AudioContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AudioProvider>
        <Stack
          initialRouteName="index" // Change initial route to "login"
          screenOptions={{
            headerShown: false,
          }}
        />
      </AudioProvider>
    </GestureHandlerRootView>
  );
}
