import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { palette, type as typeScale } from '@/theme';
import { tap as hapticTap } from '@/lib/haptics';

type Variant = keyof typeof typeScale;
type Tone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'onBrand'
  | 'good'
  | 'warn'
  | 'alert';

const TONE_COLOR: Record<Tone, string> = {
  default: palette.text,
  secondary: palette.textSecondary,
  muted: palette.textMuted,
  brand: palette.blue,
  onBrand: palette.white,
  good: palette.good,
  warn: palette.warn,
  alert: palette.alert,
};

export interface TxtProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
  /** Override colour outright. */
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** The only text component in the app — never use bare <Text>. */
export function Txt({
  variant = 'body',
  tone = 'default',
  center,
  color,
  style,
  children,
  ...rest
}: TxtProps) {
  return (
    <Text
      {...rest}
      style={[
        typeScale[variant],
        { color: color ?? TONE_COLOR[tone] },
        center && styles.center,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export interface TapProps extends PressableProps {
  /** Scale-down feedback on press. Set false for full-width rows. */
  scaleTo?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pressable with a spring scale + light haptic. Use for every tappable surface. */
export function Tap({
  scaleTo = 0.97,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...rest
}: TapProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...rest}
        onPressIn={(e) => {
          animate(scaleTo);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          animate(1);
          onPressOut?.(e);
        }}
        onPress={(e) => {
          if (haptic) hapticTap();
          onPress?.(e);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function Spacer({ h = 0, w = 0 }: { h?: number; w?: number }) {
  return <View style={{ height: h, width: w }} />;
}

export function Row({
  gap = 0,
  align = 'center',
  justify = 'flex-start',
  wrap,
  style,
  children,
}: {
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
    width: '100%',
  },
});
