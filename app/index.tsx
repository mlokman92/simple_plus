import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { LogoMark } from '@/components/brand/Logo';
import { Txt } from '@/components/ui';
import { useApp } from '@/store/AppStore';
import { palette, spacing } from '@/theme';

/** Splash — mirrors frame 02 of the storyboard, then hands off to onboarding. */
export default function Splash() {
  const router = useRouter();
  const { onboardingComplete } = useApp();

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(24)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const wordFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(wordFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const t = setTimeout(() => {
      router.replace(onboardingComplete ? '/(tabs)/home' : '/onboarding');
    }, 2300);
    return () => clearTimeout(t);
  }, [router, onboardingComplete, fade, lift, glow, wordFade]);

  const haloScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const haloOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.08] });

  return (
    <LinearGradient
      colors={['#E4F0FC', '#F6FBFF', '#E9F3FD']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fill}
    >
      <View style={styles.center}>
        <Animated.View
          style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        />
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          <LogoMark size={96} />
        </Animated.View>

        <Animated.View style={{ opacity: wordFade, alignItems: 'center' }}>
          <Txt variant="display" style={styles.word}>
            Simple
            <Txt variant="display" tone="brand" style={styles.word}>
              +
            </Txt>
          </Txt>
          <Txt variant="label" tone="secondary" style={styles.tagline}>
            Skin. Predictive. Personalised.
          </Txt>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: wordFade }]}>
        <Dots />
        <Txt variant="micro" tone="muted" style={{ marginTop: spacing.md, letterSpacing: 1 }}>
          PROTOTYPE · MOCK DATA
        </Txt>
      </Animated.View>
    </LinearGradient>
  );
}

function Dots() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(a, { toValue: 3, duration: 1200, useNativeDriver: true, easing: Easing.linear }),
    ).start();
  }, [a]);
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: a.interpolate({
                inputRange: [i - 0.6, i, i + 0.6, 3],
                outputRange: [0.25, 1, 0.25, 0.25],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  halo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: palette.blueBright,
    top: '50%',
    marginTop: -170,
  },
  word: { fontSize: 44, lineHeight: 52, letterSpacing: -1.6 },
  tagline: { marginTop: spacing.xs, letterSpacing: 0.6 },
  footer: { alignItems: 'center', paddingBottom: spacing.giant },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.blue },
});
