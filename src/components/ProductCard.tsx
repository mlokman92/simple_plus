import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { CATEGORY_LABEL } from '@/data/products';
import { myr } from '@/lib/format';
import { palette, radius, spacing } from '@/theme';
import type { Product } from '@/types';
import { ProductTile } from '@/components/brand/ProductArt';
import { Badge, Card, Row, Txt } from '@/components/ui';

/** Full-width product row — shop lists, routine detail, derm suggestions. */
export function ProductCard({
  product,
  onPress,
  right,
  showWhy = false,
  style,
}: {
  product: Product;
  onPress?: () => void;
  right?: React.ReactNode;
  showWhy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const router = useRouter();
  const go = onPress ?? (() => router.push(`/product/${product.id}`));

  return (
    <Card onPress={go} padding={spacing.md} style={style}>
      <Row gap={spacing.md} align="flex-start">
        <ProductTile
          category={product.category}
          tint={product.tint}
          size={68}
          id={`pc-${product.id}`}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <Row justify="space-between" align="flex-start">
            <Txt variant="micro" tone="muted">
              {product.brand.toUpperCase()} · {CATEGORY_LABEL[product.category].toUpperCase()}
            </Txt>
            {right}
          </Row>
          <Txt variant="h4" numberOfLines={2}>
            {product.name}
          </Txt>
          <Row gap={spacing.sm} wrap style={{ marginTop: 2 }}>
            <Row gap={3}>
              <Ionicons name="sparkles" size={11} color={palette.blue} />
              <Txt variant="micro" tone="brand">
                {product.matchScore}% MATCH
              </Txt>
            </Row>
            {product.halalCertified ? <Badge label="Halal" tone="halal" /> : null}
          </Row>
          <Row justify="space-between" style={{ marginTop: 4 }}>
            <Txt variant="bodyStrong">
              {myr(product.price)}{' '}
              <Txt variant="caption" tone="muted">
                · {product.size}
              </Txt>
            </Txt>
            <Row gap={3}>
              <Ionicons name="star" size={11} color={palette.warn} />
              <Txt variant="caption" tone="secondary">
                {product.rating} ({product.reviewCount.toLocaleString()})
              </Txt>
            </Row>
          </Row>
        </View>
      </Row>

      {showWhy ? (
        <View style={styles.why}>
          <Row gap={6} align="flex-start">
            <Ionicons name="bulb-outline" size={13} color={palette.blueDeep} />
            <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
              {product.whyPicked}
            </Txt>
          </Row>
        </View>
      ) : null}
    </Card>
  );
}

/** Compact card for horizontal carousels. */
export function ProductMini({
  product,
  width = 132,
  caption,
  badge,
  done,
  onPress,
}: {
  product: Product;
  width?: number;
  caption?: string;
  badge?: React.ReactNode;
  done?: boolean;
  onPress?: () => void;
}) {
  const router = useRouter();
  const go = onPress ?? (() => router.push(`/product/${product.id}`));

  return (
    <Card onPress={go} padding={spacing.sm + 2} style={{ width }}>
      <View style={styles.miniArt}>
        <ProductTile
          category={product.category}
          tint={product.tint}
          size={width - 34}
          id={`pm-${product.id}`}
        />
        {done ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={12} color={palette.white} />
          </View>
        ) : null}
        {badge ? <View style={styles.miniBadge}>{badge}</View> : null}
      </View>
      <Txt variant="label" numberOfLines={2} style={{ marginTop: spacing.sm, minHeight: 34 }}>
        {product.name}
      </Txt>
      {caption ? (
        <Txt variant="micro" tone="muted" numberOfLines={1}>
          {caption}
        </Txt>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  why: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  miniArt: { alignItems: 'center', justifyContent: 'center' },
  check: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.good,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surface,
  },
  miniBadge: { position: 'absolute', bottom: -2, left: -2 },
  pill: { borderRadius: radius.round },
});
