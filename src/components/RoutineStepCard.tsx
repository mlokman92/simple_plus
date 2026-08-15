import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { getProduct } from '@/data/products';
import { palette, radius, spacing } from '@/theme';
import type { RoutineStep } from '@/types';
import { ProductTile } from '@/components/brand/ProductArt';
import { Card, Row, Tap, Txt } from '@/components/ui';
import { success as hapticSuccess } from '@/lib/haptics';

/**
 * One step of the routine with a tick target. Used by both the Home preview
 * and the full Routine tab, so the check behaviour stays identical.
 */
export function RoutineStepCard({
  step,
  done,
  onToggle,
  showNote = true,
  index,
}: {
  step: RoutineStep;
  done: boolean;
  onToggle: () => void;
  showNote?: boolean;
  index?: number;
}) {
  const router = useRouter();
  const product = getProduct(step.productId);
  if (!product) return null;

  return (
    <Card padding={spacing.md} style={done ? styles.doneCard : undefined}>
      <Row gap={spacing.md} align="flex-start">
        <Tap
          onPress={() => {
            if (!done) hapticSuccess();
            onToggle();
          }}
          haptic={false}
          scaleTo={0.86}
        >
          <View style={[styles.check, done && styles.checkDone]}>
            {done ? (
              <Ionicons name="checkmark" size={17} color={palette.white} />
            ) : (
              <Txt variant="label" tone="muted">
                {index ?? step.order}
              </Txt>
            )}
          </View>
        </Tap>

        <Tap
          onPress={() => router.push(`/product/${product.id}`)}
          scaleTo={0.99}
          style={{ flex: 1 }}
        >
          <Row gap={spacing.md} align="center">
            <ProductTile
              category={product.category}
              tint={product.tint}
              size={52}
              id={`rs-${step.id}`}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt
                variant="h4"
                numberOfLines={1}
                style={done ? styles.strike : undefined}
                tone={done ? 'muted' : 'default'}
              >
                {product.name}
              </Txt>
              <Row gap={spacing.sm}>
                <Row gap={3}>
                  <Ionicons name="time-outline" size={11} color={palette.textMuted} />
                  <Txt variant="micro" tone="muted">
                    {step.scheduledAt}
                  </Txt>
                </Row>
                <Txt variant="micro" tone="muted">
                  · {step.durationSec}s
                </Txt>
                {step.cadence ? (
                  <Txt variant="micro" tone="brand">
                    · {step.cadence}
                  </Txt>
                ) : null}
              </Row>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
          </Row>
        </Tap>
      </Row>

      {showNote && !done ? (
        <View style={styles.note}>
          <Row gap={6} align="flex-start">
            <Ionicons name="chatbubble-ellipses-outline" size={12} color={palette.blueDeep} />
            <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
              {step.coachNote}
            </Txt>
          </Row>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  doneCard: { backgroundColor: palette.canvasSoft, borderColor: palette.border },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  checkDone: { backgroundColor: palette.good, borderColor: palette.good },
  strike: { textDecorationLine: 'line-through' },
  note: {
    marginTop: spacing.md,
    backgroundColor: palette.blueTint,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
});
