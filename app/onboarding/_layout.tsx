import React from 'react';
import { Stack } from 'expo-router';

import { palette } from '@/theme';

/** Onboarding is its own stack so the four steps slide over each other. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: palette.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="concerns" />
      <Stack.Screen name="skin-type" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen
        name="analyzing"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
    </Stack>
  );
}
