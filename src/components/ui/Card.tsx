import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { layout, palette, radius, shadow } from '@/theme';
import { Tap } from './primitives';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Inner padding. Pass 0 for edge-to-edge content. */
  padding?: number;
  /** Visual weight. */
  tone?: 'plain' | 'sunken' | 'tinted' | 'outline';
  elevation?: keyof typeof shadow;
  onPress?: () => void;
}

export function Card({
  children,
  style,
  padding = layout.cardPadding,
  tone = 'plain',
  elevation = 'card',
  onPress,
}: CardProps) {
  const body = (
    <View
      style={[
        styles.base,
        TONE[tone],
        shadow[elevation],
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return body;
  return (
    <Tap onPress={onPress} scaleTo={0.985}>
      {body}
    </Tap>
  );
}

/** Card with the brand gradient as its surface — used for hero / CTA blocks. */
export function GradientCard({
  children,
  colors,
  style,
  padding = layout.cardPadding,
  onPress,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: {
  children: React.ReactNode;
  colors: readonly string[];
  style?: StyleProp<ViewStyle>;
  padding?: number;
  onPress?: () => void;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}) {
  const body = (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={start}
      end={end}
      style={[styles.base, shadow.raised, { padding, borderWidth: 0 }, style]}
    >
      {children}
    </LinearGradient>
  );
  if (!onPress) return body;
  return (
    <Tap onPress={onPress} scaleTo={0.985}>
      {body}
    </Tap>
  );
}

const TONE: Record<NonNullable<CardProps['tone']>, ViewStyle> = {
  plain: { backgroundColor: palette.surface },
  sunken: { backgroundColor: palette.surfaceSunken, borderColor: 'transparent' },
  tinted: { backgroundColor: palette.blueTint, borderColor: palette.blueTintStrong },
  outline: { backgroundColor: palette.surface, borderColor: palette.borderStrong },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
});
