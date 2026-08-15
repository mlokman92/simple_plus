import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ProductTile } from '@/components/brand/ProductArt';
import { RoutineStepCard } from '@/components/RoutineStepCard';
import {
  Badge,
  Button,
  Card,
  GradientCard,
  IconButton,
  ProgressBar,
  Row,
  Screen,
  SectionHeader,
  Tap,
  Txt,
} from '@/components/ui';
import { CATEGORY_LABEL, getProduct } from '@/data/products';
import { AM_STEPS, PM_STEPS, QUEUED_UPGRADES, ROUTINE, WEEKLY_STEPS } from '@/data/routine';
import { myr } from '@/lib/format';
import { select as hapticSelect } from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, spacing } from '@/theme';
import type { RoutineStep, TimeOfDay } from '@/types';

/* ------------------------------------------------------------------ */
/* Segment model                                                       */
/* ------------------------------------------------------------------ */

interface Segment {
  key: TimeOfDay;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconSolid: keyof typeof Ionicons.glyphMap;
  accent: string;
  tintBg: string;
  title: string;
  window: string;
  steps: RoutineStep[];
  cta: string;
  doneLine: string;
}

const SEGMENTS: Segment[] = [
  {
    key: 'am',
    label: 'Morning',
    icon: 'sunny-outline',
    iconSolid: 'sunny',
    accent: palette.warn,
    tintBg: palette.warnTint,
    title: 'Morning routine',
    window: '8:00 – 8:10 AM',
    steps: AM_STEPS,
    cta: 'Mark morning done',
    doneLine: 'Morning logged. Reapply SPF at 1 PM — UV peaks at 11.',
  },
  {
    key: 'pm',
    label: 'Evening',
    icon: 'moon-outline',
    iconSolid: 'moon',
    accent: palette.evenness,
    // 12% wash of the evenness accent — derived from the palette, not a new colour.
    tintBg: `${palette.evenness}1F`,
    title: 'Evening routine',
    window: '9:30 – 9:45 PM',
    steps: PM_STEPS,
    cta: 'Mark evening done',
    doneLine: 'Evening logged. Barrier repair happens while you sleep.',
  },
  {
    key: 'weekly',
    label: 'Weekly',
    icon: 'calendar-outline',
    iconSolid: 'calendar',
    accent: palette.green,
    tintBg: palette.greenTint,
    title: 'Weekly extras',
    window: 'Tue, Sat & Sun',
    steps: WEEKLY_STEPS,
    cta: 'Mark weekly done',
    doneLine: 'Weekly extras logged. Next PHA night is Saturday.',
  },
];

/** Full shelf cost of the routine — the same product can appear in two steps. */
const SHELF = (() => {
  const ids = Array.from(new Set(ROUTINE.map((s) => s.productId)));
  const total = ids.reduce((sum, id) => sum + (getProduct(id)?.price ?? 0), 0);
  return { count: ids.length, total };
})();

const REASONS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'contrast-outline',
    title: 'Combination skin, split treatment',
    body:
      'Oil balance reads 74 while hydration reads 79 — a T-zone that shines over cheeks that do not. Every leave-on here is a gel or water-gel, so nothing traps sebum on the nose.',
  },
  {
    icon: 'leaf-outline',
    title: 'Sensitivity stays protected',
    body:
      'Your calm score sits at 88 and we intend to keep it there. One active at a time: PHA twice a week, salicylic on the chin cluster only, retinal locked until week 10.',
  },
  {
    icon: 'sunny-outline',
    title: 'Built for UV 11 and 82% humidity',
    body:
      'Kuala Lumpur peaks at UV 11 by 1 PM. SPF50+ PA++++ every morning is the highest-impact step in this list — it protects most of the evenness you have gained since May.',
  },
];

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function RoutineScreen() {
  const router = useRouter();
  const { isStepDone, dispatch, adherence, completedSteps } = useApp();
  const [active, setActive] = useState<TimeOfDay>('am');

  const segment = SEGMENTS.find((s) => s.key === active) ?? SEGMENTS[0];
  const steps = segment.steps;

  const doneCount = useMemo(
    () => steps.filter((s) => completedSteps.includes(s.id)).length,
    [steps, completedSteps],
  );
  const allDone = doneCount === steps.length;
  const totalSec = useMemo(() => steps.reduce((n, s) => n + s.durationSec, 0), [steps]);

  return (
    <Screen padBottom={120}>
      <Enter>
        <Row justify="space-between" align="flex-start" style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="h1">Your Routine</Txt>
            <Txt variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
              Built for combination skin in a humid climate
            </Txt>
          </View>
          <IconButton icon="bag-handle-outline" onPress={() => router.push('/shop')} size={40} />
        </Row>

        <Row gap={spacing.sm} wrap style={{ marginBottom: spacing.lg }}>
          <Badge label={`${adherence.streakDays}-day streak`} tone="good" icon="flame" />
          <Badge label={`${adherence.weekPercent}% this week`} tone="brand" icon="checkmark-done" />
          <Badge label="Reviewed 10 Aug" tone="neutral" icon="sparkles" />
        </Row>
      </Enter>

      <Enter delay={60}>
        <Segmented value={active} onChange={setActive} />
      </Enter>

      {/* ---- Summary --------------------------------------------------- */}
      <Enter delay={110} key={`sum-${segment.key}`}>
        <Card padding={spacing.lg} style={{ marginTop: spacing.lg }}>
          <Row justify="space-between" align="flex-start">
            <Row gap={spacing.md} style={{ flex: 1 }}>
              <View style={[styles.segIcon, { backgroundColor: segment.tintBg }]}>
                <Ionicons name={segment.iconSolid} size={18} color={segment.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="h4">{segment.title}</Txt>
                <Txt variant="caption" tone="muted">
                  {segment.window} · {minutesLabel(totalSec)}
                </Txt>
              </View>
            </Row>
            <Badge
              label={`${doneCount} of ${steps.length}`}
              tone={allDone ? 'good' : 'brand'}
            />
          </Row>

          <ProgressBar
            value={steps.length === 0 ? 0 : doneCount / steps.length}
            height={9}
            color={allDone ? palette.good : palette.blue}
            style={{ marginTop: spacing.lg }}
          />
          <Row justify="space-between" style={{ marginTop: spacing.sm }}>
            <Txt variant="caption" tone="secondary">
              {doneCount} of {steps.length} done
            </Txt>
            <Txt variant="caption" tone="muted">
              {totalSec}s of active time
            </Txt>
          </Row>

          <View style={{ marginTop: spacing.lg }}>
            {allDone ? (
              <View style={styles.doneBanner}>
                <Row gap={spacing.sm} align="flex-start">
                  <Ionicons name="checkmark-circle" size={18} color={palette.good} />
                  <Txt variant="bodySm" color={palette.good} style={{ flex: 1 }}>
                    {segment.doneLine}
                  </Txt>
                </Row>
              </View>
            ) : (
              <Button
                label={segment.cta}
                icon="checkmark-done"
                size="md"
                onPress={() => dispatch({ type: 'completeAllSteps', ids: steps.map((s) => s.id) })}
              />
            )}
          </View>
        </Card>
      </Enter>

      {/* ---- Steps ----------------------------------------------------- */}
      <View style={styles.list} key={`list-${segment.key}`}>
        {steps.map((step, i) => (
          <Enter key={step.id} delay={160 + i * 70}>
            <RoutineStepCard
              step={step}
              done={isStepDone(step.id)}
              onToggle={() => dispatch({ type: 'toggleStep', id: step.id })}
              index={step.order}
            />
          </Enter>
        ))}
      </View>

      {/* ---- Queued upgrades ------------------------------------------- */}
      <Enter delay={280}>
        <SectionHeader title="Coming up next" style={{ marginTop: spacing.xxl }} />
        <Txt variant="caption" tone="secondary" style={{ marginBottom: spacing.md, marginTop: -6 }}>
          Two products are held back on purpose. Adding actives faster than your barrier can
          absorb them is the most common way a routine goes backwards.
        </Txt>
        <View style={{ gap: spacing.md }}>
          {QUEUED_UPGRADES.map((q) => (
            <LockedUpgrade
              key={q.productId}
              productId={q.productId}
              unlocksAt={q.unlocksAt}
              reason={q.reason}
            />
          ))}
        </View>
      </Enter>

      {/* ---- Why this routine ------------------------------------------ */}
      <Enter delay={330}>
        <Card tone="tinted" padding={spacing.lg} style={{ marginTop: spacing.xxl }}>
          <Row justify="space-between" align="center">
            <Row gap={spacing.sm}>
              <Ionicons name="sparkles" size={16} color={palette.blueDeep} />
              <Txt variant="h4" color={palette.blueDeep}>
                Why this routine?
              </Txt>
            </Row>
            <Badge label="AI reasoning" tone="brand" />
          </Row>

          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            {REASONS.map((r) => (
              <Row key={r.title} gap={spacing.md} align="flex-start">
                <View style={styles.reasonIcon}>
                  <Ionicons name={r.icon} size={15} color={palette.blueDeep} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong" color={palette.inkSoft}>
                    {r.title}
                  </Txt>
                  <Txt variant="caption" tone="secondary">
                    {r.body}
                  </Txt>
                </View>
              </Row>
            ))}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              label="Ask about my routine"
              variant="secondary"
              icon="chatbubble-ellipses-outline"
              onPress={() => router.push('/derm')}
            />
          </View>
          <Txt variant="micro" tone="muted" center style={{ marginTop: spacing.sm }}>
            GUIDANCE ONLY · NOT A MEDICAL DIAGNOSIS
          </Txt>
        </Card>
      </Enter>

      {/* ---- Shop the routine ------------------------------------------- */}
      <Enter delay={380}>
        <GradientCard
          colors={gradients.brand}
          padding={spacing.xl}
          style={{ marginTop: spacing.lg }}
          onPress={() => router.push('/shop')}
        >
          <Row justify="space-between" align="flex-start">
            <View style={{ flex: 1 }}>
              <Row gap={spacing.sm}>
                <Ionicons name="bag-handle" size={15} color={palette.white} />
                <Txt variant="label" tone="onBrand">
                  SHOP YOUR ROUTINE
                </Txt>
              </Row>
              <Txt variant="h1" tone="onBrand" style={{ marginTop: spacing.sm }}>
                {myr(SHELF.total)}
              </Txt>
              <Txt variant="caption" color="rgba(255,255,255,0.85)">
                {SHELF.count} products, full shelf price
              </Txt>
            </View>
            <View style={styles.shopArrow}>
              <Ionicons name="arrow-forward" size={18} color={palette.white} />
            </View>
          </Row>
          <Txt variant="caption" color="rgba(255,255,255,0.88)" style={{ marginTop: spacing.md }}>
            You will not buy all nine at once — most people replace two a month. Every item is
            stocked at Watsons or Guardian, and Simple+ takes no commission.
          </Txt>
        </GradientCard>
      </Enter>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */

const TRACK_PAD = 4;

function Segmented({
  value,
  onChange,
}: {
  value: TimeOfDay;
  onChange: (key: TimeOfDay) => void;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    SEGMENTS.findIndex((s) => s.key === value),
  );
  const slide = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: index,
      useNativeDriver: true,
      speed: 16,
      bounciness: 5,
    }).start();
  }, [index, slide]);

  const segWidth = width > 0 ? (width - TRACK_PAD * 2) / SEGMENTS.length : 0;
  const translateX = slide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, segWidth, segWidth * 2],
  });

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {segWidth > 0 ? (
        <Animated.View
          style={[styles.indicatorWrap, { width: segWidth, transform: [{ translateX }] }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={gradients.action as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.indicator}
          />
        </Animated.View>
      ) : null}

      {SEGMENTS.map((s) => {
        const on = s.key === value;
        return (
          <View key={s.key} style={styles.segItem}>
            <Tap
              haptic={false}
              scaleTo={0.95}
              onPress={() => {
                hapticSelect();
                onChange(s.key);
              }}
              style={styles.segPress}
            >
              <Row gap={5} justify="center">
                <Ionicons
                  name={on ? s.iconSolid : s.icon}
                  size={14}
                  color={on ? palette.white : palette.textSecondary}
                />
                <Txt variant="label" color={on ? palette.white : palette.textSecondary}>
                  {s.label}
                </Txt>
              </Row>
            </Tap>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Locked upgrade card                                                 */
/* ------------------------------------------------------------------ */

function LockedUpgrade({
  productId,
  unlocksAt,
  reason,
}: {
  productId: string;
  unlocksAt: string;
  reason: string;
}) {
  const router = useRouter();
  const product = getProduct(productId);
  if (!product) return null;

  return (
    <Card
      tone="sunken"
      padding={spacing.md}
      elevation="none"
      style={styles.lockedCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Row gap={spacing.md} align="flex-start">
        <View>
          <View style={{ opacity: 0.5 }}>
            <ProductTile
              category={product.category}
              tint={product.tint}
              size={52}
              id={`queued-${product.id}`}
            />
          </View>
          <View style={styles.lockChip}>
            <Ionicons name="lock-closed" size={11} color={palette.white} />
          </View>
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <Row justify="space-between" align="flex-start">
            <Txt variant="micro" tone="muted">
              {product.brand.toUpperCase()} · {CATEGORY_LABEL[product.category].toUpperCase()}
            </Txt>
            <Badge label={unlocksAt} tone="neutral" icon="lock-closed" />
          </Row>
          <Txt variant="h4" tone="secondary" numberOfLines={2}>
            {product.name}
          </Txt>
          <Txt variant="caption" tone="muted">
            {reason}
          </Txt>
          <Row gap={spacing.sm} style={{ marginTop: 2 }}>
            <Txt variant="caption" tone="muted">
              {myr(product.price)} · {product.size}
            </Txt>
            <Txt variant="caption" tone="muted">
              · {product.matchScore}% match today
            </Txt>
          </Row>
        </View>
      </Row>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function minutesLabel(seconds: number): string {
  if (seconds < 60) return 'under a minute';
  return `about ${Math.round(seconds / 60)} min`;
}

/** Local staggered fade + lift. Kept in-file so shared components stay untouched. */
function Enter({
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
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
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
  headerRow: { marginTop: spacing.sm, marginBottom: spacing.lg },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceSunken,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: palette.border,
    padding: TRACK_PAD,
  },
  indicatorWrap: {
    position: 'absolute',
    left: TRACK_PAD,
    top: TRACK_PAD,
    bottom: TRACK_PAD,
  },
  indicator: { flex: 1, borderRadius: radius.round },
  segItem: { flex: 1 },
  segPress: { height: 38, alignItems: 'center', justifyContent: 'center' },
  segIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBanner: {
    backgroundColor: palette.goodTint,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  list: { gap: spacing.md, marginTop: spacing.lg },
  lockedCard: { borderWidth: 1, borderColor: palette.borderStrong, borderStyle: 'dashed' },
  lockChip: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surfaceSunken,
  },
  reasonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
