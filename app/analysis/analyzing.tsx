import React, { useEffect, useRef, useState } from 'react';
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

import { FaceGuide } from '@/components/brand/FaceGuide';
import { ProgressBar, Row, Screen, Txt } from '@/components/ui';
import { ENVIRONMENT } from '@/data/user';
import * as haptics from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { palette, radius, spacing } from '@/theme';
import type { Scan } from '@/types';

const HUD = {
  scrim: 'rgba(255,255,255,0.045)',
  scrimBorder: 'rgba(255,255,255,0.11)',
  pill: 'rgba(255,255,255,0.08)',
  pillBorder: 'rgba(255,255,255,0.14)',
  dim: 'rgba(214,231,250,0.55)',
  dimmer: 'rgba(214,231,250,0.32)',
} as const;

const FACE_RATIO = 380 / 300;
const STAGE_MS = 800;

type Stage = { label: string; detail: string; icon: keyof typeof Ionicons.glyphMap };

const STAGES: Stage[] = [
  { label: 'Detecting facial landmarks', detail: '68 points', icon: 'scan-outline' },
  { label: 'Measuring hydration across 6 zones', detail: '6 zones', icon: 'water-outline' },
  { label: 'Scoring texture and pore visibility', detail: 'T-zone + cheeks', icon: 'grid-outline' },
  { label: 'Detecting redness and blemishes', detail: '3 regions', icon: 'flame-outline' },
  { label: 'Comparing against your last 12 scans', detail: '12 weeks', icon: 'git-compare-outline' },
  {
    label: `Adjusting for UV ${ENVIRONMENT.uvIndex} / ${ENVIRONMENT.humidity}% humidity`,
    detail: 'Kuala Lumpur',
    icon: 'partly-sunny-outline',
  },
];

/** The scan Simple+ "produces" — slightly ahead of the 10 Aug baseline. */
const NEW_SCAN: Scan = {
  id: 'scan-13',
  date: '2026-08-15',
  score: 84,
  metrics: {
    hydration: 83,
    oil: 76,
    texture: 83,
    evenness: 79,
    sensitivity: 89,
    spots: 87,
  },
  headline: 'Your best hydration reading yet',
  summary:
    'Hydration is up 4 points to 83 — the highest across your 13 scans. The chin cluster is down to a single healing spot, and the barrier held through a 33°C week. Oil balance is still the slow one: the T-zone gives up by early afternoon.',
  conditions: `UV ${ENVIRONMENT.uvIndex} · Humidity ${ENVIRONMENT.humidity}% · ${ENVIRONMENT.temperature}°C · KL`,
  findings: [
    {
      x: 0.47,
      y: 0.79,
      label: 'Chin',
      severity: 'low',
      note: 'One healing spot left, down from two on 10 Aug and six on 27 Jul. Keep dabbing the overnight treatment on that spot only.',
    },
    {
      x: 0.33,
      y: 0.58,
      label: 'Left cheek',
      severity: 'medium',
      note: 'Post-acne marks are the most stubborn thing on your face — measurably lighter than last week, but still the biggest drag on your evenness score.',
    },
    {
      x: 0.5,
      y: 0.54,
      label: 'Nose',
      severity: 'low',
      note: 'Pore congestion easing. Visible shine returns around 1 PM, which lines up with 82% humidity in KL all week.',
    },
    {
      x: 0.42,
      y: 0.26,
      label: 'Forehead',
      severity: 'low',
      note: 'Clear, with faint dehydration lines on the right side — usually a 6-hour sleep tell.',
    },
  ],
};

/** Processing screen. Runs on a timer, applies the scan, then hands off to results. */
export default function Analyzing() {
  const router = useRouter();
  const { dispatch, scans } = useApp();

  // Captured at mount so a repeat run never writes a duplicate scan id.
  const nextScanId = useRef(`scan-${scanNumber(scans[0]?.id ?? '') + 1}`).current;

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [done, setDone] = useState(0);
  const [progress, setProgress] = useState(0);

  const sweep = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 1450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, sweep]);

  useEffect(() => {
    const total = STAGES.length * STAGE_MS;
    const started = Date.now();
    let handoff: ReturnType<typeof setTimeout> | undefined;

    const tick = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / total);
      setProgress(t);
      setDone(Math.floor(t * STAGES.length));

      if (t >= 1 && !finished.current) {
        finished.current = true;
        clearInterval(tick);
        haptics.success();
        dispatch({ type: 'applyScan', scan: { ...NEW_SCAN, id: nextScanId } });
        handoff = setTimeout(() => router.replace('/analysis/results'), 620);
      }
    }, 50);

    return () => {
      clearInterval(tick);
      if (handoff) clearTimeout(handoff);
    };
  }, [dispatch, router, nextScanId]);

  const faceH = Math.max(0, Math.min(box.h - 16, (box.w - 60) * FACE_RATIO));
  const faceW = faceH / FACE_RATIO;
  const pct = Math.round(progress * 100);

  const lineY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, faceH)],
  });

  return (
    <Screen
      scroll={false}
      background={[palette.ink, palette.inkSoft, palette.ink]}
      contentStyle={styles.content}
    >
      <Animated.View style={{ opacity: fade }}>
        <Row gap={7} justify="center">
          <View style={styles.liveDot} />
          <Txt variant="micro" color={HUD.dim}>
            SIMPLE+ AI · ON-DEVICE ANALYSIS
          </Txt>
        </Row>
        <Txt variant="h2" center color={palette.white} style={{ marginTop: spacing.sm }}>
          {progress >= 1 ? 'Analysis complete' : 'Reading your skin'}
        </Txt>
      </Animated.View>

      <View
        style={styles.viewfinder}
        onLayout={(e) =>
          setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <View style={styles.scrim} />
        {faceH > 60 ? (
          <Animated.View style={{ opacity: fade }}>
            <View style={{ width: faceW, height: faceH, overflow: 'hidden' }}>
              <FaceGuide width={faceW} height={faceH} mesh />
              <Animated.View
                pointerEvents="none"
                style={[styles.sweep, { transform: [{ translateY: lineY }] }]}
              >
                <LinearGradient
                  colors={['rgba(61,139,242,0)', 'rgba(61,139,242,0.30)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.sweepGlow}
                />
                <View style={styles.sweepLine} />
              </Animated.View>
            </View>
          </Animated.View>
        ) : null}
        <Corner style={styles.tl} />
        <Corner style={styles.tr} />
        <Corner style={styles.bl} />
        <Corner style={styles.br} />
      </View>

      <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
        <Txt variant="label" color={HUD.dim}>
          {progress >= 1 ? 'Writing results' : STAGES[Math.min(done, STAGES.length - 1)].label}
        </Txt>
        <Txt variant="h3" color={palette.white}>
          {pct}%
        </Txt>
      </Row>
      <ProgressBar
        value={progress}
        height={6}
        color={palette.greenBright}
        track="rgba(255,255,255,0.12)"
        animate={false}
      />

      <View style={styles.stages}>
        {STAGES.map((s, i) => (
          <StageRow key={s.label} stage={s} done={i < done} active={i === done} />
        ))}
      </View>

      <Row gap={6} justify="center" style={{ marginTop: spacing.md }}>
        <Ionicons name="lock-closed-outline" size={11} color={HUD.dimmer} />
        <Txt variant="micro" color={HUD.dimmer}>
          PHOTOS STAY ON THIS DEVICE
        </Txt>
      </Row>
    </Screen>
  );
}

function StageRow({ stage, done, active }: { stage: Stage; done: boolean; active: boolean }) {
  const a = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: done || active ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [done, active, a]);

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0.35, duration: 420, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, blink]);

  const shift = a.interpolate({ inputRange: [0, 1], outputRange: [-5, 0] });
  const color = done ? palette.white : active ? palette.white : HUD.dimmer;

  return (
    <Animated.View style={[styles.stageRow, { transform: [{ translateX: shift }] }]}>
      <Row gap={spacing.sm} style={{ flex: 1 }}>
        {done ? (
          <Ionicons name="checkmark-circle" size={16} color={palette.greenBright} />
        ) : active ? (
          <Animated.View style={{ opacity: blink }}>
            <Ionicons name="radio-button-on" size={16} color={palette.blueBright} />
          </Animated.View>
        ) : (
          <Ionicons name="ellipse-outline" size={16} color={HUD.dimmer} />
        )}
        <Txt variant="bodySm" color={color} numberOfLines={1} style={{ flex: 1 }}>
          {stage.label}
        </Txt>
      </Row>
      {done || active ? (
        <Row gap={5}>
          <Ionicons name={stage.icon} size={11} color={HUD.dim} />
          <Txt variant="micro" color={HUD.dim}>
            {stage.detail.toUpperCase()}
          </Txt>
        </Row>
      ) : null}
    </Animated.View>
  );
}

function Corner({ style }: { style: StyleProp<ViewStyle> }) {
  return <View style={[styles.corner, style]} pointerEvents="none" />;
}

/** "scan-12" -> 12. Returns 0 for anything unparseable. */
function scanNumber(id: string): number {
  const n = Number(id.replace(/[^0-9]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: spacing.md, paddingBottom: spacing.xl },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.blueBright },
  viewfinder: {
    flex: 1,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HUD.scrim,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: HUD.scrimBorder,
  },
  sweep: { position: 'absolute', left: 0, right: 0, top: -54 },
  sweepGlow: { height: 54, width: '100%' },
  sweepLine: {
    height: 2,
    width: '100%',
    backgroundColor: palette.blueBright,
    opacity: 0.9,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  tl: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  tr: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  bl: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  br: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 6,
  },
  stages: {
    marginTop: spacing.lg,
    backgroundColor: HUD.pill,
    borderWidth: 1,
    borderColor: HUD.pillBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 4.5,
  },
});
