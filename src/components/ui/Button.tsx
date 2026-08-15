import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { gradients, palette, radius, shadow, spacing } from '@/theme';
import { Txt, Tap } from './primitives';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ionicons glyph name rendered before the label. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Ionicons glyph rendered after the label. */
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 38, md: 48, lg: 56 };
const PAD: Record<ButtonSize, number> = { sm: 14, md: 20, lg: 24 };
const ICON: Record<ButtonSize, number> = { sm: 15, md: 18, lg: 20 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  full = true,
  style,
}: ButtonProps) {
  const height = HEIGHT[size];
  const textTone =
    variant === 'primary' || variant === 'dark' || variant === 'danger'
      ? palette.white
      : variant === 'ghost'
        ? palette.blue
        : palette.blueDeep;

  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator size="small" color={textTone} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={ICON[size]} color={textTone} /> : null}
          <Txt variant={size === 'sm' ? 'label' : 'h4'} color={textTone}>
            {label}
          </Txt>
          {iconRight ? <Ionicons name={iconRight} size={ICON[size]} color={textTone} /> : null}
        </>
      )}
    </View>
  );

  const shell: StyleProp<ViewStyle> = [
    styles.base,
    { height, paddingHorizontal: PAD[size] },
    full && styles.full,
    disabled && styles.disabled,
    style,
  ];

  if (variant === 'primary' || variant === 'dark' || variant === 'danger') {
    const colors =
      variant === 'primary'
        ? gradients.action
        : variant === 'dark'
          ? gradients.premium
          : ([palette.alert, '#C74A36'] as const);
    return (
      <Tap onPress={onPress} disabled={disabled || loading} scaleTo={0.97} style={full && styles.full}>
        <LinearGradient
          colors={colors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[shell, !disabled && shadow.floating]}
        >
          {inner}
        </LinearGradient>
      </Tap>
    );
  }

  return (
    <Tap onPress={onPress} disabled={disabled || loading} scaleTo={0.97} style={full && styles.full}>
      <View style={[shell, variant === 'secondary' ? styles.secondary : styles.ghost]}>{inner}</View>
    </Tap>
  );
}

/** Circular icon-only button, used in headers and floating actions. */
export function IconButton({
  icon,
  onPress,
  size = 40,
  tone = 'surface',
  color,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  tone?: 'surface' | 'tint' | 'ghost' | 'brand';
  color?: string;
  badge?: boolean;
}) {
  const bg =
    tone === 'surface'
      ? palette.surface
      : tone === 'tint'
        ? palette.blueTint
        : tone === 'brand'
          ? palette.blue
          : 'transparent';
  const fg = color ?? (tone === 'brand' ? palette.white : palette.inkSoft);
  return (
    <Tap onPress={onPress} scaleTo={0.9}>
      <View
        style={[
          styles.iconBtn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderWidth: tone === 'surface' ? 1 : 0,
          },
        ]}
      >
        <Ionicons name={icon} size={size * 0.48} color={fg} />
        {badge ? <View style={styles.badgeDot} /> : null}
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch', width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondary: {
    backgroundColor: palette.blueTint,
    borderWidth: 1,
    borderColor: palette.blueTintStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: palette.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.alert,
    borderWidth: 1.5,
    borderColor: palette.surface,
  },
});
