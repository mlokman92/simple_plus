import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card, DeltaPill, Row, Screen, StepDots, Tap, Txt } from '@/components/ui';
import { LineChart, ScoreRing } from '@/components/charts';
import { LogoLockup } from '@/components/brand/Logo';
import { FaceGuide } from '@/components/brand/FaceGuide';
import { ProductTile } from '@/components/brand/ProductArt';
import { PRODUCT_BY_ID } from '@/data/products';
import { METRIC_META } from '@/data/taxonomy';
import { CURRENT_METRICS, SCORE_HISTORY } from '@/data/user';
import { myr } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import type { Product } from '@/types';
import { gradients, palette, radius, shadow, spacing } from '@/theme';

/** Canvas wash for the welcome carousel — palette tokens only. */
const WELCOME_BACKDROP = [palette.canvas, palette.canvasSoft, palette.canvas] as const;

/** The four products the demo routine opens with — real ids, real prices. */
const ROUTINE_PREVIEW = [
  'p-cleanser-soothing',
  'p-toner-hydrating',
  'p-serum-calming',
  'p-sunscreen-daily',
] as const;

const SLIDES = [
  {
    eyebrow: '01 · AI Skin Analysis',
    title: 'One scan.\nSix skin metrics.',
    body: 'Point the camera at your face and Simple+ reads hydration, oil balance, texture, evenness, sensitivity and blemishes in about eight seconds.',
  },
  {
    eyebrow: '02 · Personalised Routine',
    title: 'A routine built\nfor your face.',
    body: 'Not a bestseller list. Four steps chosen for your skin type, your concerns and Kuala Lumpur humidity — with halal-certified options surfaced first.',
  },
  {
    eyebrow: '03 · Progress Tracking',
    title: 'Watch it work,\nweek by week.',
    body: 'Your skin score is re-measured every scan. Small, specific changes — an essence toner, SPF before lunch — moved this profile from 61 to 82 in twelve weeks.',
  },
] as const;

export default function Welcome() {
  const router = useRouter();
  const { dispatch } = useApp();

  const [index, setIndex] = useState(0);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const scrollRef = useRef<ScrollView>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  const onViewportLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setVp((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const w = e.nativeEvent.layoutMeasurement.width;
      if (w <= 0) return;
      const next = Math.round(e.nativeEvent.contentOffset.x / w);
      setIndex((prev) => (prev === next ? prev : Math.max(0, Math.min(SLIDES.length - 1, next))));
    },
    [],
  );

  const onGetStarted = useCallback(() => {
    router.push('/onboarding/concerns');
  }, [router]);

  const onHaveAccount = useCallback(() => {
    dispatch({ type: 'completeOnboarding' });
    router.replace('/(tabs)/home');
  }, [dispatch, router]);

  return (
    <Screen scroll={false} gutter={0} background={WELCOME_BACKDROP}>
      <Animated.View
        style={[styles.fill, { opacity: fade, transform: [{ translateY: lift }] }]}
      >
        <View style={styles.topBar}>
          <LogoLockup size={26} />
          <Badge label="EN · BM" tone="neutral" icon="globe-outline" />
        </View>

        <View style={styles.viewport} onLayout={onViewportLayout}>
          {vp.w > 0 ? (
            <ScrollView
              ref={scrollRef}
              style={styles.fill}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onScroll}
              decelerationRate="fast"
            >
              {SLIDES.map((slide, i) => (
                <View key={slide.eyebrow} style={{ width: vp.w, height: vp.h }}>
                  <View style={styles.art}>
                    {i === 0 ? <AnalysisArt width={vp.w} /> : null}
                    {i === 1 ? <RoutineArt width={vp.w} /> : null}
                    {i === 2 ? <ProgressArt width={vp.w} /> : null}
                  </View>
                  <View style={styles.copy}>
                    <Txt variant="micro" tone="brand" style={styles.eyebrow}>
                      {slide.eyebrow.toUpperCase()}
                    </Txt>
                    <Txt variant="h1" style={{ marginTop: spacing.sm }}>
                      {slide.title}
                    </Txt>
                    <Txt variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
                      {slide.body}
                    </Txt>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Row justify="center" style={{ marginBottom: spacing.lg }}>
            <StepDots total={SLIDES.length} index={index} />
          </Row>

          <Button
            label="Get started"
            size="lg"
            iconRight="arrow-forward"
            onPress={onGetStarted}
          />

          <Row justify="center" gap={spacing.xs} style={{ marginTop: spacing.md }}>
            <Tap onPress={onHaveAccount} scaleTo={0.96}>
              <Txt variant="label" tone="brand">
                I already have an account
              </Txt>
            </Tap>
          </Row>

          <Row justify="center" gap={6} style={{ marginTop: spacing.md }}>
            <Ionicons name="shield-checkmark-outline" size={12} color={palette.textMuted} />
            <Txt variant="micro" tone="muted">
              PHOTOS STAY ON YOUR DEVICE · PROTOTYPE, MOCK DATA
            </Txt>
          </Row>
        </View>
      </Animated.View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ *
 * Slide 1 — the scan
 * ------------------------------------------------------------------ */

function AnalysisArt({ width }: { width: number }) {
  const frameW = Math.max(150, Math.min(226, width - 118));
  const frameH = frameW * 1.2;
  const faceW = frameW * 0.86;
  const faceH = (faceW * 380) / 300;

  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, frameH - 8],
  });

  return (
    <View style={{ width: frameW + 96, height: frameH, alignItems: 'center' }}>
      <View
        style={[
          styles.scanFrame,
          { width: frameW, height: frameH, borderRadius: radius.xxl },
        ]}
      >
        <FaceGuide width={faceW} height={faceH} mesh guide />
        <Animated.View style={[styles.sweep, { transform: [{ translateY }] }]}>
          <LinearGradient colors={gradients.scanOverlay} style={styles.sweepBand} />
          <View style={styles.sweepLine} />
        </Animated.View>
      </View>

      <MetricPill
        metric="hydration"
        value={CURRENT_METRICS.hydration}
        style={{ position: 'absolute', left: 0, top: frameH * 0.16 }}
      />
      <MetricPill
        metric="spots"
        value={CURRENT_METRICS.spots}
        style={{ position: 'absolute', right: 0, top: frameH * 0.42 }}
      />
      <MetricPill
        metric="texture"
        value={CURRENT_METRICS.texture}
        style={{ position: 'absolute', left: 4, top: frameH * 0.72 }}
      />
    </View>
  );
}

function MetricPill({
  metric,
  value,
  style,
}: {
  metric: keyof typeof METRIC_META;
  value: number;
  style?: StyleProp<ViewStyle>;
}) {
  const meta = METRIC_META[metric];
  return (
    <View style={[styles.pill, style]}>
      <View style={[styles.pillDot, { backgroundColor: meta.color }]} />
      <Txt variant="micro" tone="secondary">
        {meta.label.toUpperCase()}
      </Txt>
      <Txt variant="micro" color={meta.color}>
        {value}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Slide 2 — the routine
 * ------------------------------------------------------------------ */

function RoutineArt({ width }: { width: number }) {
  const items = useMemo(
    () => ROUTINE_PREVIEW.map((id) => PRODUCT_BY_ID[id]).filter((p): p is Product => !!p),
    [],
  );
  const total = useMemo(() => items.reduce((sum, p) => sum + p.price, 0), [items]);
  const halalCount = useMemo(() => items.filter((p) => p.halalCertified).length, [items]);

  return (
    <Card
      style={{ width: Math.max(220, Math.min(340, width - 40)) }}
      padding={spacing.lg}
      elevation="raised"
    >
      <Row justify="space-between" style={{ marginBottom: spacing.md }}>
        <Row gap={spacing.sm}>
          <Ionicons name="sunny-outline" size={16} color={palette.blue} />
          <Txt variant="h4">Your morning routine</Txt>
        </Row>
        <Badge label="4 steps" tone="brand" />
      </Row>

      {items.map((p, i) => (
        <Row key={p.id} gap={spacing.md} style={styles.routineRow}>
          <View style={styles.stepNum}>
            <Txt variant="micro" tone="brand">
              {i + 1}
            </Txt>
          </View>
          <ProductTile category={p.category} tint={p.tint} size={42} id={`onbWelcome-${i}`} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong" numberOfLines={1}>
              {p.name}
            </Txt>
            <Txt variant="caption" tone="muted" numberOfLines={1}>
              {p.brand} · {p.size}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt variant="label" tone="good">
              {p.matchScore}%
            </Txt>
            <Txt variant="micro" tone="muted">
              MATCH
            </Txt>
          </View>
        </Row>
      ))}

      <View style={styles.routineFoot}>
        <Row justify="space-between">
          <Row gap={6}>
            <Ionicons name="checkmark-circle" size={13} color={palette.green} />
            <Txt variant="caption" tone="secondary">
              {halalCount} of {items.length} JAKIM halal certified
            </Txt>
          </Row>
          <Txt variant="label">{myr(total)}</Txt>
        </Row>
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Slide 3 — the trend
 * ------------------------------------------------------------------ */

function ProgressArt({ width }: { width: number }) {
  const cardW = Math.max(220, Math.min(340, width - 40));
  const chartW = Math.max(1, cardW - spacing.lg * 2);
  const scores = useMemo(() => SCORE_HISTORY.map((p) => p.score), []);
  const labels = useMemo(
    () => SCORE_HISTORY.map((p, i) => (i === 0 || i === 5 || i === SCORE_HISTORY.length - 1 ? p.label : '')),
    [],
  );

  return (
    <Card style={{ width: cardW }} padding={spacing.lg} elevation="raised">
      <Row gap={spacing.lg}>
        <ScoreRing score={82} size={96} strokeWidth={9} gradientId="onbWelcomeRing" />
        <View style={{ flex: 1 }}>
          <Txt variant="micro" tone="muted">
            SKIN SCORE
          </Txt>
          <Row gap={spacing.sm} style={{ marginTop: 2 }}>
            <Txt variant="h2">82</Txt>
            <DeltaPill value={6} />
          </Row>
          <Txt variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
            Twelve weekly scans, 61 → 82. Hydration carried most of the gain.
          </Txt>
        </View>
      </Row>

      <View style={{ marginTop: spacing.md }}>
        <LineChart
          data={scores}
          labels={labels}
          width={chartW}
          height={104}
          color={palette.blue}
          gradientId="onbWelcomeTrend"
          domain={[55, 90]}
        />
      </View>

      <Row justify="space-between" style={styles.trendFoot}>
        <Row gap={6}>
          <Ionicons name="trending-up" size={13} color={palette.good} />
          <Txt variant="caption" tone="good">
            +21 in 12 weeks
          </Txt>
        </Row>
        <Txt variant="caption" tone="muted">
          Next scan: Monday
        </Txt>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  viewport: { flex: 1 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  copy: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, minHeight: 168 },
  eyebrow: { letterSpacing: 1.1 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  scanFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueTint,
    borderWidth: 1,
    borderColor: palette.blueTintStrong,
    overflow: 'hidden',
    ...shadow.card,
  },
  sweep: { position: 'absolute', left: 0, right: 0, top: 0 },
  sweepBand: { height: 70, width: '100%' },
  sweepLine: { height: 2, backgroundColor: palette.blueBright, opacity: 0.9 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.round,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow.card,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  routineRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: radius.round,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineFoot: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  trendFoot: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
