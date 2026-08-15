import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, IconButton, Row, Screen, StepDots, Txt } from '@/components/ui';
import { ENVIRONMENT } from '@/data/user';
import * as haptics from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';

type Level = 'low' | 'medium' | 'high';

const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9] as const;
const GLASSES = 8;

const LEVELS: { key: Level; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

const LEVEL_LABEL = Object.fromEntries(
  LEVELS.map((l) => [l.key, l.label]),
) as Record<Level, string>;

const LEVEL_COLOR: Record<Level, string> = {
  low: palette.good,
  medium: palette.warn,
  high: palette.alert,
};

function sleepReadout(hours: number): string {
  if (hours <= 5) return 'Under six hours roughly doubles overnight water loss. We will schedule a richer night step.';
  if (hours === 6) return 'Six hours is where most stress breakouts start — barrier repair peaks between 11 PM and 3 AM.';
  if (hours === 7) return 'Seven hours covers a full barrier repair cycle. Keep it there.';
  return 'Eight or more hours gives your barrier a complete repair cycle. It shows up in texture first.';
}

function waterReadout(glasses: number): string {
  if (glasses <= 3) return `At ${ENVIRONMENT.temperature}°C in ${ENVIRONMENT.city} you are losing far more than you take in. Hydration scores follow.`;
  if (glasses <= 5) return 'Close. Two more glasses a day typically lifts hydration by a few points within a month.';
  if (glasses <= 7) return 'Solid intake. Pair it with a humectant toner and hydration holds through the afternoon.';
  return 'Well hydrated — plumper skin, fewer tight patches by evening.';
}

const STRESS_READOUT: Record<Level, string> = {
  low: 'Low cortisol keeps sebum steady. Your routine can stay simple.',
  medium: 'Medium stress nudges oil up around the jaw and chin — the most common breakout map we see.',
  high: 'High cortisol raises sebum and slows healing. We will keep actives gentle and add a calming step.',
};

const SUN_READOUT: Record<Level, string> = {
  low: 'Mostly indoors — still SPF 50 every morning. UVA passes straight through office glass.',
  medium: 'A commute plus lunch outside is enough UV to undo a month of evenness gains.',
  high: `Heavy exposure at UV ${ENVIRONMENT.uvIndex}. Reapplying at 1 PM is the single biggest lever you have.`,
};

export default function LifestyleStep() {
  const router = useRouter();
  const { profile, dispatch } = useApp();

  const [sleep, setSleep] = useState<number>(profile.lifestyle.sleepHours);
  const [water, setWater] = useState<number>(profile.lifestyle.waterGlasses);
  const [stress, setStress] = useState<Level>(profile.lifestyle.stress);
  const [sun, setSun] = useState<Level>(profile.lifestyle.sunExposure);

  const onBuild = useCallback(() => {
    dispatch({
      type: 'setLifestyle',
      lifestyle: {
        sleepHours: sleep,
        waterGlasses: water,
        stress,
        sunExposure: sun,
      },
    });
    router.push('/onboarding/analyzing');
  }, [dispatch, router, sleep, stress, sun, water]);

  return (
    <Screen scroll={false} gutter={0} header={<StepHeader />}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <FadeSlide delay={0}>
          <Txt variant="micro" tone="brand" style={styles.eyebrow}>
            STEP 4 OF 4 · LIFESTYLE
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm }}>
            A few things that move your skin
          </Txt>
          <Txt variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
            These four inputs explain most week-to-week swings in your score. We re-check them
            every month.
          </Txt>
        </FadeSlide>

        {/* Sleep -------------------------------------------------------- */}
        <FadeSlide delay={90} style={{ marginTop: spacing.xl }}>
          <Card padding={spacing.lg}>
            <BlockHead
              icon="moon-outline"
              title="Sleep"
              value={`${sleep === 9 ? '9+' : sleep} hrs`}
              tint={palette.texture}
            />
            <Row gap={spacing.sm} style={{ marginTop: spacing.md }}>
              {SLEEP_OPTIONS.map((h) => {
                const active = sleep === h;
                return (
                  <Pressable
                    key={h}
                    onPress={() => {
                      haptics.select();
                      setSleep(h);
                    }}
                    style={({ pressed }) => [
                      styles.pill,
                      active ? styles.pillOn : styles.pillOff,
                      pressed && !active && styles.pressed,
                    ]}
                  >
                    <Txt
                      variant="bodyStrong"
                      color={active ? palette.white : palette.inkSoft}
                    >
                      {h === 9 ? '9+' : h}
                    </Txt>
                  </Pressable>
                );
              })}
            </Row>
            <Readout text={sleepReadout(sleep)} />
          </Card>
        </FadeSlide>

        {/* Water -------------------------------------------------------- */}
        <FadeSlide delay={160} style={{ marginTop: spacing.md }}>
          <Card padding={spacing.lg}>
            <BlockHead
              icon="water-outline"
              title="Water"
              value={`${water} ${water === 1 ? 'glass' : 'glasses'}`}
              tint={palette.hydration}
            />
            <Row gap={spacing.xs} style={{ marginTop: spacing.md }}>
              {Array.from({ length: GLASSES }).map((_, i) => {
                const filled = i < water;
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      haptics.select();
                      setWater(i + 1);
                    }}
                    style={({ pressed }) => [
                      styles.glass,
                      filled ? styles.glassOn : styles.glassOff,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={filled ? 'water' : 'water-outline'}
                      size={17}
                      color={filled ? palette.white : palette.textMuted}
                    />
                  </Pressable>
                );
              })}
            </Row>
            <Readout text={waterReadout(water)} />
          </Card>
        </FadeSlide>

        {/* Stress ------------------------------------------------------- */}
        <FadeSlide delay={230} style={{ marginTop: spacing.md }}>
          <Card padding={spacing.lg}>
            <BlockHead
              icon="pulse-outline"
              title="Stress"
              value={LEVEL_LABEL[stress]}
              tint={LEVEL_COLOR[stress]}
            />
            <Segmented value={stress} onChange={setStress} />
            <Readout text={STRESS_READOUT[stress]} />
          </Card>
        </FadeSlide>

        {/* Sun ---------------------------------------------------------- */}
        <FadeSlide delay={300} style={{ marginTop: spacing.md }}>
          <Card padding={spacing.lg}>
            <BlockHead
              icon="sunny-outline"
              title="Sun exposure"
              value={LEVEL_LABEL[sun]}
              tint={LEVEL_COLOR[sun]}
            />
            <Segmented value={sun} onChange={setSun} />
            <View style={styles.uvNote}>
              <Ionicons name="alert-circle-outline" size={13} color={palette.warn} />
              <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
                Kuala Lumpur sits at UV 10–12 most days — "low" here still means SPF 50 every
                single morning.
              </Txt>
            </View>
            <Readout text={SUN_READOUT[sun]} />
          </Card>
        </FadeSlide>

        <Row gap={6} justify="center" style={{ marginTop: spacing.lg }}>
          <Ionicons name="refresh-outline" size={12} color={palette.textMuted} />
          <Txt variant="micro" tone="muted">
            WE ASK AGAIN EVERY 30 DAYS · SKIN CHANGES, SO SHOULD THE PLAN
          </Txt>
        </Row>
      </ScrollView>

      <View style={styles.footer}>
        <Row justify="space-between" style={{ marginBottom: spacing.md }}>
          <Txt variant="caption" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
            {sleep === 9 ? '9+' : sleep} hrs sleep · {water} glasses · {LEVEL_LABEL[stress]} stress
            · {LEVEL_LABEL[sun]} sun
          </Txt>
          <Txt variant="caption" tone="muted">
            Step 4 of 4
          </Txt>
        </Row>
        <Button label="Build my profile" size="lg" icon="sparkles" onPress={onBuild} />
      </View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ *
 * Local pieces
 * ------------------------------------------------------------------ */

function BlockHead({
  icon,
  title,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  tint: string;
}) {
  return (
    <Row justify="space-between">
      <Row gap={spacing.sm}>
        <View style={[styles.blockIcon, { backgroundColor: `${tint}1A` }]}>
          <Ionicons name={icon} size={15} color={tint} />
        </View>
        <Txt variant="h4">{title}</Txt>
      </Row>
      <Txt variant="label" color={tint}>
        {value}
      </Txt>
    </Row>
  );
}

function Readout({ text }: { text: string }) {
  return (
    <Txt variant="caption" tone="muted" style={{ marginTop: spacing.md }}>
      {text}
    </Txt>
  );
}

/** Three-way segmented control with a spring-loaded thumb. No third-party sliders. */
function Segmented({
  value,
  onChange,
}: {
  value: Level;
  onChange: (next: Level) => void;
}) {
  const [trackW, setTrackW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const index = Math.max(0, LEVELS.findIndex((l) => l.key === value));
  const segW = trackW > 0 ? (trackW - 8) / LEVELS.length : 0;

  useEffect(() => {
    const anim = Animated.spring(x, {
      toValue: index * segW,
      useNativeDriver: true,
      speed: 18,
      bounciness: 7,
    });
    anim.start();
    return () => anim.stop();
  }, [index, segW, x]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackW((prev) => (prev === w ? prev : w));
  }, []);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {segW > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            {
              width: segW,
              backgroundColor: LEVEL_COLOR[value],
              transform: [{ translateX: x }],
            },
          ]}
        />
      ) : null}
      {LEVELS.map((level) => {
        const active = level.key === value;
        return (
          <Pressable
            key={level.key}
            onPress={() => {
              haptics.select();
              onChange(level.key);
            }}
            style={styles.segment}
          >
            <Txt variant="label" color={active ? palette.white : palette.textSecondary}>
              {level.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function StepHeader() {
  const router = useRouter();
  return (
    <Row justify="space-between" style={styles.header}>
      <IconButton
        icon="chevron-back"
        size={38}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/onboarding/goals'))}
      />
      <StepDots total={4} index={3} />
      <View style={{ width: 38 }} />
    </Row>
  );
}

function FadeSlide({
  delay,
  children,
  style,
}: {
  delay: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(a, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [a, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  scroll: { flex: 1 },
  scrollBody: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  eyebrow: { letterSpacing: 1.1 },
  blockIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOff: { backgroundColor: palette.surfaceSunken, borderColor: palette.border },
  pillOn: { backgroundColor: palette.blue, borderColor: palette.blue, ...shadow.card },
  pressed: { backgroundColor: palette.blueTint },
  glass: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassOff: { backgroundColor: palette.surfaceSunken, borderColor: palette.border },
  glassOn: { backgroundColor: palette.hydration, borderColor: palette.hydration },
  track: {
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceSunken,
    borderWidth: 1,
    borderColor: palette.border,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: radius.sm,
  },
  segment: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  uvNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: palette.warnTint,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.canvasSoft,
  },
});
