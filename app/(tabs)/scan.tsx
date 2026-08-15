import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FaceGuide } from '@/components/brand/FaceGuide';
import { Row, Screen, Tap, Txt } from '@/components/ui';
import { ENVIRONMENT } from '@/data/user';
import { shortDate } from '@/lib/format';
import * as haptics from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, spacing } from '@/theme';

/** Dark viewfinder colours — local to this screen so the theme stays untouched. */
const HUD = {
  scrim: 'rgba(255,255,255,0.045)',
  scrimBorder: 'rgba(255,255,255,0.11)',
  pill: 'rgba(255,255,255,0.08)',
  pillBorder: 'rgba(255,255,255,0.14)',
  dim: 'rgba(214,231,250,0.55)',
  dimmer: 'rgba(214,231,250,0.35)',
} as const;

const FACE_RATIO = 380 / 300;

type Check = {
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CHECKS: Check[] = [
  { label: 'Lighting — good', detail: '480 lux', icon: 'sunny-outline' },
  { label: 'Face detected', detail: '68 landmarks', icon: 'scan-outline' },
  { label: 'Hold still', detail: 'frame steady', icon: 'hand-left-outline' },
];

const TIPS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'No makeup', icon: 'close' },
  { label: 'Natural light', icon: 'sunny-outline' },
  { label: 'Same time of day', icon: 'time-outline' },
];

/** Capture screen. There is no real camera in the prototype — FaceGuide is the subject. */
export default function ScanCapture() {
  const router = useRouter();
  const { scans } = useApp();
  const lastScan = scans[0];
  const nextNumber = lastScan ? scanNumber(lastScan.id) + 1 : 1;
  const gap = lastScan ? daysSince(lastScan.date) : 0;
  const gapLabel =
    gap === 0 ? 'earlier today' : gap === 1 ? 'yesterday' : `${gap} days ago`;

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(0);
  const [why, setWhy] = useState(false);
  const [firing, setFiring] = useState(false);

  const flash = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;

  // Readiness checks flip green on a stagger — this is what sells the AI.
  useEffect(() => {
    const timers = CHECKS.map((_, i) =>
      setTimeout(() => setReady((n) => Math.max(n, i + 1)), 620 + i * 620),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [intro, pulse]);

  const allReady = ready >= CHECKS.length;

  const capture = useCallback(() => {
    if (!allReady || firing) return;
    setFiring(true);
    haptics.success();
    Animated.sequence([
      Animated.timing(flash, {
        toValue: 1,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(flash, {
        toValue: 0,
        duration: 340,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/analysis/analyzing');
    });
  }, [allReady, firing, flash, router]);

  const faceH = Math.max(0, Math.min(box.h - 24, (box.w - 40) * FACE_RATIO));
  const faceW = faceH / FACE_RATIO;

  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0] });
  const introLift = intro.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Screen
      scroll={false}
      padBottom={120}
      background={[palette.ink, palette.inkSoft, palette.ink]}
      contentStyle={styles.content}
    >
      <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
        <Row gap={7}>
          <Animated.View style={[styles.liveDot, { opacity: intro }]} />
          <Txt variant="micro" color={HUD.dim}>
            LIVE PREVIEW
          </Txt>
        </Row>
        <Txt variant="micro" color={HUD.dim}>
          {`UV ${ENVIRONMENT.uvIndex} · ${ENVIRONMENT.humidity}% RH · KL`}
        </Txt>
      </Row>

      <Animated.View style={{ opacity: intro, transform: [{ translateY: introLift }] }}>
        <Txt variant="h2" center color={palette.white}>
          Position your face in the frame
        </Txt>
        <Txt variant="caption" center color={HUD.dim} style={{ marginTop: spacing.xs }}>
          {lastScan
            ? `Scan ${nextNumber} · your last was ${shortDate(lastScan.date)}, ${gapLabel}`
            : 'Your first scan sets the baseline'}
        </Txt>
      </Animated.View>

      <View
        style={styles.viewfinder}
        onLayout={(e) =>
          setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <View style={styles.scrim} />
        <LinearGradient
          colors={gradients.scanOverlay as unknown as [string, string]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.scrimWash}
          pointerEvents="none"
        />
        {faceH > 60 ? (
          <Animated.View style={{ opacity: intro }}>
            <FaceGuide width={faceW} height={faceH} guide />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.checks}>
        {CHECKS.map((c, i) => (
          <CheckRow key={c.label} check={c} done={i < ready} />
        ))}
      </View>

      <Row gap={spacing.sm} justify="center" wrap style={{ marginTop: spacing.md }}>
        {TIPS.map((t) => (
          <View key={t.label} style={styles.tip}>
            <Ionicons name={t.icon} size={11} color={HUD.dim} />
            <Txt variant="micro" color={HUD.dim}>
              {t.label}
            </Txt>
          </View>
        ))}
      </Row>

      <Tap
        onPress={() => setWhy((v) => !v)}
        scaleTo={0.96}
        style={styles.whyLink}
        accessibilityRole="button"
      >
        <Row gap={4} justify="center">
          <Txt variant="label" color={palette.blueBright}>
            Why weekly scans?
          </Txt>
          <Ionicons
            name={why ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={palette.blueBright}
          />
        </Row>
      </Tap>

      {why ? <WhyWeekly /> : null}

      <View style={styles.shutterRow}>
        <HudButton icon="images-outline" label="Photos" />
        <Tap onPress={capture} disabled={!allReady || firing} haptic={false} scaleTo={0.92}>
          <View style={[styles.shutterOuter, !allReady && styles.shutterIdle]}>
            {allReady ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.halo,
                  { opacity: haloOpacity, transform: [{ scale: haloScale }] },
                ]}
              />
            ) : null}
            <LinearGradient
              colors={gradients.action as unknown as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shutterInner}
            >
              <Ionicons name="scan" size={26} color={palette.white} />
            </LinearGradient>
          </View>
        </Tap>
        <HudButton icon="camera-reverse-outline" label="Flip" />
      </View>

      <Txt variant="micro" center color={HUD.dimmer} style={{ marginTop: spacing.sm }}>
        {allReady ? 'TAP TO CAPTURE · TAKES ABOUT 5 SECONDS' : 'CHECKING FRAME…'}
      </Txt>

      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
    </Screen>
  );
}

/** One readiness line: grey and dormant, then green once the "detector" clears it. */
function CheckRow({ check, done }: { check: Check; done: boolean }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(a, {
      toValue: done ? 1 : 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 7,
    }).start();
  }, [done, a]);

  const slide = a.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] });
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Row justify="space-between" style={styles.checkRow}>
      <Row gap={spacing.sm}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={17}
            color={done ? palette.greenBright : HUD.dimmer}
          />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: slide }] }}>
          <Txt variant="bodySm" color={done ? palette.white : HUD.dimmer}>
            {check.label}
          </Txt>
        </Animated.View>
      </Row>
      <Row gap={5}>
        <Ionicons name={check.icon} size={11} color={done ? HUD.dim : HUD.dimmer} />
        <Txt variant="micro" color={done ? HUD.dim : HUD.dimmer}>
          {check.detail.toUpperCase()}
        </Txt>
      </Row>
    </Row>
  );
}

/** Inline explainer toggled by the "Why weekly scans?" link. */
function WhyWeekly() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a]);
  const lift = a.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <Animated.View style={[styles.why, { opacity: a, transform: [{ translateY: lift }] }]}>
      <Txt variant="caption" color={HUD.dim}>
        Skin cells turn over roughly every 28 days, so real change shows up over weeks, not days.
        Scanning every 7 days at the same time gives Simple+ a clean baseline — that is how it
        spotted your hydration climbing 8 points after the essence toner went in.
      </Txt>
    </Animated.View>
  );
}

function HudButton({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.hudBtnWrap}>
      <View style={styles.hudBtn}>
        <Ionicons name={icon} size={17} color={HUD.dim} />
      </View>
      <Txt variant="micro" color={HUD.dimmer}>
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

/** Demo "today" - the seeded scan history is anchored to this date. */
const TODAY = '2026-08-15';

/** "scan-12" -> 12. Returns 0 for anything unparseable. */
function scanNumber(id: string): number {
  const n = Number(id.replace(/[^0-9]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function daysSince(iso: string): number {
  const from = Date.parse(`${iso}T00:00:00Z`);
  const to = Date.parse(`${TODAY}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86400000));
}
const styles = StyleSheet.create({
  content: { flex: 1, paddingBottom: 104, paddingTop: spacing.sm },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.greenBright,
  },
  viewfinder: {
    flex: 1,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
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
  scrimWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xxl,
  },
  checks: {
    backgroundColor: HUD.pill,
    borderWidth: 1,
    borderColor: HUD.pillBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  checkRow: { paddingVertical: 4 },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.round,
    backgroundColor: HUD.pill,
    borderWidth: 1,
    borderColor: HUD.pillBorder,
  },
  whyLink: { marginTop: spacing.sm, alignSelf: 'center' },
  why: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: HUD.pill,
    borderWidth: 1,
    borderColor: HUD.pillBorder,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  hudBtnWrap: { alignItems: 'center', gap: 5, width: 60 },
  hudBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HUD.pill,
    borderWidth: 1,
    borderColor: HUD.pillBorder,
  },
  shutterOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIdle: { opacity: 0.4 },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: palette.blueBright,
  },
  flash: {
    position: 'absolute',
    top: -160,
    bottom: -180,
    left: -40,
    right: -40,
    backgroundColor: palette.white,
  },
});
