import React from 'react';
import { Stack } from 'expo-router';

/** The scan → analysing → results flow cross-fades; it should feel like one surface. */
export default function AnalysisLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
