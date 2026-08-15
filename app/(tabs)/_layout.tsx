import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { gradients, palette, radius, shadow, spacing } from '@/theme';
import { useInsets } from '@/lib/frame';
import { tap as hapticTap } from '@/lib/haptics';
import { Tap, Txt } from '@/components/ui';

type TabDef = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  { name: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'routine', label: 'Routine', icon: 'list-outline', iconActive: 'list' },
  { name: 'scan', label: 'Scan', icon: 'scan-outline', iconActive: 'scan' },
  { name: 'insights', label: 'Insights', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SimpleTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}

function SimpleTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}
      pointerEvents="box-none"
    >
      {/* Dissolves scrolling content into the canvas behind the floating bar. */}
      <LinearGradient
        colors={['rgba(238,246,254,0)', palette.canvas]}
        style={styles.scrim}
        pointerEvents="none"
      />
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const def = TABS.find((t) => t.name === route.name);
          if (!def) return null;
          const focused = state.index === index;
          const isScan = def.name === 'scan';

          const onPress = () => {
            hapticTap();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Every column ends with a label of the same line height and the row
          // is bottom-aligned, so the labels sit on one line no matter how tall
          // the content above them is.
          if (isScan) {
            return (
              <View key={route.key} style={styles.item}>
                <Tap
                  onPress={onPress}
                  haptic={false}
                  scaleTo={0.9}
                  hitSlop={{ top: 26, bottom: 4, left: 4, right: 4 }}
                >
                  <View style={styles.column}>
                    <LinearGradient
                      colors={gradients.action as unknown as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.scanButton, shadow.floating]}
                    >
                      <Ionicons name="scan" size={24} color={palette.white} />
                    </LinearGradient>
                    <Txt variant="micro" tone="muted" style={styles.scanLabel}>
                      SCAN
                    </Txt>
                  </View>
                </Tap>
              </View>
            );
          }

          return (
            <View key={route.key} style={styles.item}>
              <Tap onPress={onPress} haptic={false} scaleTo={0.92}>
                <View style={styles.column}>
                  <View style={styles.iconSlot}>
                    <Ionicons
                      name={focused ? def.iconActive : def.icon}
                      size={21}
                      color={focused ? palette.blue : palette.textMuted}
                    />
                  </View>
                  <Txt
                    variant="micro"
                    color={focused ? palette.blue : palette.textMuted}
                    style={styles.label}
                  >
                    {def.label}
                  </Txt>
                  {focused ? <View style={styles.activeDot} /> : null}
                </View>
              </Tap>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: -26,
  },
  bar: {
    flexDirection: 'row',
    // Bottom-aligned so every tab label lands on the same line — the scan
    // column is taller than the rest and would otherwise centre differently.
    alignItems: 'flex-end',
    backgroundColor: palette.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    ...Platform.select({
      web: { boxShadow: '0 12px 30px rgba(11,37,69,0.10)' } as object,
      default: shadow.raised,
    }),
  },
  item: { flex: 1, alignItems: 'center' },
  column: { alignItems: 'center', gap: 4 },
  /** Fixed box so glyphs with different intrinsic heights still line up. */
  iconSlot: { height: 22, alignItems: 'center', justifyContent: 'center' },
  label: { letterSpacing: 0.2 },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.blue,
  },
  scanButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    // Negative margin lifts the button clear of the bar without making the
    // column taller, so the SCAN label stays level with its neighbours.
    marginTop: -26,
    borderWidth: 4,
    borderColor: palette.surface,
  },
  scanLabel: { letterSpacing: 0.6 },
});
