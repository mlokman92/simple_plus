import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { LogoMark } from '@/components/brand/Logo';
import { ProductMini } from '@/components/ProductCard';
import { MetricTile, ScoreRing, WeekBars } from '@/components/charts';
import {
  Badge,
  Button,
  Card,
  DeltaPill,
  GradientCard,
  IconButton,
  ProgressBar,
  Row,
  Screen,
  SectionHeader,
  Tap,
  Txt,
} from '@/components/ui';
import { getProduct } from '@/data/products';
import { AM_STEPS, PM_STEPS } from '@/data/routine';
import { ENVIRONMENT, INSIGHTS } from '@/data/user';
import { shortDate } from '@/lib/format';
import { select as hapticSelect } from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { gradients, layout, palette, radius, spacing } from '@/theme';
import type { MetricKey, RoutineStep } from '@/types';

/** Demo "today" — every relative date on the screen hangs off this anchor. */
const TODAY = '2026-08-15';

const HERO_METRICS: MetricKey[] = ['hydration', 'oil', 'sensitivity', 'spots'];

export default function Home() {
  const router = useRouter();
  const {
    profile,
    score,
    scoreDelta,
    metrics,
    scans,
    adherence,
    isStepDone,
    dispatch,
  } = useApp();

  const steps = useMemo(() => [...AM_STEPS, ...PM_STEPS], []);
  const doneCount = steps.filter((s) => isStepDone(s.id)).length;
  const allDone = doneCount === steps.length;

  const lastScanGap = useMemo(() => daysBetween(scans[0]?.date, TODAY), [scans]);

  return (
    <Screen padBottom={120}>
      <Reveal delay={0}>
        <Row justify="space-between" align="flex-start" style={styles.greeting}>
          <View style={{ flex: 1 }}>
            <Txt variant="h1">Hello, {profile.name}! 👋</Txt>
            <Txt variant="body" tone="secondary" style={{ marginTop: 2 }}>
              Let&apos;s take great care of your skin today.
            </Txt>
          </View>
          <Row gap={spacing.sm}>
            <IconButton icon="notifications-outline" badge onPress={() => router.push('/notifications')} />
            <Tap onPress={() => router.push('/(tabs)/profile')} scaleTo={0.9}>
              <LinearGradient
                colors={gradients.brandSoft as unknown as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Txt variant="label" color={palette.white}>
                  {profile.initials}
                </Txt>
              </LinearGradient>
            </Tap>
          </Row>
        </Row>
      </Reveal>

      {/* ---------------- Skin score hero ---------------- */}
      <Reveal delay={60}>
        <Card onPress={() => router.push('/(tabs)/insights')} padding={spacing.lg}>
          <Row justify="space-between" style={{ marginBottom: spacing.md }}>
            <Txt variant="h4">Your Skin Today</Txt>
            <Row gap={5}>
              <View style={styles.liveDot} />
              <Txt variant="micro" tone="muted">
                UPDATED JUST NOW
              </Txt>
            </Row>
          </Row>

          <Row gap={spacing.lg}>
            <ScoreRing score={score} size={116} strokeWidth={10} gradientId="homeScore" />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Txt variant="h2">{headlineFor(score)}</Txt>
              <Txt variant="bodySm" tone="secondary">
                {subheadFor(score)}
              </Txt>
              <Row gap={spacing.sm} style={{ marginTop: spacing.xs }}>
                <DeltaPill value={scoreDelta} />
                <Txt variant="caption" tone="muted">
                  vs last week
                </Txt>
              </Row>
            </View>
          </Row>

          <View style={styles.heroDivider} />

          <Row justify="space-between">
            {HERO_METRICS.map((key) => (
              <MetricTile key={key} metricKey={key} value={metrics[key]} />
            ))}
          </Row>

          <Row gap={4} justify="center" style={{ marginTop: spacing.md }}>
            <Txt variant="micro" tone="brand">
              SEE ALL SIX METRICS
            </Txt>
            <Ionicons name="chevron-forward" size={11} color={palette.blue} />
          </Row>
        </Card>
      </Reveal>

      {/* ---------------- Scan CTA ---------------- */}
      <Reveal delay={120} style={styles.section}>
        <GradientCard
          colors={gradients.action}
          padding={spacing.lg}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Row gap={spacing.md}>
            <View style={styles.ctaIcon}>
              <Ionicons name="scan" size={22} color={palette.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="h3" color={palette.white}>
                Start Skin Scan
              </Txt>
              <Txt variant="bodySm" color="rgba(255,255,255,0.82)">
                Analyse your skin with AI · takes 20 seconds
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.white} />
          </Row>
          <View style={styles.ctaFoot}>
            <Row gap={6}>
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Txt variant="caption" color="rgba(255,255,255,0.75)">
                Last scan {shortDate(scans[0]?.date ?? TODAY)} · {gapLabel(lastScanGap)}
              </Txt>
            </Row>
          </View>
        </GradientCard>
      </Reveal>

      {/* ---------------- Environment ---------------- */}
      <Reveal delay={180} style={styles.section}>
        <Card padding={spacing.lg}>
          <Row justify="space-between" style={{ marginBottom: spacing.md }}>
            <Row gap={6}>
              <Ionicons name="location" size={14} color={palette.blue} />
              <Txt variant="h4">{ENVIRONMENT.city} today</Txt>
            </Row>
            <Badge label={`UV ${ENVIRONMENT.uvLabel}`} tone="alert" icon="warning" />
          </Row>

          <Row justify="space-between">
            <EnvStat icon="sunny" label="UV index" value={`${ENVIRONMENT.uvIndex}`} tone={palette.alert} />
            <EnvStat
              icon="water"
              label="Humidity"
              value={`${ENVIRONMENT.humidity}%`}
              tone={palette.hydration}
            />
            <EnvStat
              icon="thermometer"
              label="Temp"
              value={`${ENVIRONMENT.temperature}°`}
              tone={palette.warn}
            />
            <EnvStat
              icon="leaf"
              label="Air"
              value={ENVIRONMENT.airQualityLabel}
              tone={palette.sensitivity}
            />
          </Row>

          <View style={styles.advisory}>
            <Row gap={spacing.sm} align="flex-start">
              <Ionicons name="sparkles" size={14} color={palette.blueDeep} />
              <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
                {ENVIRONMENT.advisory}
              </Txt>
            </Row>
          </View>
        </Card>
      </Reveal>

      {/* ---------------- Daily routine ---------------- */}
      <Reveal delay={240} style={styles.section}>
        <SectionHeader
          title="Your Daily Routine"
          action="View all"
          onAction={() => router.push('/(tabs)/routine')}
        />
        <Card padding={spacing.md}>
          <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
            <Txt variant="label">
              {doneCount} of {steps.length} steps done today
            </Txt>
            {allDone ? (
              <Badge label="Complete" tone="good" icon="checkmark-circle" />
            ) : (
              <Txt variant="caption" tone="muted">
                {steps.length - doneCount} left
              </Txt>
            )}
          </Row>
          <ProgressBar
            value={steps.length === 0 ? 0 : doneCount / steps.length}
            color={allDone ? palette.good : palette.blue}
          />
          <Txt variant="caption" tone="muted" style={{ marginTop: spacing.sm }}>
            Tap a product to tick it off.
          </Txt>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselInner}
        >
          {steps.map((step) => (
            <RoutineCarouselItem
              key={step.id}
              step={step}
              done={isStepDone(step.id)}
              onToggle={() => {
                hapticSelect();
                dispatch({ type: 'toggleStep', id: step.id });
              }}
            />
          ))}
        </ScrollView>
      </Reveal>

      {/* ---------------- AI recommendations ---------------- */}
      <Reveal delay={300} style={styles.section}>
        <SectionHeader title="AI Recommendation" action="For you" />
        {INSIGHTS.slice(0, 2).map((insight, i) => (
          <Card
            key={insight.id}
            padding={spacing.md}
            style={i > 0 ? { marginTop: spacing.md } : undefined}
          >
            <Row gap={spacing.md} align="flex-start">
              <View style={styles.insightEmoji}>
                <Txt variant="h4">{insight.emoji}</Txt>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt variant="h4">{insight.title}</Txt>
                <Txt variant="bodySm" tone="secondary">
                  {insight.body}
                </Txt>
              </View>
            </Row>
            {i === 0 ? (
              <Button
                label="Ask the dermatologist"
                variant="secondary"
                size="sm"
                icon="chatbubble-ellipses-outline"
                onPress={() => router.push('/derm')}
                style={{ marginTop: spacing.md }}
              />
            ) : null}
          </Card>
        ))}
      </Reveal>

      {/* ---------------- Streak ---------------- */}
      <Reveal delay={360} style={styles.section}>
        <Card padding={spacing.lg}>
          <Row justify="space-between" align="flex-start" style={{ marginBottom: spacing.md }}>
            <View>
              <Row gap={6}>
                <Txt variant="h2">🔥</Txt>
                <Txt variant="h1">{adherence.streakDays}</Txt>
              </Row>
              <Txt variant="caption" tone="muted">
                day streak
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt variant="h2" tone="brand">
                {adherence.weekPercent}%
              </Txt>
              <Txt variant="caption" tone="muted">
                this week
              </Txt>
            </View>
          </Row>
          <WeekBars values={adherence.week} />
          <Txt variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
            Weeks you stayed above 90% averaged +3.0 points. Two missed evenings this week — both
            Thursdays.
          </Txt>
        </Card>
      </Reveal>

      {/* ---------------- Digital dermatologist ---------------- */}
      <Reveal delay={420} style={styles.section}>
        <GradientCard colors={gradients.premium} padding={spacing.lg} onPress={() => router.push('/derm')}>
          <Row gap={spacing.md} align="flex-start">
            <View style={styles.dermMark}>
              <LogoMark size={26} />
            </View>
            <View style={{ flex: 1 }}>
              <Row gap={6}>
                <View style={styles.onlineDot} />
                <Txt variant="micro" color="rgba(255,255,255,0.75)">
                  ONLINE
                </Txt>
              </Row>
              <Txt variant="h3" color={palette.white} style={{ marginTop: 4 }}>
                Your Digital Dermatologist
              </Txt>
              <Txt variant="bodySm" color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }}>
                Ask why you broke out, whether to add vitamin C, or how to cut your routine to three
                steps — answered from your own 12 scans.
              </Txt>
            </View>
          </Row>
          <Button
            label="Start a conversation"
            variant="secondary"
            size="sm"
            iconRight="arrow-forward"
            onPress={() => router.push('/derm')}
            style={{ marginTop: spacing.lg }}
          />
        </GradientCard>
      </Reveal>

      <Txt variant="micro" tone="muted" center style={styles.disclaimer}>
        GUIDANCE ONLY · NOT A MEDICAL DIAGNOSIS
      </Txt>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function RoutineCarouselItem({
  step,
  done,
  onToggle,
}: {
  step: RoutineStep;
  done: boolean;
  onToggle: () => void;
}) {
  const product = getProduct(step.productId);
  if (!product) return null;
  return (
    <ProductMini
      product={product}
      width={128}
      caption={`${step.timeOfDay === 'am' ? '☀️' : '🌙'} ${step.scheduledAt}`}
      done={done}
      onPress={onToggle}
    />
  );
}

function EnvStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View style={styles.envStat}>
      <View style={[styles.envIcon, { backgroundColor: `${tone}1A` }]}>
        <Ionicons name={icon} size={15} color={tone} />
      </View>
      <Txt variant="label" numberOfLines={1}>
        {value}
      </Txt>
      <Txt variant="micro" tone="muted">
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

function Reveal({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(a, {
      toValue: 1,
      duration: 460,
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
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function headlineFor(score: number): string {
  if (score >= 85) return 'Skin looks great!';
  if (score >= 75) return 'Skin looks healthy!';
  if (score >= 60) return 'Getting there';
  return 'Needs some care';
}

function subheadFor(score: number): string {
  if (score >= 85) return 'Whatever you are doing, keep doing it.';
  if (score >= 75) return 'Keep up your good routine.';
  if (score >= 60) return 'A few steps away from a real change.';
  return 'Let us rebuild your barrier first.';
}

function daysBetween(from: string | undefined, to: string): number {
  if (!from) return 0;
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function gapLabel(days: number): string {
  if (days <= 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

const styles = StyleSheet.create({
  greeting: { marginBottom: spacing.lg, marginTop: spacing.xs },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: spacing.xl },

  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.good },
  heroDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.lg,
  },

  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  ctaFoot: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },

  envStat: { alignItems: 'center', gap: 3, flex: 1 },
  envIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  advisory: {
    marginTop: spacing.lg,
    backgroundColor: palette.blueTint,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  carousel: {
    marginTop: spacing.md,
    marginHorizontal: -layout.screenPadding,
  },
  carouselInner: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },

  insightEmoji: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueTint,
  },

  dermMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.greenBright },

  disclaimer: { marginTop: spacing.xxl, letterSpacing: 0.8 },
});
