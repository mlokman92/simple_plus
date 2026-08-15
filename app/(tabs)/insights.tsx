import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Badge,
  Button,
  Card,
  DeltaPill,
  Divider,
  GradientCard,
  ProgressBar,
  Row,
  Screen,
  SectionHeader,
  Tap,
  Txt,
} from '@/components/ui';
import { LineChart, SkinRadar, Sparkline, WeekBars } from '@/components/charts';
import {
  METRIC_META,
  METRIC_ORDER,
  METRIC_READOUT,
  RATING_LABEL,
  RATING_COLOR,
  ratingFor,
} from '@/data/taxonomy';
import { ACHIEVEMENTS, INSIGHTS, METRIC_HISTORY, PHOTO_LOG } from '@/data/user';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, shadow, spacing } from '@/theme';
import { signed } from '@/lib/format';
import type { Achievement, Insight, MetricKey, ScoreHistoryPoint } from '@/types';

/* ------------------------------------------------------------------ */
/* local copy — the AI's read on each metric's 12-week curve            */
/* ------------------------------------------------------------------ */

const METRIC_AI: Record<MetricKey, string> = {
  hydration:
    'Up 21 points across six scans, with the steepest jump the week the essence toner went daily. Simple+ expects it to settle near 84 unless you push past 5 glasses of water a day.',
  oil:
    'Slow but never regressing — usually a sign the routine is right and humidity is the only real variable. Your two flattest weeks both landed above 85% KL humidity.',
  texture:
    'Five straight improving scans, +17 in total. Runs this steady come from consistent PM cleansing rather than any one active.',
  evenness:
    'Trails the rest of your profile by roughly three weeks, which is normal for post-acne marks. The curve steepened once blemishes cleared, so hold the niacinamide.',
  sensitivity:
    'Your strongest metric at 88, and it held through reintroducing the exfoliant on 3 Aug — the barrier is tolerating actives again.',
  spots:
    'The biggest mover in your profile: +32. The chin cluster went from 6 active spots to 2 healing ones over the same window.',
};

const METRIC_LABELS = ['W2', 'W4', 'W6', 'W8', 'W10', 'W12'];

const PHOTO_TEASER_TINTS = PHOTO_LOG;

type RangeKey = '4W' | '12W' | 'All';
const RANGES: RangeKey[] = ['4W', '12W', 'All'];
const RANGE_TAKE: Record<RangeKey, number> = { '4W': 4, '12W': 12, All: 999 };

const INSIGHT_TONE: Record<
  Exclude<Insight['kind'], 'prediction'>,
  { accent: string; tint: string; label: string }
> = {
  win: { accent: palette.good, tint: palette.goodTint, label: 'Win' },
  watch: { accent: palette.warn, tint: palette.warnTint, label: 'Watch' },
  tip: { accent: palette.blue, tint: palette.blueTint, label: 'Tip' },
};

/* ------------------------------------------------------------------ */

export default function InsightsScreen() {
  const router = useRouter();
  const { score, scoreDelta, metrics, previousMetrics, scoreHistory, metricDelta, adherence } =
    useApp();

  const [range, setRange] = useState<RangeKey>('12W');
  const [trendW, setTrendW] = useState(0);
  const [shared, setShared] = useState(false);

  const sliced: ScoreHistoryPoint[] = useMemo(() => {
    const take = RANGE_TAKE[range];
    return take >= scoreHistory.length ? scoreHistory : scoreHistory.slice(-take);
  }, [range, scoreHistory]);

  const stats = useMemo(() => {
    const values = sliced.map((p) => p.score);
    const first = values[0] ?? score;
    const last = values[values.length - 1] ?? score;
    const best = sliced.reduce((acc, p) => (p.score > acc.score ? p : acc), sliced[0]);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length));
    return { first, last, change: last - first, best, avg };
  }, [sliced, score]);

  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const prediction = INSIGHTS.find((i) => i.kind === 'prediction');
  const others = INSIGHTS.filter((i) => i.kind !== 'prediction');

  return (
    <Screen padBottom={120}>
      {/* ---------------- header ---------------- */}
      <Reveal delay={0}>
        <Row justify="space-between" align="flex-start" style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="h1">Insights</Txt>
            <Txt variant="body" tone="secondary" style={{ marginTop: 2 }}>
              12 weeks of your skin, read by AI
            </Txt>
          </View>
          <Badge label="12 scans" tone="brand" icon="sparkles" style={{ marginTop: 6 }} />
        </Row>
      </Reveal>

      {/* ---------------- score trend ---------------- */}
      <Reveal delay={70}>
        <Card padding={16}>
          <Row justify="space-between" style={{ marginBottom: spacing.md }}>
            <View>
              <Txt variant="h3">Skin score trend</Txt>
              <Txt variant="caption" tone="muted">
                Weekly scan · Kuala Lumpur
              </Txt>
            </View>
            <Segmented value={range} onChange={setRange} />
          </Row>

          <View onLayout={(e) => setTrendW(e.nativeEvent.layout.width)}>
            {trendW > 0 ? (
              <LineChart
                key={range}
                data={sliced.map((p) => p.score)}
                labels={sliced.map((p, i) =>
                  sliced.length > 8 && i % 2 === 1 && i !== sliced.length - 1 ? '' : p.label,
                )}
                width={trendW}
                height={172}
                color={palette.blue}
                gradientId="insightTrend"
              />
            ) : (
              <View style={{ height: 172 }} />
            )}
          </View>

          <Divider style={{ marginTop: spacing.md, marginBottom: spacing.md }} />

          <Row justify="space-between" align="flex-start">
            <Stat label="NOW" value={`${stats.last}`} accent={palette.blue} />
            <Stat label={`OVER ${range === 'All' ? 'ALL' : range}`} pill={stats.change} />
            <Stat label="BEST" value={`${stats.best.score}`} sub={stats.best.label} />
            <Stat label="AVERAGE" value={`${stats.avg}`} sub="of range" />
          </Row>

          <View style={styles.footnote}>
            <Ionicons name="analytics-outline" size={13} color={palette.textMuted} />
            <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
              {stats.change >= 0
                ? `${signed(stats.change)} points across ${sliced.length} scans — an average of ${(
                    stats.change / Math.max(1, sliced.length - 1)
                  ).toFixed(1)} a week.`
                : `${signed(stats.change)} points across ${sliced.length} scans. Short dips are normal — the 12-week line is still up.`}
            </Txt>
          </View>
        </Card>
      </Reveal>

      {/* ---------------- radar breakdown ---------------- */}
      <Reveal delay={140} style={styles.section}>
        <Card padding={16}>
          <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
            <Txt variant="h3">Metric breakdown</Txt>
            <DeltaPill value={scoreDelta} />
          </Row>
          <Txt variant="caption" tone="muted">
            This week&apos;s profile against your 27 Jul scan
          </Txt>

          <View style={styles.radarWrap}>
            <SkinRadar values={metrics} compare={previousMetrics} keys={METRIC_ORDER} size={232} />
          </View>

          <Row gap={spacing.lg} justify="center">
            <Row gap={7}>
              <View style={[styles.legendSwatch, { backgroundColor: palette.blue }]} />
              <Txt variant="caption" tone="secondary">
                This week
              </Txt>
            </Row>
            <Row gap={7}>
              <View style={[styles.legendSwatch, styles.legendSwatchDashed]} />
              <Txt variant="caption" tone="secondary">
                Two weeks ago
              </Txt>
            </Row>
          </Row>

          <View style={[styles.footnote, { marginTop: spacing.md }]}>
            <Ionicons name="sparkles" size={13} color={palette.blue} />
            <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
              Every axis moved outward. Evenness is the shortest spoke at 76 — that is where the
              next five weeks of work sit.
            </Txt>
          </View>
        </Card>
      </Reveal>

      {/* ---------------- per-metric list ---------------- */}
      <Reveal delay={200} style={styles.section}>
        <SectionHeader title="Metric by metric" />
      </Reveal>
      <View style={{ gap: spacing.sm + 2 }}>
        {METRIC_ORDER.map((key, i) => (
          <Reveal key={key} delay={230 + i * 55}>
            <MetricInsightCard
              metricKey={key}
              value={metrics[key]}
              delta={metricDelta(key)}
              history={METRIC_HISTORY[key]}
            />
          </Reveal>
        ))}
      </View>

      {/* ---------------- AI insights ---------------- */}
      <Reveal delay={560} style={styles.section}>
        <SectionHeader title="What the AI noticed" />
      </Reveal>

      {prediction ? (
        <Reveal delay={600}>
          <PredictionCard insight={prediction} current={score} />
        </Reveal>
      ) : null}

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        {others.map((insight, i) => (
          <Reveal key={insight.id} delay={650 + i * 60}>
            <InsightCard insight={insight} />
          </Reveal>
        ))}
      </View>

      {/* ---------------- adherence ---------------- */}
      <Reveal delay={840} style={styles.section}>
        <Card padding={16}>
          <Row justify="space-between" align="flex-start">
            <View>
              <Txt variant="h3">Consistency</Txt>
              <Txt variant="caption" tone="muted">
                Routine steps completed, Mon–Sun
              </Txt>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={13} color={palette.warn} />
              <Txt variant="micro" color={palette.warn}>
                {adherence.streakDays}-DAY STREAK
              </Txt>
            </View>
          </Row>

          <Row align="flex-end" gap={spacing.lg} style={{ marginTop: spacing.lg }}>
            <View>
              <Txt variant="number">
                {adherence.weekPercent}
                <Txt variant="h2" tone="muted">
                  %
                </Txt>
              </Txt>
              <Txt variant="micro" tone="muted">
                THIS WEEK
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <WeekBars values={adherence.week} height={54} color={palette.blue} />
            </View>
          </Row>

          <Divider style={{ marginTop: spacing.lg, marginBottom: spacing.md }} />

          <Row gap={spacing.sm} align="flex-start">
            <Ionicons name="git-compare-outline" size={15} color={palette.green} />
            <Txt variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              Adherence and score move together for you: your four highest-adherence weeks averaged
              <Txt variant="bodyStrong" tone="good">
                {' '}
                +3.0 points
              </Txt>
              , the other seven averaged +1.3. Roughly 1 point of skin score for every 10% of steps
              you keep.
            </Txt>
          </Row>
        </Card>
      </Reveal>

      {/* ---------------- achievements ---------------- */}
      <Reveal delay={900} style={styles.section}>
        <SectionHeader title={`Milestones · ${unlocked}/${ACHIEVEMENTS.length}`} />
      </Reveal>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.id} delay={930 + i * 45} style={styles.gridItem}>
            <AchievementTile achievement={a} />
          </Reveal>
        ))}
      </View>

      {/* ---------------- photo progress teaser ---------------- */}
      <Reveal delay={1180} style={styles.section}>
        <SectionHeader
          title="Photo progress"
          action="Compare"
          onAction={() => router.push('/progress')}
        />
        <Card padding={14} onPress={() => router.push('/progress')}>
          <Row gap={spacing.sm}>
            {PHOTO_TEASER_TINTS.map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <View style={styles.thumb}>
                  <LinearGradient
                    colors={p.tint}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.thumbScore}>
                    <Txt variant="micro" color={palette.white}>
                      {p.score}
                    </Txt>
                  </View>
                </View>
                <Txt variant="micro" tone="muted" center style={{ marginTop: 5 }}>
                  {p.label.toUpperCase()}
                </Txt>
              </View>
            ))}
          </Row>
          <Divider style={{ marginTop: spacing.md, marginBottom: spacing.sm + 2 }} />
          <Row justify="space-between">
            <Txt variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              Baseline to today: 61 → 82 over 11 weeks.
            </Txt>
            <Row gap={4}>
              <Txt variant="label" tone="brand">
                Open comparison
              </Txt>
              <Ionicons name="chevron-forward" size={14} color={palette.blue} />
            </Row>
          </Row>
        </Card>
      </Reveal>

      {/* ---------------- weekly report ---------------- */}
      <Reveal delay={1240} style={styles.section}>
        <Card padding={16} tone="tinted">
          <Row gap={spacing.sm} style={{ marginBottom: spacing.sm }}>
            <Ionicons name="document-text-outline" size={16} color={palette.blueDeep} />
            <Txt variant="h4" color={palette.blueDeep}>
              Your week in one line
            </Txt>
          </Row>
          <Txt variant="body" tone="secondary">
            Score 82 (+6), hydration up 8 after the essence toner, the chin cluster down to two
            healing spots, and 91% adherence across 14 unbroken days. Not one of the six metrics
            moved backwards.
          </Txt>

          <View style={{ marginTop: spacing.lg }}>
            {shared ? (
              <Row gap={spacing.sm} style={styles.confirm}>
                <Ionicons name="checkmark-circle" size={18} color={palette.good} />
                <Txt variant="bodySm" tone="secondary" style={{ flex: 1 }}>
                  Report prepared — 12 weeks, 12 scans, one page. Add your dermatologist&apos;s email
                  in Profile and Simple+ will send it.
                </Txt>
              </Row>
            ) : (
              <Button
                label="Share with my dermatologist"
                variant="secondary"
                icon="share-outline"
                onPress={() => setShared(true)}
              />
            )}
          </View>
        </Card>
      </Reveal>

      <Reveal delay={1300}>
        <Txt variant="caption" tone="muted" center style={styles.disclaimer}>
          Simple+ tracks and explains — it is not a diagnosis. Anything painful or persistent
          belongs with a doctor.
        </Txt>
      </Reveal>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

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

function Segmented({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  return (
    <View style={styles.segment}>
      {RANGES.map((r) => {
        const active = r === value;
        return (
          <Tap key={r} scaleTo={0.93} onPress={() => onChange(r)}>
            <View style={[styles.segmentItem, active && styles.segmentItemActive]}>
              <Txt variant="micro" color={active ? palette.blueDeep : palette.textSecondary}>
                {r.toUpperCase()}
              </Txt>
            </View>
          </Tap>
        );
      })}
    </View>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  pill,
}: {
  label: string;
  value?: string;
  sub?: string;
  accent?: string;
  pill?: number;
}) {
  return (
    <View style={styles.stat}>
      <Txt variant="micro" tone="muted" numberOfLines={1}>
        {label}
      </Txt>
      <View style={{ marginTop: 4, minHeight: 24, justifyContent: 'center' }}>
        {typeof pill === 'number' ? (
          <DeltaPill value={pill} />
        ) : (
          <Txt variant="h2" color={accent ?? palette.text}>
            {value}
          </Txt>
        )}
      </View>
      {sub ? (
        <Txt variant="caption" tone="muted" numberOfLines={1}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

function MetricInsightCard({
  metricKey,
  value,
  delta,
  history,
}: {
  metricKey: MetricKey;
  value: number;
  delta: number;
  history: number[];
}) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(spin, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, spin]);

  const meta = METRIC_META[metricKey];
  const rating = ratingFor(value);
  const readout = METRIC_READOUT[metricKey][rating];
  const badgeTone = rating === 'fair' ? 'warn' : rating === 'watch' ? 'alert' : 'good';
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Card padding={14} onPress={() => setOpen((o) => !o)}>
      <Row justify="space-between">
        <Row gap={9} style={{ flex: 1 }}>
          <View style={[styles.metricDot, { backgroundColor: meta.color }]} />
          <Txt variant="bodyStrong" numberOfLines={1}>
            {meta.label}
          </Txt>
          <Badge label={RATING_LABEL[rating]} tone={badgeTone} />
        </Row>
        <Row gap={7}>
          <Txt variant="h3" color={RATING_COLOR[rating]}>
            {value}
          </Txt>
          <DeltaPill value={delta} />
        </Row>
      </Row>

      <Row gap={spacing.md} style={{ marginTop: spacing.sm + 2 }}>
        <Sparkline data={history} width={68} height={22} color={meta.color} />
        <Txt variant="caption" tone="muted" style={{ flex: 1 }} numberOfLines={1}>
          {readout}
        </Txt>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={15} color={palette.textMuted} />
        </Animated.View>
      </Row>

      {open ? (
        <View>
          <Divider style={{ marginTop: spacing.md, marginBottom: spacing.sm }} />
          <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
            <Txt variant="micro" tone="muted">
              12 WEEKS · {meta.unit.toUpperCase()}
            </Txt>
            <Txt variant="micro" tone="muted">
              {history[0]} → {history[history.length - 1]}
            </Txt>
          </Row>
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
            {w > 0 ? (
              <LineChart
                data={history}
                labels={METRIC_LABELS}
                width={w}
                height={130}
                color={meta.color}
                gradientId={`insightMetric-${metricKey}`}
              />
            ) : (
              <View style={{ height: 130 }} />
            )}
          </View>
          <View style={[styles.aiBox, { backgroundColor: `${meta.color}12` }]}>
            <Ionicons name="sparkles" size={13} color={meta.color} />
            <Txt variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              {METRIC_AI[metricKey]}
            </Txt>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function PredictionCard({ insight, current }: { insight: Insight; current: number }) {
  const target = 87;
  const from = 61;
  const progress = (current - from) / (target - from);

  return (
    <GradientCard colors={gradients.premium} padding={18} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Row justify="space-between" align="flex-start">
        <Row gap={spacing.md} style={{ flex: 1 }}>
          <View style={styles.predEmoji}>
            <Txt variant="h3">{insight.emoji}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="micro" color="rgba(255,255,255,0.62)">
              AI PREDICTION · FIVE WEEKS OUT
            </Txt>
            <Txt variant="h2" color={palette.white} style={{ marginTop: 3 }}>
              {insight.title}
            </Txt>
          </View>
        </Row>
      </Row>

      <Txt variant="body" color="rgba(255,255,255,0.80)" style={{ marginTop: spacing.md }}>
        {insight.body}
      </Txt>

      <View style={styles.predTrack}>
        <ProgressBar
          value={Math.max(0, Math.min(1, progress))}
          height={7}
          color={palette.greenBright}
          track="rgba(255,255,255,0.16)"
        />
        <Row justify="space-between" style={{ marginTop: spacing.sm }}>
          <Txt variant="micro" color="rgba(255,255,255,0.62)">
            25 MAY · {from}
          </Txt>
          <Txt variant="micro" color={palette.white}>
            TODAY · {current}
          </Txt>
          <Txt variant="micro" color={palette.greenBright}>
            14 SEP · {target} ± 3
          </Txt>
        </Row>
      </View>
    </GradientCard>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const kind = insight.kind === 'prediction' ? 'tip' : insight.kind;
  const tone = INSIGHT_TONE[kind];
  return (
    <Card padding={0}>
      <Row align="stretch">
        <View style={[styles.accentBar, { backgroundColor: tone.accent }]} />
        <View style={{ flex: 1, padding: 15 }}>
          <Row gap={spacing.md} align="flex-start">
            <View style={[styles.insightEmoji, { backgroundColor: tone.tint }]}>
              <Txt variant="h4">{insight.emoji}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Row gap={spacing.sm} style={{ marginBottom: 2 }}>
                <Txt variant="micro" color={tone.accent}>
                  {tone.label.toUpperCase()}
                </Txt>
              </Row>
              <Txt variant="h4">{insight.title}</Txt>
              <Txt variant="bodySm" tone="secondary" style={{ marginTop: 5 }}>
                {insight.body}
              </Txt>
            </View>
          </Row>
        </View>
      </Row>
    </Card>
  );
}

function AchievementTile({ achievement }: { achievement: Achievement }) {
  const locked = !achievement.unlocked;
  const hasProgress =
    typeof achievement.progress === 'number' && typeof achievement.target === 'number';
  const ratio = hasProgress
    ? Math.min(1, (achievement.progress ?? 0) / Math.max(1, achievement.target ?? 1))
    : 0;

  return (
    <Card padding={13} tone={locked ? 'sunken' : 'plain'} elevation={locked ? 'none' : 'card'}>
      <Row justify="space-between" align="flex-start">
        <View style={[styles.achEmoji, locked && styles.achEmojiLocked]}>
          <Txt variant="h4" style={locked ? styles.desaturated : undefined}>
            {achievement.emoji}
          </Txt>
        </View>
        {locked ? (
          <Ionicons name="lock-closed" size={13} color={palette.textMuted} />
        ) : (
          <Ionicons name="checkmark-circle" size={16} color={palette.good} />
        )}
      </Row>

      <Txt
        variant="bodyStrong"
        tone={locked ? 'muted' : 'default'}
        style={{ marginTop: spacing.sm }}
        numberOfLines={1}
      >
        {achievement.title}
      </Txt>
      <Txt variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 1, minHeight: 32 }}>
        {achievement.blurb}
      </Txt>

      {hasProgress ? (
        <View style={{ marginTop: spacing.sm }}>
          <ProgressBar value={ratio} height={5} color={palette.textMuted} track={palette.border} />
          <Txt variant="micro" tone="muted" style={{ marginTop: 5 }}>
            {achievement.progress} / {achievement.target}
          </Txt>
        </View>
      ) : (
        <Txt variant="micro" color={palette.good} style={{ marginTop: spacing.sm }}>
          UNLOCKED
        </Txt>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  headerRow: { marginTop: spacing.sm, marginBottom: spacing.lg },
  section: { marginTop: spacing.xxl },

  segment: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceSunken,
    borderRadius: radius.round,
    padding: 3,
    gap: 2,
  },
  segmentItem: {
    paddingHorizontal: 11,
    height: 26,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: palette.surface,
    ...shadow.card,
  },

  stat: { flex: 1, alignItems: 'flex-start' },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  radarWrap: { alignItems: 'center', marginVertical: spacing.sm },
  legendSwatch: { width: 14, height: 3, borderRadius: 2 },
  legendSwatchDashed: {
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderColor: palette.textMuted,
    borderStyle: 'dashed',
    height: 0,
  },

  metricDot: { width: 8, height: 8, borderRadius: 4 },
  aiBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },

  predEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  predTrack: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },

  accentBar: { width: 4 },
  insightEmoji: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.warnTint,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.round,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  gridItem: { width: '48.5%' },
  achEmoji: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueTint,
  },
  achEmojiLocked: { backgroundColor: palette.border },
  desaturated: { opacity: 0.45 },

  thumb: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: palette.surfaceSunken,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 5,
  },
  thumbScore: {
    backgroundColor: 'rgba(11,37,69,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },

  confirm: {
    alignItems: 'flex-start',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
  },
  disclaimer: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
});
