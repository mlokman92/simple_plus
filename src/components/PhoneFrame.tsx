import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, radius, spacing } from '@/theme';
import { LogoLockup } from '@/components/brand/Logo';
import { Row, Txt } from '@/components/ui/primitives';

const DEVICE_W = 390;
const DEVICE_H = 844;
/** Below this viewport width we just fill the screen — real phones, no chrome. */
const BREAKPOINT = 900;

/**
 * The pitch is delivered in a desktop browser, so on wide viewports the app is
 * framed inside a phone with the brand story beside it. On a phone-sized
 * viewport (or any native build) this renders nothing but the children.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < BREAKPOINT) {
    return <>{children}</>;
  }

  // The bezel adds 22px on each axis — scale against the outer size, not the screen.
  const scale = Math.min(1, (height - 56) / (DEVICE_H + 22));

  return (
    <LinearGradient
      colors={['#DCEAFA', '#F2F8FF', '#E6F1FB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.stage}
    >
      <View style={styles.stageInner}>
        <View style={styles.pitch}>
          <LogoLockup size={40} />
          <Txt variant="display" style={{ marginTop: spacing.xxl, maxWidth: 460 }}>
            Your Skin.{'\n'}Understood.
          </Txt>
          <Txt variant="display" tone="brand" style={{ maxWidth: 460 }}>
            Care, simplified.
          </Txt>
          <Txt variant="body" tone="secondary" style={{ marginTop: spacing.lg, maxWidth: 420 }}>
            AI-powered skincare that understands you and grows with your skin. Scan, get a routine
            built for your face, and watch the score move.
          </Txt>

          <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
            {[
              ['AI Skin Analysis', 'Smart, accurate, personal.'],
              ['Personalised Routine', 'Just what your skin needs.'],
              ['Track & Improve', 'See progress. Stay glowing.'],
              ['Digital Dermatologist', 'AI-guided insights, anytime.'],
            ].map(([title, blurb]) => (
              <Row key={title} gap={spacing.md}>
                <View style={styles.bullet} />
                <View>
                  <Txt variant="h4">{title}</Txt>
                  <Txt variant="caption" tone="muted">
                    {blurb}
                  </Txt>
                </View>
              </Row>
            ))}
          </View>

          <Txt variant="micro" tone="muted" style={{ marginTop: spacing.xxxl, letterSpacing: 1 }}>
            INTERACTIVE PROTOTYPE · MOCK DATA · NOT A MEDICAL DEVICE
          </Txt>
        </View>

        <View style={{ transform: [{ scale }] }}>
          <View style={styles.device}>
            <View style={styles.screen}>{children}</View>
            <View style={styles.notch} pointerEvents="none" />
            <View style={styles.homeIndicator} pointerEvents="none" />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stageInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 72,
    paddingHorizontal: 48,
    maxWidth: 1320,
  },
  pitch: { flexShrink: 1, maxWidth: 520 },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.blue,
    marginTop: 6,
  },
  device: {
    width: DEVICE_W + 22,
    height: DEVICE_H + 22,
    borderRadius: 58,
    backgroundColor: '#0E1B2C',
    padding: 11,
    shadowColor: '#0B2545',
    shadowOpacity: 0.28,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 30 },
  },
  screen: {
    flex: 1,
    borderRadius: 47,
    overflow: 'hidden',
    backgroundColor: palette.canvas,
  },
  notch: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    width: 116,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: '#0E1B2C',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 130,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(11,37,69,0.35)',
  },
});
