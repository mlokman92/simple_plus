import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing } from '@/theme';
import { Txt, Tap } from './primitives';

/** Small selectable pill — onboarding chips, filters, quick prompts. */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  emoji,
  style,
  tone = 'default',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'brand';
}) {
  const active = !!selected;
  const body = (
    <View
      style={[
        styles.chip,
        active
          ? tone === 'brand'
            ? styles.chipBrand
            : styles.chipActive
          : styles.chipIdle,
        style,
      ]}
    >
      {emoji ? <Txt variant="bodySm">{emoji}</Txt> : null}
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? palette.white : palette.textSecondary}
        />
      ) : null}
      <Txt variant="label" color={active ? palette.white : palette.inkSoft}>
        {label}
      </Txt>
    </View>
  );
  if (!onPress) return body;
  return (
    <Tap onPress={onPress} scaleTo={0.94}>
      {body}
    </Tap>
  );
}

type BadgeTone = 'neutral' | 'good' | 'warn' | 'alert' | 'brand' | 'premium' | 'halal';

const BADGE: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: palette.surfaceSunken, fg: palette.textSecondary },
  good: { bg: palette.goodTint, fg: palette.good },
  warn: { bg: palette.warnTint, fg: palette.warn },
  alert: { bg: palette.alertTint, fg: palette.alert },
  brand: { bg: palette.blueTint, fg: palette.blueDeep },
  premium: { bg: '#12335C', fg: '#FFFFFF' },
  halal: { bg: palette.greenTint, fg: palette.green },
};

/** Static status label. */
export function Badge({
  label,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const c = BADGE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      {icon ? <Ionicons name={icon} size={11} color={c.fg} /> : null}
      <Txt variant="micro" color={c.fg}>
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

/** Delta pill: "+6" in green, "-3" in red. */
export function DeltaPill({ value, suffix = '' }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: up ? palette.goodTint : palette.alertTint, paddingHorizontal: 7 },
      ]}
    >
      <Ionicons
        name={up ? 'trending-up' : 'trending-down'}
        size={11}
        color={up ? palette.good : palette.alert}
      />
      <Txt variant="micro" color={up ? palette.good : palette.alert}>
        {up ? '+' : ''}
        {value}
        {suffix}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    height: 36,
    borderRadius: radius.round,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: palette.surface,
    borderColor: palette.borderStrong,
  },
  chipActive: {
    backgroundColor: palette.blue,
    borderColor: palette.blue,
  },
  chipBrand: {
    backgroundColor: palette.green,
    borderColor: palette.green,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.round,
    alignSelf: 'flex-start',
  },
});
