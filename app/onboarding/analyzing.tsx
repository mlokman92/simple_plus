import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProgressBar, Row, Screen, Txt } from '@/components/ui';
import { ScoreRing } from '@/components/charts';
import { LogoMark } from '@/components/brand/Logo';
import { CONCERN_BY_KEY, GOALS } from '@/data/taxonomy';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { GoalKey } from '@/types';

/** Local lookup so the last stage can name the goal that shaped the routine. */
const GOAL_LABEL = Object.fromEntries(
  GOALS.map((g) => [g.key, g.label]),
) as Record<GoalKey, string>;

const STAGE_MS = 700;
const READY_MS = 450;
const EXIT_MS = 600;

const BACKDROP = [palette.canvas, palette.canvasSoft, palette.canvas] as const;

type Stage = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  detail: string;
};

type StageState = 'pending' | 'active' | 'done';

export default function Analyzing() {
  const router = useRouter();
  const { profile, dispatch } = useApp();

  const [done, setDone] = useState(0);
  const [ready, setReady] = useState(false);

  const stages = useMemo<Stage[]>(() => {
    const concernLabels = profile.concerns
      .map((k) => CONCERN_BY_KEY[k].label)
      .join(' · ');
    const goalCount = profile.goals.length;
    return [
      {
        icon: 'search-outline',
        text: `Reading your ${profile.concerns.length} concerns`,
        detail: concernLabels || 'No concerns flagged — starting from a clean baseline',
      },
      {
        icon: 'flask-outline',
        text: 'Matching against 12,000 formulations',
        detail: '1,940 JAKIM halal certified · 612 stocked in Malaysia',
      },
      {
        icon: 'git-compare-outline',
        text: 'Checking ingredient conflicts',
        detail: 'Retinal and PHA kept on separate nights',
      },
      {
        icon: 'rainy-outline',
        text: 'Adapting for KL humidity (82%)',
        detail: 'Gel textures over creams · SPF reapply flagged for 1:00 PM',
      },
      {
        icon: 'list-outline',
        text: 'Building your 4-step routine',
        detail:
          goalCount > 0
            ? `Cleanse · Treat · Moisturise · Protect, weighted to "${GOAL_LABEL[profile.goals[0]].toLowerCase()}"`
            : 'Cleanse · Treat · Moisturise · Protect',
      },
    ];
  }, [profile.concerns, profile.goals]);

  const total = stages.length;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= total; i++) {
      timers.push(setTimeout(() => setDone(i), STAGE_MS * i));
    }
    timers.push(setTimeout(() => setReady(true), STAGE_MS * total + READY_MS));
    timers.push(
      setTimeout(() => {
        dispatch({ type: 'completeOnboarding' });
        router.replace('/(tabs)/home');
      }, STAGE_MS * total + READY_MS + EXIT_MS),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [dispatch, router, total]);

  const ringScore = ready ? 100 : Math.min(100, Math.round(((done + 0.5) / total) * 100));

  return (
    <Screen
      scroll
      background={BACKDROP}
      padBottom={spacing.xxl}
      contentStyle={styles.body}
    >
      <View style={styles.hero}>
        <Halo delay={0} />
        <Halo delay={900} />
        <ScoreRing
          score={ringScore}
          size={168}
          strokeWidth={10}
          gradientId="onbAnalyzingRing"
          colors={ready ? [palette.green, palette.greenLime] : [palette.hydration, palette.greenBright]}
        >
          <PulsingMark />
        </ScoreRing>
        {ready ? (
          <View style={styles.readyBadge}>
            <Ionicons name="checkmark" size={16} color={palette.white} />
          </View>
        ) : null}
      </View>

      <View style={styles.headline}>
        <Txt variant="h1" center>
          {ready ? 'Your profile is ready' : 'Building your profile'}
        </Txt>
        <Txt variant="body" tone="secondary" center style={{ marginTop: spacing.sm }}>
          {ready
            ? `A 4-step routine, ${profile.goals.length} goals and 6 metrics to track. Scan when you are ready.`
            : `Cross-referencing ${profile.concerns.length} concerns, ${profile.goals.length} goals and ${profile.city} conditions.`}
        </Txt>
      </View>

      <View style={styles.progressBlock}>
        <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
          <Txt variant="micro" tone="muted">
            {ready ? 'COMPLETE' : 'ANALYSING'}
          </Txt>
          <Txt variant="micro" tone="brand">
            {done} OF {total} CHECKS
          </Txt>
        </Row>
        <ProgressBar
          value={done / total}
          height={7}
          color={ready ? palette.green : palette.blue}
        />
      </View>

      <View style={styles.list}>
        {stages.map((stage, i) => (
          <StageRow
            key={stage.text}
            stage={stage}
            index={i}
            state={i < done ? 'done' : i === done ? 'active' : 'pending'}
          />
        ))}
      </View>

      <Row gap={6} justify="center" style={{ marginTop: spacing.lg }}>
        <Ionicons name="information-circle-outline" size={12} color={palette.textMuted} />
        <Txt variant="micro" tone="muted" center>
          SKINCARE GUIDANCE, NOT A MEDICAL DIAGNOSIS
        </Txt>
      </Row>
    </Screen>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function PulsingMark() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <LogoMark size={52} />
    </Animated.View>
  );
}

function Halo({ delay }: { delay: number }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, {
        toValue: 1,
        duration: 1800,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [a, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.halo,
        {
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.5] }) }],
        },
      ]}
    />
  );
}

function StageRow({
  stage,
  index,
  state,
}: {
  stage: Stage;
  index: number;
  state: StageState;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: 120 + index * 110,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [enter, index]);

  useEffect(() => {
    if (state !== 'done') return;
    const anim = Animated.spring(tick, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 10,
    });
    anim.start();
    return () => anim.stop();
  }, [state, tick]);

  const isDone = state === 'done';
  const isActive = state === 'active';

  return (
    <Animated.View
      style={[
        styles.stageRow,
        isActive && styles.stageRowActive,
        {
          opacity: enter.interpolate({
            inputRange: [0, 1],
            outputRange: [0, state === 'pending' ? 0.5 : 1],
          }),
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.stageIcon,
          isDone && styles.stageIconDone,
          isActive && styles.stageIconActive,
        ]}
      >
        {isDone ? (
          <Animated.View style={{ transform: [{ scale: tick }] }}>
            <Ionicons name="checkmark" size={16} color={palette.white} />
          </Animated.View>
        ) : (
          <Ionicons
            name={stage.icon}
            size={15}
            color={isActive ? palette.blue : palette.textMuted}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" tone={isDone || isActive ? 'default' : 'muted'}>
          {stage.text}
        </Txt>
        {isDone || isActive ? (
          <Txt variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 1 }}>
            {stage.detail}
          </Txt>
        ) : null}
      </View>

      {isActive ? <Spinner /> : null}
    </Animated.View>
  );
}

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />;
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, justifyContent: 'center', paddingTop: spacing.lg },
  hero: { alignItems: 'center', justifyContent: 'center', height: 200 },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: palette.blueBright,
  },
  readyBadge: {
    position: 'absolute',
    bottom: 14,
    right: '32%',
    width: 30,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.white,
  },
  headline: { marginTop: spacing.lg, paddingHorizontal: spacing.sm },
  progressBlock: { marginTop: spacing.xl },
  list: { marginTop: spacing.lg, gap: spacing.sm },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stageRowActive: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    ...shadow.card,
  },
  stageIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconActive: { backgroundColor: palette.blueTint },
  stageIconDone: { backgroundColor: palette.green },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.blueTintStrong,
    borderTopColor: palette.blue,
  },
});
