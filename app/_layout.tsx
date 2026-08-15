import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { PhoneFrame } from '@/components/PhoneFrame';
import { LogoMark } from '@/components/brand/Logo';
import { AppProvider } from '@/store/AppStore';
import { palette } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <PhoneFrame>
            {fontsLoaded ? (
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: palette.canvas },
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen name="analysis" options={{ animation: 'fade' }} />
                <Stack.Screen name="derm" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="premium" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="notifications" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="shop" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="progress" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
              </Stack>
            ) : (
              <BootScreen />
            )}
          </PhoneFrame>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function BootScreen() {
  return (
    <View style={styles.boot}>
      <LogoMark size={72} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.canvas,
  },
});
