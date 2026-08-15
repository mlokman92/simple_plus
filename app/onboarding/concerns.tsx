import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { CONCERNS } from '@/data/taxonomy';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { ConcernKey } from '@/types';

const GRID_GAP = 12;

export default function ConcernsStep() {
  const router = useRouter();
  const { profile, dispatch } = useApp();

  const [selected, setSelected] = useState<ConcernKey[]>(profile.concerns);
  const [gridW, setGridW] = useState(0);

  const toggle = useCallback((key: ConcernKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setGridW((prev) => (prev === w ? prev : w));
  }, []);

  const onNext = useCallback(() => {
    dispatch({ type: 'setConcerns', concerns: selected });
    router.push('/onboarding/skin-type');
  }, [dispatch, router, selected]);

  const cardW = gridW > 0 ? Math.floor((gridW - GRID_GAP) / 2) : 0;
  const count = selected.length;

  return (
    <Screen scroll={false} gutter={0} header={<StepHeader />}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <FadeSlide delay={0}>
          <Txt variant="micro" tone="brand" style={styles.eyebrow}>
            STEP 1 OF 4 · YOUR SKIN
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm }}>
            Tell us about your skin
          </Txt>
          <Txt variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
            Pick everything that sounds familiar. Most people choose three or four.
          </Txt>
        </FadeSlide>

        <FadeSlide delay={90} style={{ marginTop: spacing.lg }}>
          <Card tone="tinted" padding={spacing.md}>
            <Row gap={spacing.md} align="flex-start">
              <View style={styles.aiBubble}>
                <Ionicons name="sparkles" size={15} color={palette.white} />
              </View>
              <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
                Your Digital Dermatologist builds a baseline profile from your unique skin
                journey. Everything you tap here weights your very first scan — and keeps
                adapting as your skin changes.
              </Txt>
            </Row>
          </Card>
        </FadeSlide>

        <View style={styles.grid} onLayout={onGridLayout}>
          {cardW > 0
            ? CONCERNS.map((concern, i) => {
                const active = selected.includes(concern.key);
                return (
                  <FadeSlide key={concern.key} delay={150 + i * 45}>
                    <Tap onPress={() => toggle(concern.key)} scaleTo={0.95}>
                      <View
                        style={[
                          styles.card,
                          { width: cardW },
                          active ? styles.cardActive : styles.cardIdle,
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
                              {concern.emoji}
                            </Txt>
                          </View>
                          <View style={[styles.check, active && styles.checkOn]}>
                            {active ? (
                              <Ionicons name="checkmark" size={13} color={palette.white} />
                            ) : null}
                          </View>
                        </Row>
                        <Txt variant="h4" style={{ marginTop: spacing.md }}>
                          {concern.label}
                        </Txt>
                        <Txt variant="caption" tone="muted" numberOfLines={2}>
                          {concern.blurb}
                        </Txt>
                      </View>
                    </Tap>
                  </FadeSlide>
                );
              })
            : null}
        </View>

        <Row gap={6} justify="center" style={{ marginTop: spacing.lg }}>
          <Ionicons name="lock-closed-outline" size={12} color={palette.textMuted} />
          <Txt variant="micro" tone="muted">
            PRIVATE TO YOU · NEVER SOLD
          </Txt>
        </Row>
      </ScrollView>

      <View style={styles.footer}>
        <Row justify="space-between" style={{ marginBottom: spacing.md }}>
          <Txt variant="caption" tone={count > 0 ? 'brand' : 'muted'}>
            {count === 0 ? 'Pick at least one to continue' : `${count} selected`}
          </Txt>
          <Txt variant="caption" tone="muted">
            Editable in Profile
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
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/onboarding'))}
      />
      <StepDots total={4} index={0} />
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
  scrollBody: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  eyebrow: { letterSpacing: 1.1 },
  aiBubble: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    backgroundColor: palette.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginTop: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    minHeight: 128,
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
  emojiBubble: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 19, lineHeight: 24 },
  check: {
    width: 21,
    height: 21,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: palette.blue, borderColor: palette.blue },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.canvasSoft,
  },
});
