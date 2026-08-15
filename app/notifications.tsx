import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import {
  AppHeader,
  Badge,
  Button,
  Card,
  Row,
  Screen,
  Spacer,
  Tap,
  Txt,
} from '@/components/ui';
import { palette, radius, spacing } from '@/theme';

type Group = 'Today' | 'This week' | 'Earlier';

interface Noti {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  fg: string;
  bg: string;
  title: string;
  body: string;
  time: string;
  group: Group;
  href: Href;
  unread: boolean;
  /** Optional tag rendered next to the title. */
  tag?: string;
}

const GROUPS: Group[] = ['Today', 'This week', 'Earlier'];

const SEED: Noti[] = [
  {
    id: 'n-score',
    icon: 'trending-up',
    fg: palette.good,
    bg: palette.goodTint,
    title: 'Your skin score went up 6 points',
    body: '82/100 — your best yet. Hydration did most of the lifting, +8 in seven days.',
    time: '2h ago',
    group: 'Today',
    href: '/(tabs)/insights',
    unread: true,
  },
  {
    id: 'n-uv',
    icon: 'sunny',
    fg: palette.warn,
    bg: palette.warnTint,
    title: 'UV 11 — extreme in Kuala Lumpur',
    body: 'Peaks at 1:00 PM and holds until 3. Reapply SPF50+ before you head out for lunch.',
    time: '4h ago',
    group: 'Today',
    href: '/(tabs)/routine',
    unread: true,
    tag: 'Alert',
  },
  {
    id: 'n-pm',
    icon: 'moon',
    fg: palette.evenness,
    bg: palette.surfaceSunken,
    title: 'Your PM routine is still open',
    body: '4 steps, about 2 minutes. Ticking it tonight keeps your 14-day streak alive.',
    time: '6h ago',
    group: 'Today',
    href: '/(tabs)/routine',
    unread: true,
  },
  {
    id: 'n-derm',
    icon: 'chatbubble-ellipses',
    fg: palette.blue,
    bg: palette.blueTint,
    title: 'Your Digital Dermatologist replied',
    body: '"Why did I break out this week?" — humidity hit 88% on Tuesday and Wednesday. Read the full reply.',
    time: '9h ago',
    group: 'Today',
    href: '/derm',
    unread: true,
  },
  {
    id: 'n-scan',
    icon: 'scan',
    fg: palette.blue,
    bg: palette.blueTint,
    title: 'Weekly scan is due',
    body: 'Your last scan was Monday 10 Aug. Same time, same light — that is what keeps the trend honest.',
    time: '2d ago',
    group: 'This week',
    href: '/(tabs)/scan',
    unread: true,
  },
  {
    id: 'n-achieve',
    icon: 'trophy',
    fg: palette.warn,
    bg: palette.warnTint,
    title: 'Achievement unlocked — Score 80+',
    body: 'You crossed 80 for the first time on the 10 Aug scan. Next up: the 90 Club, 8 points away.',
    time: '2d ago',
    group: 'This week',
    href: '/(tabs)/insights',
    unread: false,
  },
  {
    id: 'n-vitc',
    icon: 'lock-open',
    fg: palette.texture,
    bg: palette.surfaceSunken,
    title: 'Vitamin C unlocks in 8 days',
    body: 'Your barrier has held above 80 for 6 days straight. Eight more at that level and Stabilised Vitamin C 12% joins your AM.',
    time: '3d ago',
    group: 'This week',
    href: '/(tabs)/routine',
    unread: false,
  },
  {
    id: 'n-restock',
    icon: 'cube',
    fg: palette.green,
    bg: palette.greenTint,
    title: 'Your sunscreen is running low',
    body: 'Invisible Fluid SPF50+ is roughly 12 days from empty at your usage. RM75 at Watsons and Guardian.',
    time: '5d ago',
    group: 'This week',
    href: '/shop',
    unread: false,
  },
  {
    id: 'n-premium',
    icon: 'sparkles',
    fg: palette.white,
    bg: palette.inkSoft,
    title: '7 days of Premium, on us',
    body: 'Unlimited scans, a video consult with a licensed dermatologist, and the ingredient conflict checker. No card needed for the trial.',
    time: '1w ago',
    group: 'Earlier',
    href: '/premium',
    unread: false,
    tag: 'Offer',
  },
  {
    id: 'n-sleep',
    icon: 'bulb',
    fg: palette.blueDeep,
    bg: palette.blueTint,
    title: 'New insight: sleep is moving your score',
    body: 'Weeks where you logged 7+ hours averaged 4.2 points higher than weeks at 6 or less. Worth protecting.',
    time: '1w ago',
    group: 'Earlier',
    href: '/(tabs)/insights',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Noti[]>(SEED);

  const unread = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const markAllRead = () => setItems((cur) => cur.map((n) => ({ ...n, unread: false })));
  const clearAll = () => setItems([]);
  const restore = () => setItems(SEED);

  const open = (n: Noti) => {
    setItems((cur) => cur.map((i) => (i.id === n.id ? { ...i, unread: false } : i)));
    router.push(n.href);
  };

  const grouped = useMemo(
    () => GROUPS.map((g) => ({ group: g, rows: items.filter((n) => n.group === g) })),
    [items],
  );

  let position = 0;

  return (
    <Screen
      padBottom={56}
      header={
        <AppHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
          right={
            items.length > 0 && unread > 0 ? (
              <Tap onPress={markAllRead} scaleTo={0.94}>
                <Row gap={4} style={styles.headerAction}>
                  <Ionicons name="checkmark-done" size={13} color={palette.blue} />
                  <Txt variant="micro" tone="brand">
                    MARK ALL
                  </Txt>
                </Row>
              </Tap>
            ) : null
          }
        />
      }
    >
      {items.length === 0 ? (
        <EmptyState onRestore={restore} />
      ) : (
        <>
          {grouped.map(({ group, rows }) =>
            rows.length === 0 ? null : (
              <View key={group}>
                <Row justify="space-between" style={styles.groupHead}>
                  <Txt variant="micro" tone="muted">
                    {group.toUpperCase()}
                  </Txt>
                  <Txt variant="micro" tone="muted">
                    {rows.length}
                  </Txt>
                </Row>
                <View style={styles.stack}>
                  {rows.map((n) => {
                    const delay = position * 55;
                    position += 1;
                    return <NotiRow key={n.id} noti={n} delay={delay} onPress={() => open(n)} />;
                  })}
                </View>
                <Spacer h={spacing.xl} />
              </View>
            ),
          )}

          <Card tone="sunken" elevation="none" padding={spacing.lg}>
            <Row gap={spacing.md} align="center">
              <Ionicons name="notifications-outline" size={16} color={palette.textMuted} />
              <Txt variant="caption" tone="secondary" style={styles.flex}>
                Quiet hours are on from 11:00 PM to 7:00 AM. UV alerts for Kuala Lumpur always come
                through.
              </Txt>
            </Row>
          </Card>

          <Spacer h={spacing.lg} />
          <Button label="Clear all" variant="ghost" size="sm" icon="trash-outline" onPress={clearAll} />
        </>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------------ */
/* Local pieces                                                              */
/* ------------------------------------------------------------------------ */

function NotiRow({
  noti,
  delay,
  onPress,
}: {
  noti: Noti;
  delay: number;
  onPress: () => void;
}) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);

  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      <Card
        onPress={onPress}
        padding={spacing.md + 2}
        style={noti.unread ? styles.unreadCard : styles.readCard}
      >
        <Row gap={spacing.md} align="flex-start">
          <View style={[styles.iconChip, { backgroundColor: noti.bg }]}>
            <Ionicons name={noti.icon} size={17} color={noti.fg} />
          </View>

          <View style={styles.flex}>
            <Row justify="space-between" align="flex-start" gap={spacing.sm}>
              <Txt
                variant={noti.unread ? 'bodyStrong' : 'bodySm'}
                tone={noti.unread ? 'default' : 'secondary'}
                style={styles.flex}
              >
                {noti.title}
              </Txt>
              <Row gap={5}>
                {noti.unread ? <View style={styles.dot} /> : null}
                <Txt variant="micro" tone="muted">
                  {noti.time}
                </Txt>
              </Row>
            </Row>

            <Txt variant="caption" tone={noti.unread ? 'secondary' : 'muted'} style={styles.body}>
              {noti.body}
            </Txt>

            {noti.tag ? (
              <View style={styles.tagRow}>
                <Badge
                  label={noti.tag}
                  tone={noti.tag === 'Alert' ? 'warn' : 'premium'}
                  icon={noti.tag === 'Alert' ? 'warning-outline' : 'sparkles'}
                />
              </View>
            ) : null}
          </View>
        </Row>
      </Card>
    </Animated.View>
  );
}

function EmptyState({ onRestore }: { onRestore: () => void }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a]);

  return (
    <Animated.View
      style={[
        styles.empty,
        {
          opacity: a,
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
        },
      ]}
    >
      <View style={styles.emptyIcon}>
        <Ionicons name="notifications-off-outline" size={26} color={palette.blue} />
      </View>
      <Spacer h={spacing.lg} />
      <Txt variant="h3" center>
        Inbox clear
      </Txt>
      <Txt variant="bodySm" tone="secondary" center style={styles.emptyBody}>
        Nothing waiting on you. Score changes, Kuala Lumpur UV alerts, routine nudges, and restock
        reminders land here.
      </Txt>
      <Spacer h={spacing.xl} />
      <Button
        label="Restore demo notifications"
        variant="secondary"
        size="sm"
        icon="refresh-outline"
        full={false}
        onPress={onRestore}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.sm + 2 },
  headerAction: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: palette.blueTint,
  },
  groupHead: { marginBottom: spacing.sm, paddingHorizontal: spacing.xs },

  unreadCard: { borderColor: palette.blueTintStrong },
  readCard: { backgroundColor: palette.canvasSoft, borderColor: palette.border },

  iconChip: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.blue,
  },
  body: { marginTop: 2 },
  tagRow: { marginTop: spacing.sm },

  empty: { alignItems: 'center', paddingTop: spacing.giant, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBody: { marginTop: spacing.sm },
});
