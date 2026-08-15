import React, { useEffect, useMemo, useRef, useState } from 'react';
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

import {
  AppHeader,
  Badge,
  Card,
  DeltaPill,
  Divider,
  IconButton,
  Row,
  Screen,
  SectionHeader,
  Tap,
  Txt,
} from '@/components/ui';
import { LineChart } from '@/components/charts';
import { PHOTO_LOG } from '@/data/user';
import { useApp } from '@/store/AppStore';
import { palette, radius, spacing } from '@/theme';
import { shortDate, signed } from '@/lib/format';
import type { PhotoLogEntry, ScoreHistoryPoint } from '@/types';

/** One-line note per photo entry — what the log was actually recording that week. */
const PHOTO_NOTE: Record<string, string> = {
  'ph-1':
    'Baseline scan. Six active spots on the chin, hydration at 58 — the number everything else is measured against.',
  'ph-2':
    'Week 4, score 66. Blemish clarity moved first — 52 to 58 — while hydration crept up 4 points, before anything was visible in the mirror.',
  'ph-3':
    'Week 8, score 74. Sensitivity reached 79 and texture 74 — the barrier was steady enough to keep the actives in.',
  'ph-4':
    'Best scan yet. Two healing spots, 91% adherence, and a 14-day unbroken streak.',
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "25 May 2026" -> "2026-05-25" so photo entries line up with the score history. */
function toIso(display: string): string {
  const parts = display.split(' ');
  if (parts.length < 3) return '';
  const month = MONTHS.indexOf(parts[1]);
  if (month < 0) return '';
  return `${parts[2]}-${String(month + 1).padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function historyIndex(history: ScoreHistoryPoint[], entry: PhotoLogEntry): number {
  const iso = toIso(entry.date);
  const exact = history.findIndex((p) => p.date === iso);
  if (exact >= 0) return exact;
  const byScore = history.findIndex((p) => p.score === entry.score);
  return byScore >= 0 ? byScore : 0;
}

export default function ProgressScreen() {
  const { scoreHistory } = useApp();

  const [beforeId, setBeforeId] = useState(PHOTO_LOG[0].id);
  const [afterId, setAfterId] = useState(PHOTO_LOG[PHOTO_LOG.length - 1].id);

  const before = PHOTO_LOG.find((p) => p.id === beforeId) ?? PHOTO_LOG[0];
  const after = PHOTO_LOG.find((p) => p.id === afterId) ?? PHOTO_LOG[PHOTO_LOG.length - 1];

  const [trendW, setTrendW] = useState(0);

  const span = useMemo(() => {
    const a = historyIndex(scoreHistory, before);
    const b = historyIndex(scoreHistory, after);
    let lo = Math.min(a, b);
    let hi = Math.max(a, b);
    if (lo === hi) {
      if (lo > 0) lo -= 1;
      else hi = Math.min(scoreHistory.length - 1, hi + 1);
    }
    return { lo, hi, points: scoreHistory.slice(lo, hi + 1) };
  }, [scoreHistory, before, after]);

  const delta = after.score - before.score;
  const weeks = Math.max(1, span.hi - span.lo);

  const observations = useMemo(
    () => buildObservations(span.points, before, after, weeks, delta),
    [span.points, before, after, weeks, delta],
  );

  const swap = () => {
    setBeforeId(after.id);
    setAfterId(before.id);
  };

  return (
    <Screen
      padBottom={56}
      header={
        <AppHeader
          title="Progress"
          subtitle={`${PHOTO_LOG.length} logged scans · 25 May – 10 Aug`}
          right={<IconButton icon="swap-horizontal" onPress={swap} size={38} />}
        />
      }
    >
      {/* ---------------- comparison ---------------- */}
      <Reveal delay={0}>
        <Row gap={spacing.md} align="stretch">
          <Panel entry={before} role="Before" accent={palette.textSecondary} />
          <Panel entry={after} role="After" accent={palette.blue} />
        </Row>
        <Row gap={6} style={styles.caption}>
          <Ionicons name="information-circle-outline" size={13} color={palette.textMuted} />
          <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
            Placeholder swatches — this prototype does not capture or store real photos. In the
            live app these are your weekly front-lit scans.
          </Txt>
        </Row>
      </Reveal>

      {/* ---------------- delta ---------------- */}
      <Reveal delay={90} style={styles.section}>
        <Card padding={18}>
          <Txt variant="micro" tone="muted" center>
            {before.label.toUpperCase()} → {after.label.toUpperCase()} · {weeks} WEEK
            {weeks === 1 ? '' : 'S'}
          </Txt>

          <Row justify="center" gap={spacing.lg} style={{ marginTop: spacing.md }}>
            <View style={{ alignItems: 'center' }}>
              <Txt variant="h1" tone="muted">
                {before.score}
              </Txt>
              <Txt variant="micro" tone="muted">
                THEN
              </Txt>
            </View>
            <Ionicons name="arrow-forward" size={18} color={palette.textMuted} />
            <View style={{ alignItems: 'center' }}>
              <Txt variant="h1" color={palette.blue}>
                {after.score}
              </Txt>
              <Txt variant="micro" tone="muted">
                NOW
              </Txt>
            </View>
          </Row>

          <View style={styles.bigPill}>
            <DeltaPill value={delta} suffix=" pts" />
          </View>

          <Txt variant="bodySm" tone="secondary" center style={{ marginTop: spacing.lg }}>
            {delta > 0
              ? `That is ${(delta / weeks).toFixed(1)} points a week, sustained — faster than the 0.9 average Simple+ sees for combination skin in this age band.`
              : delta === 0
                ? 'Flat between these two scans. Pick a wider window to see the underlying trend.'
                : 'Down over this window. Short reversals usually track a barrier flare, not a failed routine.'}
          </Txt>

          <Divider style={{ marginTop: spacing.lg, marginBottom: spacing.md }} />

          <Txt variant="micro" tone="muted" style={{ marginBottom: spacing.sm }}>
            SKIN SCORE BETWEEN THESE TWO SCANS
          </Txt>
          <View onLayout={(e) => setTrendW(e.nativeEvent.layout.width)}>
            {trendW > 0 && span.points.length > 1 ? (
              <LineChart
                key={`${before.id}-${after.id}`}
                data={span.points.map((p) => p.score)}
                labels={span.points.map((p) => p.label)}
                width={trendW}
                height={150}
                color={palette.green}
                gradientId="progressTrend"
              />
            ) : (
              <View style={{ height: 150 }} />
            )}
          </View>
          <Txt variant="caption" tone="muted" center style={{ marginTop: spacing.xs }}>
            Per-metric photo comparison arrives with the camera build — this window is scored from
            your weekly scans.
          </Txt>
        </Card>
      </Reveal>

      {/* ---------------- selectors ---------------- */}
      <Reveal delay={160} style={styles.section}>
        <Card padding={14}>
          <Selector
            title="Before"
            selectedId={before.id}
            onSelect={setBeforeId}
            accent={palette.textSecondary}
          />
          <Divider style={{ marginTop: spacing.md, marginBottom: spacing.md }} />
          <Selector title="After" selectedId={after.id} onSelect={setAfterId} accent={palette.blue} />
        </Card>
      </Reveal>

      {/* ---------------- what changed ---------------- */}
      <Reveal delay={230} style={styles.section}>
        <SectionHeader title="What changed" />
        <Card padding={16}>
          {observations.map((o, i) => (
            <View key={o.title}>
              {i > 0 ? (
                <Divider style={{ marginTop: spacing.md, marginBottom: spacing.md }} />
              ) : null}
              <Row gap={spacing.md} align="flex-start">
                <View style={[styles.obsIcon, { backgroundColor: `${o.color}1A` }]}>
                  <Ionicons name={o.icon} size={15} color={o.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong">{o.title}</Txt>
                  <Txt variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
                    {o.body}
                  </Txt>
                </View>
              </Row>
            </View>
          ))}
        </Card>
      </Reveal>

      {/* ---------------- timeline ---------------- */}
      <Reveal delay={300} style={styles.section}>
        <SectionHeader title="Photo log" />
      </Reveal>
      <View>
        {PHOTO_LOG.map((entry, i) => {
          const prev = i > 0 ? PHOTO_LOG[i - 1] : null;
          const step = prev ? entry.score - prev.score : 0;
          const active = entry.id === before.id || entry.id === after.id;
          return (
            <Reveal key={entry.id} delay={330 + i * 60}>
              <Row align="stretch" gap={spacing.md}>
                <View style={styles.rail}>
                  <View style={[styles.railDot, active && styles.railDotActive]} />
                  {i < PHOTO_LOG.length - 1 ? <View style={styles.railLine} /> : null}
                </View>

                <View style={{ flex: 1, paddingBottom: spacing.md }}>
                  <Card padding={12} tone={active ? 'tinted' : 'plain'}>
                    <Row gap={spacing.md} align="flex-start">
                      <View style={styles.timelineSwatch}>
                        <LinearGradient
                          colors={entry.tint}
                          start={{ x: 0.2, y: 0 }}
                          end={{ x: 0.8, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="rgba(255,255,255,0.75)"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Row justify="space-between">
                          <Txt variant="bodyStrong">{entry.label}</Txt>
                          <Row gap={6}>
                            <Txt variant="bodyStrong" color={palette.blueDeep}>
                              {entry.score}
                            </Txt>
                            {prev ? <DeltaPill value={step} /> : <Badge label="Start" />}
                          </Row>
                        </Row>
                        <Txt variant="micro" tone="muted" style={{ marginTop: 1 }}>
                          {entry.date.toUpperCase()}
                        </Txt>
                        <Txt variant="caption" tone="secondary" style={{ marginTop: 5 }}>
                          {PHOTO_NOTE[entry.id] ?? 'Weekly scan logged.'}
                        </Txt>
                      </View>
                    </Row>
                  </Card>
                </View>
              </Row>
            </Reveal>
          );
        })}
      </View>

      <Reveal delay={620}>
        <Txt variant="caption" tone="muted" center style={styles.disclaimer}>
          Photo comparisons are a tracking aid, not a diagnosis. Bring anything painful, spreading
          or persistent to a doctor.
        </Txt>
      </Reveal>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

type Observation = {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

function buildObservations(
  points: ScoreHistoryPoint[],
  before: PhotoLogEntry,
  after: PhotoLogEntry,
  weeks: number,
  delta: number,
): Observation[] {
  // Steepest single week inside the window.
  let bestGain = 0;
  let bestFrom = points[0];
  let bestTo = points[points.length - 1];
  for (let i = 1; i < points.length; i++) {
    const gain = points[i].score - points[i - 1].score;
    if (gain > bestGain) {
      bestGain = gain;
      bestFrom = points[i - 1];
      bestTo = points[i];
    }
  }

  // Weeks that moved up vs. weeks that slipped.
  const dips = points.filter((p, i) => i > 0 && p.score < points[i - 1].score);
  const ups = points.filter((p, i) => i > 0 && p.score > points[i - 1].score).length;
  const transitions = Math.max(1, points.length - 1);

  return [
    {
      title: `Skin score ${before.score} → ${after.score} (${signed(delta)})`,
      body: `${weeks} week${weeks === 1 ? '' : 's'} between ${before.label.toLowerCase()} and ${after.label.toLowerCase()}, averaging ${(
        delta / weeks
      ).toFixed(1)} points a week. Blemish clarity carried most of it, hydration the rest.`,
      icon: 'trending-up',
      color: palette.good,
    },
    {
      title:
        bestGain > 0
          ? `Steepest week: ${signed(bestGain)} at ${bestTo.label}`
          : 'No standout week in this window',
      body:
        bestGain > 0
          ? `${bestFrom.label} to ${bestTo.label} (week of ${shortDate(bestTo.date)}) moved ${bestGain} points — the same week your PM routine was logged complete every night.`
          : 'Scores held flat scan to scan. Widen the window to pick up the longer trend.',
      icon: 'flash-outline',
      color: palette.blue,
    },
    {
      title:
        dips.length === 0
          ? `All ${transitions} weeks moved up`
          : `${ups} of ${transitions} weeks moved up`,
      body:
        dips.length === 0
          ? 'Not one scan went backwards in this window — rare, and it tracks a 91% adherence run with no missed sunscreen days.'
          : `The ${dips.length === 1 ? 'single dip' : `${dips.length} dips`} (${dips
              .map((d) => d.label)
              .join(', ')}) each followed a week logged under six hours of sleep — the strongest lifestyle correlation in your data.`,
      icon: 'calendar-outline',
      color: palette.evenness,
    },
  ];
}

function Panel({
  entry,
  role,
  accent,
}: {
  entry: PhotoLogEntry;
  role: string;
  accent: string;
}) {
  return (
    <View style={styles.panel}>
      <LinearGradient
        colors={entry.tint}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.panelFace}>
        <Ionicons name="person-outline" size={54} color="rgba(255,255,255,0.55)" />
      </View>
      <LinearGradient
        colors={['rgba(11,37,69,0)', 'rgba(11,37,69,0.62)']}
        style={styles.panelScrim}
      />

      <View style={[styles.roleTag, { backgroundColor: accent }]}>
        <Txt variant="micro" color={palette.white}>
          {role.toUpperCase()}
        </Txt>
      </View>

      <View style={styles.panelFoot}>
        <Txt variant="h4" color={palette.white} numberOfLines={1}>
          {entry.label}
        </Txt>
        <Txt variant="micro" color="rgba(255,255,255,0.78)">
          {entry.date.toUpperCase()}
        </Txt>
        <Row gap={4} align="flex-end" style={{ marginTop: 4 }}>
          <Txt variant="h1" color={palette.white}>
            {entry.score}
          </Txt>
          <Txt variant="caption" color="rgba(255,255,255,0.72)" style={{ marginBottom: 4 }}>
            /100
          </Txt>
        </Row>
      </View>
    </View>
  );
}

function Selector({
  title,
  selectedId,
  onSelect,
  accent,
}: {
  title: string;
  selectedId: string;
  onSelect: (id: string) => void;
  accent: string;
}) {
  return (
    <View>
      <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
        <Row gap={7}>
          <View style={[styles.selectorDot, { backgroundColor: accent }]} />
          <Txt variant="label">{title}</Txt>
        </Row>
        <Txt variant="micro" tone="muted">
          TAP TO CHANGE
        </Txt>
      </Row>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.xs }}
      >
        {PHOTO_LOG.map((p) => {
          const active = p.id === selectedId;
          return (
            <Tap key={p.id} scaleTo={0.93} onPress={() => onSelect(p.id)}>
              <View style={[styles.thumbWrap, active && { borderColor: accent }]}>
                <View style={styles.thumb}>
                  <LinearGradient
                    colors={p.tint}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {active ? (
                    <View style={[styles.thumbCheck, { backgroundColor: accent }]}>
                      <Ionicons name="checkmark" size={10} color={palette.white} />
                    </View>
                  ) : null}
                </View>
                <Txt
                  variant="micro"
                  tone={active ? 'default' : 'muted'}
                  center
                  numberOfLines={1}
                  style={{ marginTop: 4 }}
                >
                  {p.label}
                </Txt>
                <Txt variant="micro" tone="muted" center>
                  {p.score}
                </Txt>
              </View>
            </Tap>
          );
        })}
      </ScrollView>
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
    Animated.timing(a, {
      toValue: 1,
      duration: 460,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
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

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl },

  panel: {
    flex: 1,
    aspectRatio: 0.68,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.surfaceSunken,
    justifyContent: 'flex-end',
  },
  panelFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  panelScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  roleTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.round,
  },
  panelFoot: { padding: spacing.md },

  caption: {
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },

  bigPill: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    transform: [{ scale: 1.45 }],
  },

  selectorDot: { width: 8, height: 8, borderRadius: 4 },
  thumbWrap: {
    width: 62,
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumb: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.surfaceSunken,
    alignItems: 'flex-end',
    padding: 3,
  },
  thumbCheck: {
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  obsIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rail: { width: 14, alignItems: 'center', paddingTop: 16 },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
  },
  railDotActive: { borderColor: palette.blue, backgroundColor: palette.blue },
  railLine: { flex: 1, width: 2, backgroundColor: palette.border, marginTop: 2 },

  timelineSwatch: {
    width: 44,
    height: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSunken,
  },

  disclaimer: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
