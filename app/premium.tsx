import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { LogoLockup } from '@/components/brand/Logo';
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Row,
  Screen,
  Tap,
  Txt,
} from '@/components/ui';
import { myr, shortDate } from '@/lib/format';
import * as haptics from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, spacing } from '@/theme';

/* ------------------------------------------------------------ local tones */
/* The design system is built for the light canvas; this screen runs on the
   dark premium gradient, so it carries its own ink scale. Every opaque colour
   comes from the palette — the rest are translucent glass washes over it. */
const INK_ON_DARK = palette.white;
const INK_SOFT = 'rgba(255,255,255,0.80)';
const INK_MUTED = 'rgba(255,255,255,0.62)';
const GLASS = 'rgba(6,22,45,0.55)';
const GLASS_LINE = 'rgba(255,255,255,0.16)';
const GLASS_DEEP = 'rgba(4,16,34,0.70)';
const HILITE = 'rgba(93,164,255,0.20)';
const ACCENT = palette.greenBright;

type PlanKey = 'monthly' | 'yearly';

const PLANS: Record<PlanKey, { label: string; price: number; per: string; footnote: string }> = {
  monthly: {
    label: 'Monthly',
    price: 19.9,
    per: 'per month',
    footnote: 'RM19.90 a month after the trial. Cancel anytime.',
  },
  yearly: {
    label: 'Yearly',
    price: 179,
    per: 'RM14.92 / month',
    footnote: 'RM179 billed once a year — RM59.80 less than paying monthly.',
  },
};

type Cell = { kind: 'tick' } | { kind: 'cross' } | { kind: 'text'; label: string };

interface FeatureRow {
  label: string;
  note?: string;
  free: Cell;
  premium: Cell;
}

const FEATURES: FeatureRow[] = [
  { label: 'Weekly AI skin scan', free: { kind: 'tick' }, premium: { kind: 'tick' } },
  {
    label: 'Scan whenever you want',
    note: 'Track a flare day by day',
    free: { kind: 'text', label: '1 / wk' },
    premium: { kind: 'text', label: 'Unlimited' },
  },
  {
    label: 'Digital Dermatologist replies',
    free: { kind: 'text', label: '5 / mo' },
    premium: { kind: 'text', label: 'Unlimited' },
  },
  {
    label: 'Video consult with a licensed dermatologist',
    note: 'Booked within 24 hours, MMC-registered',
    free: { kind: 'cross' },
    premium: { kind: 'tick' },
  },
  {
    label: 'Ingredient conflict checker',
    note: 'Flags actives that cancel each other out',
    free: { kind: 'cross' },
    premium: { kind: 'tick' },
  },
  {
    label: 'Export a report for your doctor',
    note: '12 weeks of metrics as a PDF',
    free: { kind: 'cross' },
    premium: { kind: 'tick' },
  },
  {
    label: 'Halal-certified filtering',
    note: 'JAKIM-listed products only',
    free: { kind: 'tick' },
    premium: { kind: 'tick' },
  },
];

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'calendar-outline',
    title: 'Pick a slot',
    body: 'Same-day and next-day, 8 AM to 10 PM MYT.',
  },
  {
    icon: 'documents-outline',
    title: 'We brief the doctor',
    body: 'Your 12 scans, metrics and routine arrive before the call.',
  },
  {
    icon: 'videocam-outline',
    title: '15 min on video',
    body: 'Their written plan drops straight into your routine.',
  },
];

const TESTIMONIALS: { name: string; meta: string; stars: number; quote: string }[] = [
  {
    name: 'Nurul A.',
    meta: '29 · Kuala Lumpur',
    stars: 5,
    quote:
      'The consult caught a reaction I would have Googled for a week. Score went 71 to 84 in two months.',
  },
  {
    name: 'Wei Jian T.',
    meta: '34 · Petaling Jaya',
    stars: 5,
    quote:
      'The conflict checker found two actives fighting each other in my shelf. Paid for the year in one month.',
  },
  {
    name: 'Farah I.',
    meta: '26 · Shah Alam',
    stars: 4,
    quote:
      'Halal filtering plus a real dermatologist on video. Nothing else on my phone does both.',
  },
];

/** Simple+ Premium — upgrade wall that doubles as the business-model slide. */
export default function Premium() {
  const router = useRouter();
  const { profile, dispatch } = useApp();
  const [plan, setPlan] = useState<PlanKey>('yearly');
  const active = profile.isPremium;

  const startTrial = useCallback(() => {
    haptics.success();
    dispatch({ type: 'setPremium', value: true });
  }, [dispatch]);

  const chosen = PLANS[plan];

  /** Day 7 of the trial, resolved at render so the demo never quotes a past date. */
  const trialEnds = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    return shortDate(iso);
  }, []);

  return (
    <Screen
      background={gradients.premium}
      padBottom={spacing.huge}
      header={
        <AppHeader
          right={
            <Txt variant="micro" color={INK_MUTED}>
              DEMO
            </Txt>
          }
        />
      }
    >
      {/* ------------------------------------------------------------ hero */}
      <Appear>
        <LogoLockup size={30} tone="light" />
        <Txt variant="h1" color={INK_ON_DARK} style={{ marginTop: spacing.xl }}>
          Simple+ Premium
        </Txt>
        <Txt variant="body" color={INK_SOFT} style={{ marginTop: spacing.sm }}>
          Your AI reads your skin every week. Premium adds unlimited scans, unlimited answers, and
          a licensed dermatologist on video within 24 hours.
        </Txt>
        <Row wrap gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          {['Unlimited scans', '24-hour consult', 'Doctor-ready reports'].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Txt variant="micro" color={INK_SOFT}>
                {tag.toUpperCase()}
              </Txt>
            </View>
          ))}
        </Row>
      </Appear>

      {/* ------------------------------------------------------------ plan */}
      <Appear delay={90}>
        <View style={styles.segment}>
          {(Object.keys(PLANS) as PlanKey[]).map((key) => {
            const p = PLANS[key];
            const on = key === plan;
            return (
              <View key={key} style={styles.segmentSlot}>
                <Tap onPress={() => setPlan(key)} scaleTo={0.98}>
                  <View style={[styles.segmentCell, on && styles.segmentCellOn]}>
                    <Txt variant="micro" color={on ? INK_ON_DARK : INK_MUTED}>
                      {p.label.toUpperCase()}
                    </Txt>
                    <Txt variant="h2" color={on ? INK_ON_DARK : INK_SOFT} style={{ marginTop: 4 }}>
                      {myr(p.price)}
                    </Txt>
                    <Txt variant="caption" color={INK_MUTED}>
                      {p.per}
                    </Txt>
                  </View>
                </Tap>
                {key === 'yearly' ? (
                  <View style={styles.saveBadge}>
                    <Badge label="Save 25%" tone="good" />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <Row gap={6} style={{ marginTop: spacing.md }}>
          <Ionicons name="gift-outline" size={14} color={ACCENT} />
          <Txt variant="label" color={ACCENT}>
            First 7 days free
          </Txt>
          <Txt variant="caption" color={INK_MUTED} style={{ flex: 1 }}>
            · {chosen.footnote}
          </Txt>
        </Row>
      </Appear>

      {/* -------------------------------------------------------- comparison */}
      <Appear delay={160}>
        <Txt variant="h3" color={INK_ON_DARK} style={styles.sectionTitle}>
          What you get
        </Txt>
        <View style={styles.table}>
          <Row align="stretch" style={styles.headRow}>
            <View style={styles.colLabel} />
            <View style={[styles.colFree, styles.headCell]}>
              <Txt variant="micro" color={INK_MUTED} center>
                FREE
              </Txt>
            </View>
            <View style={[styles.colPremium, styles.bandTop, styles.headCell]}>
              <Txt variant="micro" color={INK_ON_DARK} center>
                PREMIUM
              </Txt>
            </View>
          </Row>

          {FEATURES.map((row, i) => (
            <Row key={row.label} align="stretch" style={i > 0 ? styles.rowLine : undefined}>
              <View style={[styles.colLabel, styles.cellPad]}>
                <Txt variant="bodySm" color={INK_ON_DARK}>
                  {row.label}
                </Txt>
                {row.note ? (
                  <Txt variant="micro" color={INK_MUTED} style={{ marginTop: 2 }}>
                    {row.note}
                  </Txt>
                ) : null}
              </View>
              <View style={[styles.colFree, styles.cellPad, styles.cellCenter]}>
                <CellMark cell={row.free} dim />
              </View>
              <View
                style={[
                  styles.colPremium,
                  styles.cellPad,
                  styles.cellCenter,
                  i === FEATURES.length - 1 && styles.bandBottom,
                ]}
              >
                <CellMark cell={row.premium} />
              </View>
            </Row>
          ))}
        </View>
      </Appear>

      {/* ------------------------------------------------------------ steps */}
      <Appear delay={230}>
        <Txt variant="h3" color={INK_ON_DARK} style={styles.sectionTitle}>
          How the consult works
        </Txt>
        <Row gap={spacing.sm} align="stretch">
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <Row gap={6}>
                <View style={styles.stepNum}>
                  <Txt variant="micro" color={INK_ON_DARK}>
                    {i + 1}
                  </Txt>
                </View>
                <Ionicons name={step.icon} size={14} color={ACCENT} />
              </Row>
              <Txt variant="label" color={INK_ON_DARK} style={{ marginTop: spacing.sm }}>
                {step.title}
              </Txt>
              <Txt variant="micro" color={INK_MUTED} style={{ marginTop: 3, lineHeight: 14 }}>
                {step.body}
              </Txt>
            </View>
          ))}
        </Row>
      </Appear>

      {/* ------------------------------------------------------- testimonials */}
      <Appear delay={300}>
        <Txt variant="h3" color={INK_ON_DARK} style={styles.sectionTitle}>
          Why members upgrade
        </Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quoteRow}
        >
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} padding={spacing.lg} elevation="none" style={styles.quoteCard}>
              <Row gap={2}>
                {[0, 1, 2, 3, 4].map((s) => (
                  <Ionicons
                    key={s}
                    name={s < t.stars ? 'star' : 'star-outline'}
                    size={11}
                    color={s < t.stars ? palette.warn : INK_MUTED}
                  />
                ))}
              </Row>
              <Txt variant="bodySm" color={INK_ON_DARK} style={{ marginTop: spacing.sm }}>
                “{t.quote}”
              </Txt>
              <Txt variant="label" color={INK_SOFT} style={{ marginTop: spacing.md }}>
                {t.name}
              </Txt>
              <Txt variant="micro" color={INK_MUTED}>
                {t.meta}
              </Txt>
            </Card>
          ))}
        </ScrollView>
        <Txt variant="micro" color={INK_MUTED} style={{ marginTop: spacing.sm }}>
          Illustrative personas for this prototype — not real customer reviews.
        </Txt>
      </Appear>

      {/* -------------------------------------------------------------- CTA */}
      <Appear delay={370}>
        {active ? (
          <Appear style={styles.nested}>
            <View style={styles.successCard}>
              <Row gap={spacing.sm}>
                <Ionicons name="checkmark-circle" size={22} color={ACCENT} />
                <Txt variant="h3" color={INK_ON_DARK}>
                  Premium is active
                </Txt>
              </Row>
              <Txt variant="bodySm" color={INK_SOFT} style={{ marginTop: spacing.sm }}>
                Your 7-day trial started today. {chosen.label} plan at {myr(chosen.price)} —
                nothing is charged until {trialEnds}, and unlimited scans are unlocked right now.
              </Txt>
              <Row gap={spacing.sm} style={{ marginTop: spacing.md }} wrap>
                <Badge label="Unlimited scans" tone="good" />
                <Badge label="Consult booking open" tone="good" />
              </Row>
              <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                <Button
                  label="Back to app"
                  icon="arrow-back"
                  onPress={() => router.replace('/(tabs)/home')}
                  size="lg"
                />
                <Button
                  label="Ask the Digital Dermatologist"
                  variant="secondary"
                  onPress={() => router.replace('/derm')}
                />
              </View>
            </View>
          </Appear>
        ) : (
          <View style={styles.ctaCard}>
            <Button
              label="Start 7-day free trial"
              icon="sparkles"
              size="lg"
              onPress={startTrial}
            />
            <Txt variant="caption" color={INK_MUTED} center style={{ marginTop: spacing.md }}>
              Then {myr(chosen.price)} {plan === 'yearly' ? 'a year' : 'a month'}. Cancel in two
              taps before day 7 and you pay nothing.
            </Txt>
          </View>
        )}
      </Appear>

      <Appear delay={430}>
        <Txt variant="micro" color={INK_MUTED} style={styles.fineprint}>
          Prices in Malaysian Ringgit, SST included. Cancel anytime from Profile → Subscription.
          Consults are provided by MMC-registered dermatologists and are not a substitute for
          emergency care. This is a prototype: no payment is processed and no data leaves the
          device.
        </Txt>
      </Appear>
    </Screen>
  );
}

/* --------------------------------------------------------------- helpers */

function CellMark({ cell, dim }: { cell: Cell; dim?: boolean }) {
  if (cell.kind === 'tick') {
    return <Ionicons name="checkmark-circle" size={18} color={dim ? INK_SOFT : ACCENT} />;
  }
  if (cell.kind === 'cross') {
    return <Ionicons name="remove-circle-outline" size={17} color="rgba(255,255,255,0.28)" />;
  }
  return (
    <Txt variant="micro" color={dim ? INK_MUTED : INK_ON_DARK} center>
      {cell.label}
    </Txt>
  );
}

function Appear({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
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
      style={[
        styles.block,
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.xxl },
  nested: { marginTop: 0 },
  sectionTitle: { marginBottom: spacing.md },

  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    backgroundColor: GLASS,
  },

  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentSlot: { flex: 1 },
  segmentCell: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    backgroundColor: GLASS,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
  },
  segmentCellOn: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.42)',
  },
  saveBadge: { position: 'absolute', top: -9, right: spacing.sm },

  table: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    backgroundColor: GLASS,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  headRow: { paddingTop: spacing.md },
  headCell: { paddingTop: 7, paddingBottom: 7 },
  rowLine: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.09)' },
  colLabel: { flex: 1, paddingRight: spacing.sm },
  colFree: { width: 52 },
  colPremium: { width: 66, backgroundColor: HILITE },
  bandTop: { borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  bandBottom: { borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  cellPad: { paddingVertical: spacing.md },
  cellCenter: { alignItems: 'center', justifyContent: 'center' },

  step: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    backgroundColor: GLASS,
    padding: spacing.md,
  },
  stepNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  quoteRow: { gap: spacing.md, paddingRight: spacing.xl, paddingVertical: 2 },
  quoteCard: {
    width: 236,
    backgroundColor: GLASS,
    borderColor: GLASS_LINE,
  },

  ctaCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: GLASS_LINE,
    backgroundColor: GLASS_DEEP,
    padding: spacing.lg,
  },
  successCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    /** palette.greenBright / palette.good, softened over the dark gradient. */
    borderColor: 'rgba(79,190,114,0.45)',
    backgroundColor: 'rgba(34,160,107,0.20)',
    padding: spacing.lg,
  },

  fineprint: { marginTop: spacing.lg, lineHeight: 15 },
});
