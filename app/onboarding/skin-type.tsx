import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card, IconButton, Row, Screen, StepDots, Tap, Txt } from '@/components/ui';
import { SKIN_TYPES } from '@/data/taxonomy';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { SkinType } from '@/types';

/** Extra evidence line per type so the list reads like a clinic, not a quiz. */
const TELL: Record<SkinType, string> = {
  normal: 'Comfortable two hours after cleansing, no shine, no tightness',
  dry: 'Flakes around the nose, makeup clings to dry patches',
  oily: 'Blotting paper comes away wet by lunchtime',
  combination: 'Shiny forehead and nose, cheeks still feel tight',
  sensitive: 'Turns pink in the shower, new actives sting for a day',
};

export default function SkinTypeStep() {
  const router = useRouter();
  const { profile, dispatch } = useApp();

  const [selected, setSelected] = useState<SkinType | null>(profile.skinType);
  const [deferred, setDeferred] = useState(false);

  const choose = useCallback((key: SkinType) => {
    setDeferred(false);
    setSelected(key);
  }, []);

  const chooseDeferred = useCallback(() => {
    setDeferred((prev) => {
      const next = !prev;
      if (next) setSelected(null);
      return next;
    });
  }, []);

  const onNext = useCallback(() => {
    if (selected && !deferred) dispatch({ type: 'setSkinType', skinType: selected });
    router.push('/onboarding/goals');
  }, [deferred, dispatch, router, selected]);

  const canContinue = deferred || selected !== null;

  return (
    <Screen scroll={false} gutter={0} header={<StepHeader />}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <FadeSlide delay={0}>
          <Txt variant="micro" tone="brand" style={styles.eyebrow}>
            STEP 2 OF 4 · SKIN TYPE
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm }}>
            How does your skin usually behave?
          </Txt>
          <Txt variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
            Think about two hours after cleansing, with nothing on your face. One answer.
          </Txt>
        </FadeSlide>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {SKIN_TYPES.map((option, i) => {
            const active = !deferred && selected === option.key;
            return (
              <FadeSlide key={option.key} delay={80 + i * 60}>
                <Tap onPress={() => choose(option.key)} scaleTo={0.98}>
                  <View
                    style={[styles.row, active ? styles.rowActive : styles.rowIdle]}
                  >
                    <View
                      style={[styles.emojiBubble, active && { backgroundColor: palette.white }]}
                    >
                      <Txt variant="h3" style={styles.emoji}>
                        {option.emoji}
                      </Txt>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Row gap={spacing.sm}>
                        <Txt variant="h4">{option.label}</Txt>
                        {option.key === 'combination' ? (
                          <Badge label="Common in KL" tone="brand" />
                        ) : null}
                      </Row>
                      <Txt variant="caption" tone="secondary" style={{ marginTop: 1 }}>
                        {option.blurb}
                      </Txt>
                      <Txt variant="caption" tone="muted" style={{ marginTop: 3 }}>
                        {TELL[option.key]}
                      </Txt>
                    </View>

                    <View style={[styles.radio, active && styles.radioOn]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                  </View>
                </Tap>
              </FadeSlide>
            );
          })}
        </View>

        <FadeSlide delay={440} style={{ marginTop: spacing.lg }}>
          <Tap onPress={chooseDeferred} scaleTo={0.98}>
            <Card
              tone={deferred ? 'tinted' : 'sunken'}
              padding={spacing.lg}
              elevation="none"
              style={deferred ? styles.deferOn : styles.deferOff}
            >
              <Row gap={spacing.md} align="flex-start">
                <View style={[styles.aiBubble, deferred && { backgroundColor: palette.green }]}>
                  <Ionicons
                    name={deferred ? 'checkmark' : 'help-circle-outline'}
                    size={16}
                    color={palette.white}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="h4">Not sure? Let the AI decide.</Txt>
                  <Txt variant="caption" tone="secondary" style={{ marginTop: 3 }}>
                    Your first scan measures sebum and moisture across five zones — forehead,
                    nose, both cheeks and chin — then sets your type for you. It is usually
                    more accurate than self-reporting.
                  </Txt>
                </View>
              </Row>
            </Card>
          </Tap>
        </FadeSlide>

        <Row gap={6} justify="center" style={{ marginTop: spacing.lg }}>
          <Ionicons name="people-outline" size={12} color={palette.textMuted} />
          <Txt variant="micro" tone="muted">
            41% OF OUR KLANG VALLEY BETA REPORT COMBINATION SKIN
          </Txt>
        </Row>
      </ScrollView>

      <View style={styles.footer}>
        <Row justify="space-between" style={{ marginBottom: spacing.md }}>
          <Txt variant="caption" tone={canContinue ? 'brand' : 'muted'}>
            {deferred
              ? 'We will set this from your first scan'
              : selected
                ? `${SKIN_TYPES.find((t) => t.key === selected)?.label ?? ''} selected`
                : 'Choose one to continue'}
          </Txt>
          <Txt variant="caption" tone="muted">
            Step 2 of 4
          </Txt>
        </Row>
        <Button
          label="Next"
          size="lg"
          iconRight="arrow-forward"
          disabled={!canContinue}
          onPress={onNext}
        />
      </View>
    </Screen>
  );
}

function StepHeader() {
  const router = useRouter();
  return (
    <Row justify="space-between" style={styles.header}>
      <IconButton
        icon="chevron-back"
        size={38}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/onboarding/concerns')
        }
      />
      <StepDots total={4} index={1} />
      <View style={{ width: 38 }} />
    </Row>
  );
}

function FadeSlide({
  delay,
  children,
  style,
}: {
  delay: number;
  children: React.ReactNode;
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
        style,
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  scroll: { flex: 1 },
  scrollBody: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  eyebrow: { letterSpacing: 1.1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  rowIdle: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    ...shadow.card,
  },
  rowActive: {
    backgroundColor: palette.blueTint,
    borderColor: palette.blue,
    ...shadow.card,
  },
  emojiBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20, lineHeight: 26 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: palette.blue, borderWidth: 2 },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: palette.blue,
  },
  aiBubble: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: palette.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deferOff: { borderStyle: 'dashed', borderColor: palette.borderStrong, borderWidth: 1.5 },
  deferOn: { borderColor: palette.green, borderWidth: 1.5 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.canvasSoft,
  },
});
