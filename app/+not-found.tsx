import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { LogoMark } from '@/components/brand/Logo';
import { Button, Screen, Txt } from '@/components/ui';
import { spacing } from '@/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <LogoMark size={64} />
        <Txt variant="h2" center>
          This page slipped out of the routine
        </Txt>
        <Txt variant="body" tone="secondary" center style={{ maxWidth: 280 }}>
          We could not find that screen. Let us get you back to your skin.
        </Txt>
        <Button
          label="Back to Home"
          icon="home-outline"
          full={false}
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </Screen>
  );
}
