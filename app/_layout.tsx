import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerTitle: "",}}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="userRegistration" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
