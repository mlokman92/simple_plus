import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { gradients, layout, palette, spacing } from '@/theme';
import { useInsets } from '@/lib/frame';
import { Txt, Row } from './primitives';
import { IconButton } from './Button';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap children in a ScrollView. Turn off for chat / camera screens. */
  scroll?: boolean;
  /** Extra bottom padding so content clears the tab bar. */
  padBottom?: number;
  /** Horizontal gutter. */
  gutter?: number;
  /** Skip the top safe-area inset (screens that draw their own hero). */
  edgeToEdge?: boolean;
  background?: readonly string[];
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
  header?: React.ReactNode;
}

export function Screen({
  children,
  scroll = true,
  padBottom = spacing.huge,
  gutter = layout.screenPadding,
  edgeToEdge = false,
  background = gradients.canvas,
  contentStyle,
  scrollProps,
  header,
}: ScreenProps) {
  const insets = useInsets();
  const top = edgeToEdge ? 0 : insets.top;

  const inner = (
    <View style={[{ paddingHorizontal: gutter, flexGrow: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={background as [string, string, ...string[]]}
      style={styles.fill}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.fill, { paddingTop: top }]}>
        {header}
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: padBottom + insets.bottom, flexGrow: 1 }}
            {...scrollProps}
          >
            {inner}
          </ScrollView>
        ) : (
          <View style={[styles.fill, { paddingBottom: insets.bottom }]}>{inner}</View>
        )}
      </View>
    </LinearGradient>
  );
}

/** Standard nav bar: back chevron, title, optional right slot. */
export function AppHeader({
  title,
  subtitle,
  right,
  onBack,
  showBack = true,
  transparent = true,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  transparent?: boolean;
}) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')));
  return (
    <View
      style={[
        styles.header,
        !transparent && { backgroundColor: palette.surface, borderBottomWidth: 1 },
      ]}
    >
      <View style={styles.headerSide}>
        {showBack ? <IconButton icon="chevron-back" onPress={back} size={38} /> : null}
      </View>
      <View style={styles.headerCenter}>
        {title ? (
          <Txt variant="h4" center numberOfLines={1}>
            {title}
          </Txt>
        ) : null}
        {subtitle ? (
          <Txt variant="caption" tone="muted" center numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

/** "Your Daily Routine   View all" row. */
export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Row justify="space-between" style={[{ marginBottom: spacing.md }, style]}>
      <Txt variant="h3">{title}</Txt>
      {action ? (
        <Txt variant="label" tone="brand" onPress={onAction} suppressHighlighting>
          {action}
        </Txt>
      ) : null}
    </Row>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: palette.border,
    minHeight: 54,
  },
  headerSide: { width: 56, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
});
