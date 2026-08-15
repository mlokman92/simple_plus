import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, IconButton, Row, Screen, StepDots, Tap, Txt } from '@/components/ui';
import { CONCERN_BY_KEY, GOALS } from '@/data/taxonomy';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { GoalKey } from '@/types';

const MAX_GOALS = 3;
const GRID_GAP = 12;

/** What picking each goal actually changes in the generated routine. */
const EFFECT: Record<GoalKey, string> = {
  clearAcne: 'Adds a nightly spot treatment',
  evenTone: 'Adds vitamin C in the morning',
  hydrate: 'Layers an essence before moisturiser',
  antiAging: 'Introduces retinal, twice weekly',
  glow: 'Adds a gentle PHA exfoliant',
  calmRedness: 'Strips fragrance and strong actives',
  oilControl: 'Swaps creams for gel textures',
  minimalRoutine: 'Caps your routine at 4 steps',
};

export default function GoalsStep() {
  const router = useRouter();
  const { profile, dispatch } = useApp();

  const [selected, setSelected] = useState<GoalKey[]>(profile.goals.slice(0, MAX_GOALS));
  const [gridW, setGridW] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;

  const bumpLimit = useCallback(() => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const toggle = useCallback(
    (key: GoalKey) => {
      setSelected((prev) => {
        if (prev.includes(key)) return prev.filter((k) => k !== key);
        if (prev.length >= MAX_GOALS) {
          bumpLimit();
          return prev;
        }
        return [...prev, key];
      });
    },
    [bumpLimit],
  );

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setGridW((prev) => (prev === w ? prev : w));
  }, []);

  const onNext = useCallback(() => {
    dispatch({ type: 'setGoals', goals: selected });
    router.push('/onboarding/lifestyle');
  }, [dispatch, router, selected]);

  const cardW = gridW > 0 ? Math.floor((gridW - GRID_GAP) / 2) : 0;
  const count = selected.length;
  const full = count >= MAX_GOALS;

  const concernLine = useMemo(
    () =>
      profile.concerns
        .slice(0, 3)
        .map((k) => CONCERN_BY_KEY[k].label.toLowerCase())
        .join(', '),
    [profile.concerns],
  );

  return (
    <Screen scroll={false} gutter={0} header={<StepHeader />}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <FadeSlide delay={0}>
          <Txt variant="micro" tone="brand" style={styles.eyebrow}>
            STEP 3 OF 4 · YOUR GOALS
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm }}>
            What do you want to change?
          </Txt>
          <Txt variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
            {concernLine
              ? `You flagged ${concernLine}. Now pick up to three outcomes — your routine is built around these first, in order.`
              : 'Pick up to three outcomes. Your routine is built around these first, in order.'}
          </Txt>
        </FadeSlide>

        <Animated.View
          style={[
            styles.counterWrap,
            {
              transform: [
                {
                  translateX: shake.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-7, 7],
                  }),
                },
              ],
            },
          ]}
        >
          <Card
            tone={full ? 'tinted' : 'sunken'}
            padding={spacing.md}
            elevation="none"
            style={full ? styles.counterFull : undefined}
          >
            <Row justify="space-between">
              <Row gap={spacing.sm}>
                <Ionicons
                  name={full ? 'checkmark-circle' : 'flag-outline'}
                  size={16}
                  color={full ? palette.blue : palette.textSecondary}
                />
                <Txt variant="bodyStrong" tone={full ? 'brand' : 'secondary'}>
                  {count} of {MAX_GOALS} selected
                </Txt>
              </Row>
              <Txt variant="caption" tone="muted">
                {full ? 'Tap one to swap it out' : `${MAX_GOALS - count} left`}
              </Txt>
            </Row>
          </Card>
        </Animated.View>

        <View style={styles.grid} onLayout={onGridLayout}>
          {cardW > 0
            ? GOALS.map((goal, i) => {
                const rank = selected.indexOf(goal.key);
                const active = rank >= 0;
                const locked = !active && full;
                return (
                  <FadeSlide key={goal.key} delay={140 + i * 45}>
                    <Tap onPress={() => toggle(goal.key)} scaleTo={0.95}>
                      <View
                        style={[
                          styles.card,
                          { width: cardW },
                          active ? styles.cardActive : styles.cardIdle,
                          locked && styles.cardLocked,
                        ]}
                      >
                        <Row justify="space-between" align="flex-start">
                          <View
                            style={[
                              styles.emojiBubble,
                              active && { backgroundColor: palette.white },
                            ]}
                          >
                            <Txt variant="h3" style={styles.emoji}>
                              {goal.emoji}
                            </Txt>
                          </View>
                          <View style={[styles.rank, active && styles.rankOn]}>
                            <Txt
                              variant="micro"
                              color={active ? palette.white : palette.textMuted}
                            >
                              {active ? `${rank + 1}` : '+'}
                            </Txt>
                          </View>
                        </Row>

                        <Txt variant="h4" style={{ marginTop: spacing.md }}>
                          {goal.label}
                        </Txt>
                        <Txt variant="caption" tone="muted" numberOfLines={1}>
                          {goal.blurb}
                        </Txt>

                        <View style={styles.effect}>
                          <Ionicons
                            name="arrow-forward"
                            size={10}
                            color={active ? palette.blue : palette.textMuted}
                          />
                          <Txt
                            variant="micro"
                            tone={active ? 'brand' : 'muted'}
                            numberOfLines={2}
                            style={{ flex: 1, letterSpacing: 0 }}
                          >
                            {EFFECT[goal.key]}
                          </Txt>
                        </View>
                      </View>
                    </Tap>
                  </FadeSlide>
                );
              })
            : null}
        </View>

        <Row gap={6} justify="center" style={{ marginTop: spacing.lg }}>
          <Ionicons name="sparkles-outline" size={12} color={palette.textMuted} />
          <Txt variant="micro" tone="muted">
            PRIORITY ORDER DECIDES WHICH STEP GETS ADDED FIRST
          </Txt>
        </Row>
      </ScrollView>

      <View style={styles.footer}>
        <Row justify="space-between" style={{ marginBottom: spacing.md }}>
          <Txt variant="caption" tone={count > 0 ? 'brand' : 'muted'}>
            {count === 0 ? 'Pick at least one goal' : `${count} of ${MAX_GOALS} selected`}
          </Txt>
          <Txt variant="caption" tone="muted">
            Step 3 of 4
          </Txt>
        </Row>
        <Button
          label="Next"
          size="lg"
          iconRight="arrow-forward"
          disabled={count === 0}
          onPress={onNext}
        />
      </View>
    </Screen>
  );
}

function StepHeader() {
  const router = useRouter();
  return (
    <Row justify="space-between" style={styles.header}>
      <IconButton
        icon="chevron-back"
        size={38}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/onboarding/skin-type')
        }
      />
      <StepDots total={4} index={2} />
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
  counterWrap: { marginTop: spacing.lg },
  counterFull: { borderColor: palette.blue, borderWidth: 1.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    minHeight: 152,
  },
  cardIdle: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    ...shadow.card,
  },
  cardActive: {
    backgroundColor: palette.blueTint,
    borderColor: palette.blue,
    ...shadow.card,
  },
  cardLocked: { opacity: 0.42 },
  emojiBubble: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 19, lineHeight: 24 },
  rank: {
    width: 21,
    height: 21,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankOn: { backgroundColor: palette.blue, borderColor: palette.blue },
  effect: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
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
