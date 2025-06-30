// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      {/* 1. Onboarding 1 */}
      <Stack.Screen
        name="Onboarding1"
        options={{
          headerShown: false,
        }}
      />

      {/* 2. Onboarding 2 */}
      <Stack.Screen
        name="Onboarding2"
        options={{
          headerShown: false,
        }}
      />

      {/* 3. Onboarding 3 */}
      <Stack.Screen
        name="Onboarding3"
        options={{
          headerShown: false,
        }}
      />

      {/* 4. Login */}
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      {/* 5. Setelah login → tab utama */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
