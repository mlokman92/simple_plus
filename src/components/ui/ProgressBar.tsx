import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius } from '@/theme';

/** Animated horizontal meter. `value` is 0-1. */
export function ProgressBar({
  value,
  height = 8,
  color = palette.blue,
  track = palette.surfaceSunken,
  style,
  animate = true,
}: {
  value: number;
  height?: number;
  color?: string;
  track?: string;
  style?: StyleProp<ViewStyle>;
  animate?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const w = useRef(new Animated.Value(animate ? 0 : clamped)).current;

  useEffect(() => {
    if (!animate) {
      w.setValue(clamped);
      return;
    }
    Animated.timing(w, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [clamped, animate, w]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }, style]}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color,
          width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

/** Segmented step indicator for the onboarding flow. */
export function StepDots({
  total,
  index,
  style,
}: {
  total: number;
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.dots, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index && styles.dotActive,
            i < index && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: palette.borderStrong,
  },
  dotActive: { width: 22, backgroundColor: palette.blue },
  dotDone: { backgroundColor: palette.greenBright },
});
