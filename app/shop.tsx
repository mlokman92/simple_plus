import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ProductCard } from '@/components/ProductCard';
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Row,
  Screen,
  Tap,
  Txt,
} from '@/components/ui';
import { CATEGORY_LABEL, PRODUCTS } from '@/data/products';
import { myr } from '@/lib/format';
import { select as hapticSelect } from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { palette, radius, spacing, type as typeScale } from '@/theme';
import type { Product, ProductCategory } from '@/types';

type CategoryFilter = 'all' | ProductCategory;

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  ...(Object.keys(CATEGORY_LABEL) as ProductCategory[]).map((key) => ({
    key,
    label: CATEGORY_LABEL[key],
  })),
];

const NON_HALAL_COUNT = PRODUCTS.filter((p) => !p.halalCertified).length;

/* ------------------------------------------------------------------ */

export default function ShopScreen() {
  const router = useRouter();
  const { halalOnly, dispatch, isSaved, savedProductIds } = useApp();

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  const visible = useMemo<Product[]>(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (halalOnly && !p.halalCertified) return false;
      if (savedOnly && !savedProductIds.includes(p.id)) return false;
      if (q.length === 0) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        CATEGORY_LABEL[p.category].toLowerCase().includes(q) ||
        p.keyIngredients.some((i) => i.toLowerCase().includes(q))
      );
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [category, halalOnly, query, savedOnly, savedProductIds]);

  const filtered = category !== 'all' || halalOnly || savedOnly || query.trim().length > 0;
  const cheapest = visible.length > 0 ? Math.min(...visible.map((p) => p.price)) : 0;

  const clearAll = () => {
    setCategory('all');
    setQuery('');
    setSavedOnly(false);
    dispatch({ type: 'setHalalOnly', value: false });
  };

  return (
    <Screen
      padBottom={60}
      header={
        <AppHeader
          title="Recommended for you"
          subtitle={`${PRODUCTS.length} products screened for your skin`}
          right={
            <IconButton
              icon={savedOnly ? 'bookmark' : 'bookmark-outline'}
              size={38}
              tone={savedOnly ? 'brand' : 'surface'}
              badge={!savedOnly && savedProductIds.length > 0}
              onPress={() => {
                hapticSelect();
                setSavedOnly((v) => !v);
              }}
            />
          }
        />
      }
    >
      {/* ---- Search -------------------------------------------------- */}
      <Enter>
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, brands, ingredients"
            placeholderTextColor={palette.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Tap onPress={() => setQuery('')} scaleTo={0.88} haptic={false}>
              <Ionicons name="close-circle" size={17} color={palette.textMuted} />
            </Tap>
          ) : null}
        </View>
      </Enter>

      {/* ---- Trust --------------------------------------------------- */}
      <Enter delay={60}>
        <Card tone="tinted" padding={spacing.lg} style={{ marginTop: spacing.md }}>
          <Row gap={spacing.md} align="flex-start">
            <View style={styles.trustIcon}>
              <Ionicons name="shield-checkmark" size={16} color={palette.blueDeep} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Txt variant="h4" color={palette.blueDeep}>
                Ranked by your skin, not by a media budget
              </Txt>
              <Txt variant="caption" tone="secondary">
                Every match score is computed from your 12 weeks of scan data and the concerns you
                logged — combination skin, post-acne marks, reactive barrier. No brand can pay to
                move up this list, and Simple+ takes no commission on what you buy.
              </Txt>
            </View>
          </Row>

          <Divider style={{ marginVertical: spacing.md, backgroundColor: palette.blueTintStrong }} />
          <Row justify="space-between">
            <TrustStat value="12" label="WEEKS OF DATA" />
            <TrustStat value={String(PRODUCTS.length)} label="SCREENED" />
            <TrustStat value="0" label="PAID SLOTS" />
          </Row>
        </Card>
      </Enter>

      {/* ---- Category filters ---------------------------------------- */}
      <Enter delay={110}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {CATEGORY_FILTERS.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              selected={category === c.key}
              onPress={() => {
                hapticSelect();
                setCategory(c.key);
              }}
            />
          ))}
        </ScrollView>

        <Row gap={spacing.sm} wrap style={{ marginTop: spacing.sm }}>
          <Chip
            label="Halal only"
            icon="ribbon-outline"
            tone="brand"
            selected={halalOnly}
            onPress={() => {
              hapticSelect();
              dispatch({ type: 'setHalalOnly', value: !halalOnly });
            }}
          />
          <Chip
            label={`Saved (${savedProductIds.length})`}
            icon="bookmark-outline"
            selected={savedOnly}
            onPress={() => {
              hapticSelect();
              setSavedOnly((v) => !v);
            }}
          />
          {filtered ? (
            <Chip label="Clear filters" icon="close" onPress={clearAll} />
          ) : null}
        </Row>
      </Enter>

      {/* ---- Result count -------------------------------------------- */}
      <Enter delay={150}>
        <Row justify="space-between" align="center" style={styles.countRow}>
          <Txt variant="label" tone="secondary">
            {visible.length} {visible.length === 1 ? 'product' : 'products'} · sorted by match
          </Txt>
          {visible.length > 0 ? (
            <Txt variant="micro" tone="muted">
              FROM {myr(cheapest).toUpperCase()}
            </Txt>
          ) : null}
        </Row>
      </Enter>

      {/* ---- List ----------------------------------------------------- */}
      {visible.length === 0 ? (
        <Enter delay={180}>
          <Card padding={spacing.xl} style={{ marginTop: spacing.md }}>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={24} color={palette.textMuted} />
              </View>
              <Txt variant="h4" center style={{ marginTop: spacing.lg }}>
                Nothing matches those filters
              </Txt>
              <Txt variant="bodySm" tone="secondary" center style={{ marginTop: spacing.xs }}>
                {savedOnly
                  ? 'You have not saved anything in this category yet. Tap the bookmark on any product to keep it here.'
                  : halalOnly
                    ? `Halal-only is on, which hides the ${NON_HALAL_COUNT} products in the catalogue without JAKIM certification.`
                    : 'Try a broader category, or search by an ingredient like niacinamide.'}
              </Txt>
              <View style={{ marginTop: spacing.lg, width: '100%' }}>
                <Button label="Clear filters" variant="secondary" icon="refresh" onPress={clearAll} />
              </View>
            </View>
          </Card>
        </Enter>
      ) : (
        <View style={styles.list}>
          {visible.map((p, i) => (
            <Enter key={p.id} delay={190 + i * 55}>
              <ProductCard
                product={p}
                showWhy={i === 0}
                right={
                  i === 0 ? (
                    <Badge label="Top match" tone="brand" icon="trophy-outline" />
                  ) : isSaved(p.id) ? (
                    <Ionicons name="bookmark" size={14} color={palette.blue} />
                  ) : undefined
                }
              />
            </Enter>
          ))}
        </View>
      )}

      {/* ---- Footer note ---------------------------------------------- */}
      {visible.length > 0 ? (
        <Enter delay={240}>
          <Card tone="sunken" elevation="none" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
            <Row gap={spacing.sm} align="flex-start">
              <Ionicons name="sparkles-outline" size={14} color={palette.textSecondary} />
              <Txt variant="caption" tone="secondary" style={{ flex: 1 }}>
                Scores update after every scan. Two products are deliberately held back until your
                barrier is ready — you will see them unlock in Routine.
              </Txt>
            </Row>
            <View style={{ marginTop: spacing.md }}>
              <Button
                label="See your routine"
                variant="ghost"
                iconRight="arrow-forward"
                onPress={() => router.push('/(tabs)/routine')}
              />
            </View>
          </Card>
        </Enter>
      ) : null}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Txt variant="h3" color={palette.blueDeep}>
        {value}
      </Txt>
      <Txt variant="micro" tone="muted">
        {label}
      </Txt>
    </View>
  );
}

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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: palette.text,
    fontFamily: typeScale.body.fontFamily,
    fontSize: typeScale.body.fontSize,
  },
  trustIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipScroll: { marginTop: spacing.lg, marginHorizontal: -spacing.xl },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  countRow: { marginTop: spacing.lg, marginBottom: spacing.sm },
  list: { gap: spacing.md },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
