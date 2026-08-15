import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FaceGuide } from '@/components/brand/FaceGuide';
import { MetricRow, ScoreRing } from '@/components/charts';
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Chip,
  DeltaPill,
  Divider,
  Row,
  Screen,
  SectionHeader,
  Txt,
} from '@/components/ui';
import { METRIC_ORDER, METRIC_READOUT, ratingFor } from '@/data/taxonomy';
import { LATEST_SCAN, PREVIOUS_METRICS } from '@/data/user';
import { useInsets } from '@/lib/frame';
import { shortDate, signed } from '@/lib/format';
import { useApp } from '@/store/AppStore';
import { gradients, palette, spacing } from '@/theme';
import type { MetricKey, ScanZoneFinding } from '@/types';

const FACE_RATIO = 380 / 300;

const SEVERITY_BADGE: Record<
  ScanZoneFinding['severity'],
  { tone: 'good' | 'warn' | 'alert'; label: string }
> = {
  low: { tone: 'good', label: 'Low severity' },
  medium: { tone: 'warn', label: 'Watch this' },
  high: { tone: 'alert', label: 'Priority' },
};

type Adjustment = {
  id: string;
  badge: string;
  badgeTone: 'good' | 'warn';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  reason: string;
  meta: string;
};

const ADJUSTMENTS: Adjustment[] = [
  {
    id: 'adj-toner',
    badge: 'Keep',
    badgeTone: 'good',
    icon: 'water-outline',
    title: 'Keep the Rice Ferment Essence Toner in your AM order',
    reason:
      'Hydration has climbed 12 points in the three weeks since it went in, and it is the only change you made in that window. Nothing moves ahead of it.',
    meta: 'Hikari · RM68 · step 2 of 4',
  },
  {
    id: 'adj-vitc',
    badge: 'On hold',
    badgeTone: 'warn',
    icon: 'pause-outline',
    title: 'Hold the Stabilised Vitamin C 12% one more week',
    reason:
      'Simple+ only layers an acid-form active once sensitivity sits above 80 for two straight scans. You are at 89 today — one more clean week and it unlocks.',
    meta: 'Aqualis · queued for Week 6',
  },
];

/** The payoff screen: score, annotated face, six metrics, and what changes next. */
export default function ScanResults() {
  const router = useRouter();
  const insets = useInsets();
  const { scans, previousMetrics, previousScore } = useApp();

  const scan = scans[0] ?? LATEST_SCAN;
  const scanNo = scanNumber(scan.id) || scans.length;
  const prior = scans[1];
  const priorScore = prior ? prior.score : previousScore;
  const priorMetrics = prior ? prior.metrics : previousMetrics;
  const scoreDelta = scan.score - priorScore;

  const [active, setActive] = useState(0);
  const [faceBoxW, setFaceBoxW] = useState(0);

  const findings = scan.findings;
  const selected = findings[Math.min(active, Math.max(0, findings.length - 1))];

  const faceW = faceBoxW > 0 ? Math.min(faceBoxW, 226) : 0;
  const faceH = faceW * FACE_RATIO;

  const changes = useMemo(() => {
    const hyd = scan.metrics.hydration - priorMetrics.hydration;
    const evn = scan.metrics.evenness - priorMetrics.evenness;
    const oil = scan.metrics.oil - PREVIOUS_METRICS.oil;
    return [
      {
        id: 'ch-hydration',
        dir: hyd >= 0 ? ('up' as const) : ('down' as const),
        title: `Hydration ${signed(hyd)} → ${scan.metrics.hydration}`,
        body: `Your highest hydration reading in ${scanNo} scans, and evenness moved ${signed(evn)} alongside it. Third scan running that it has climbed since the essence toner went in.`,
      },
      {
        id: 'ch-spots',
        dir: 'up' as const,
        title: 'Chin cluster: 2 spots → 1',
        body: 'Six active spots on 27 July, two on 10 August, one today. The overnight treatment is earning its place.',
      },
      {
        id: 'ch-oil',
        dir: 'down' as const,
        title: `Oil balance still trails at ${scan.metrics.oil}`,
        body: `Only ${signed(oil)} in three weeks — still the lowest of your six metrics. Shine comes back by 1 PM on the 82% humidity days KL has had all week. Blot, do not re-cleanse.`,
      },
    ];
  }, [scan.metrics, priorMetrics, scanNo]);

  return (
    <View style={styles.root}>
      <Screen
        padBottom={168}
        header={
          <AppHeader
            title="Scan Results"
            subtitle={`Scan ${scanNo} · ${shortDate(scan.date)} ${scan.date.slice(0, 4)}`}
            onBack={() => router.replace('/(tabs)/home')}
            right={<Badge label="New" tone="brand" icon="sparkles" />}
          />
        }
      >
        <Reveal delay={0}>
          <Card padding={spacing.xl} elevation="raised">
            <View style={styles.heroTop}>
              <ScoreRing score={scan.score} size={152} strokeWidth={13} gradientId="resultScore" />
              <View style={styles.heroDelta}>
                <DeltaPill value={scoreDelta} />
              </View>
            </View>

            <Txt variant="caption" tone="muted" center style={{ marginTop: spacing.md }}>
              {`Skin score · was ${priorScore} on ${shortDate(prior ? prior.date : '2026-08-10')}`}
            </Txt>
            <Txt variant="h2" center style={{ marginTop: spacing.sm }}>
              {scan.headline}
            </Txt>
            <Txt variant="body" tone="secondary" center style={{ marginTop: spacing.sm }}>
              {scan.summary}
            </Txt>

            <Divider style={{ marginVertical: spacing.lg }} />

            <Row gap={6} justify="center">
              <Ionicons name="partly-sunny-outline" size={13} color={palette.textMuted} />
              <Txt variant="caption" tone="muted">
                {scan.conditions}
              </Txt>
            </Row>
          </Card>
        </Reveal>

        <Reveal delay={90}>
          <SectionHeader title="What we found" style={styles.sectionHeader} />
          <Card padding={spacing.lg}>
            <View style={styles.faceBox} onLayout={(e) => setFaceBoxW(e.nativeEvent.layout.width)}>
              {faceW > 0 ? (
                <FaceGuide
                  width={faceW}
                  height={faceH}
                  findings={findings}
                  activeIndex={active}
                  onSelect={setActive}
                />
              ) : null}
            </View>

            <Row gap={spacing.sm} wrap justify="center" style={{ marginTop: spacing.md }}>
              {findings.map((f, i) => (
                <Chip
                  key={`${f.label}-${i}`}
                  label={f.label}
                  selected={i === active}
                  onPress={() => setActive(i)}
                />
              ))}
            </Row>

            {selected ? (
              <Card tone="sunken" elevation="none" style={{ marginTop: spacing.md }}>
                <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
                  <Txt variant="h4">{selected.label}</Txt>
                  <Badge
                    label={SEVERITY_BADGE[selected.severity].label}
                    tone={SEVERITY_BADGE[selected.severity].tone}
                  />
                </Row>
                <Txt variant="bodySm" tone="secondary">
                  {selected.note}
                </Txt>
              </Card>
            ) : null}

            <Row gap={5} justify="center" style={{ marginTop: spacing.md }}>
              <Ionicons name="locate-outline" size={12} color={palette.textMuted} />
              <Txt variant="micro" tone="muted">
                {`TAP A MARKER · ${findings.length} ZONES FLAGGED`}
              </Txt>
            </Row>
          </Card>
        </Reveal>

        <Reveal delay={180}>
          <SectionHeader title="Your six metrics" style={styles.sectionHeader} />
          <Card padding={spacing.lg}>
            {METRIC_ORDER.map((key: MetricKey, i) => {
              const value = scan.metrics[key];
              return (
                <View key={key}>
                  {i > 0 ? <Divider /> : null}
                  <MetricRow
                    metricKey={key}
                    value={value}
                    delta={value - priorMetrics[key]}
                    readout={METRIC_READOUT[key][ratingFor(value)]}
                  />
                </View>
              );
            })}
          </Card>
        </Reveal>

        <Reveal delay={270}>
          <SectionHeader title="Since your last scan" style={styles.sectionHeader} />
          <Card padding={spacing.lg}>
            {changes.map((c, i) => (
              <View key={c.id}>
                {i > 0 ? <Divider style={{ marginVertical: spacing.md }} /> : null}
                <Row gap={spacing.md} align="flex-start">
                  <View
                    style={[
                      styles.changeIcon,
                      { backgroundColor: c.dir === 'up' ? palette.goodTint : palette.warnTint },
                    ]}
                  >
                    <Ionicons
                      name={c.dir === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={15}
                      color={c.dir === 'up' ? palette.good : palette.warn}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyStrong">{c.title}</Txt>
                    <Txt variant="caption" tone="muted" style={{ marginTop: 3 }}>
                      {c.body}
                    </Txt>
                  </View>
                </Row>
              </View>
            ))}
          </Card>
        </Reveal>

        <Reveal delay={360}>
          <SectionHeader title="What Simple+ is changing" style={styles.sectionHeader} />
          <View style={{ gap: spacing.md }}>
            {ADJUSTMENTS.map((a) => (
              <Card key={a.id} padding={spacing.lg}>
                <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
                  <Row gap={spacing.sm}>
                    <View style={styles.adjIcon}>
                      <Ionicons name={a.icon} size={15} color={palette.blueDeep} />
                    </View>
                    <Txt variant="micro" tone="muted">
                      {a.meta.toUpperCase()}
                    </Txt>
                  </Row>
                  <Badge label={a.badge} tone={a.badgeTone} />
                </Row>
                <Txt variant="h4">{a.title}</Txt>
                <Txt variant="bodySm" tone="secondary" style={{ marginTop: spacing.xs + 2 }}>
                  {a.reason}
                </Txt>
              </Card>
            ))}
          </View>
        </Reveal>

        <Reveal delay={450}>
          <Row gap={spacing.sm} align="flex-start" style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={palette.textMuted} />
            <Txt variant="micro" tone="muted" style={{ flex: 1, letterSpacing: 0 }}>
              Simple+ tracks visible change in your skin over time. It is informational tracking,
              not a medical diagnosis — see a dermatologist for anything painful, spreading, or new.
            </Txt>
          </Row>
        </Reveal>
      </Screen>

      <View style={styles.footer} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(247,251,255,0)', gradients.canvas[1]]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <View style={[styles.footerBody, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            label="Update my routine"
            icon="sparkles"
            onPress={() => router.push('/(tabs)/routine')}
          />
          <Button
            label="Ask about these results"
            variant="secondary"
            icon="chatbubble-ellipses-outline"
            onPress={() => router.push('/derm')}
          />
        </View>
      </View>
    </View>
  );
}

/** Staggered fade-and-lift so the payoff screen assembles itself. */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(a, {
      toValue: 1,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [a, delay]);

  const lift = a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateY: lift }] }}>
      {children}
    </Animated.View>
  );
}

/** "scan-12" -> 12. Returns 0 for anything unparseable. */
function scanNumber(id: string): number {
  const n = Number(id.replace(/[^0-9]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroTop: { alignItems: 'center' },
  heroDelta: { marginTop: -spacing.sm },
  sectionHeader: { marginTop: spacing.xxl },
  faceBox: { alignItems: 'center', justifyContent: 'center' },
  changeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xs,
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  footerFade: { height: 30 },
  footerBody: {
    backgroundColor: gradients.canvas[1],
    paddingHorizontal: 20,
    paddingTop: spacing.xs,
    gap: spacing.sm + 2,
  },
});
