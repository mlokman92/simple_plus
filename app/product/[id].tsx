import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ProductArt } from '@/components/brand/ProductArt';
import { ScoreRing } from '@/components/charts';
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
  SectionHeader,
  Txt,
} from '@/components/ui';
import { CATEGORY_LABEL, getProduct } from '@/data/products';
import { ROUTINE } from '@/data/routine';
import { CONCERN_BY_KEY } from '@/data/taxonomy';
import { myr } from '@/lib/format';
import { useInsets } from '@/lib/frame';
import { success as hapticSuccess } from '@/lib/haptics';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { Product, TimeOfDay } from '@/types';

/* ------------------------------------------------------------------ */
/* Ingredient explanations — written for this app, kept factual.       */
/* ------------------------------------------------------------------ */

const INGREDIENT_NOTE: Record<string, string> = {
  'Centella Asiatica': 'Calms visible redness and speeds up barrier recovery after irritation.',
  Glycerin: 'A humectant — pulls water into the upper layers and holds it there.',
  Panthenol: 'Pro-vitamin B5. Takes the tight feeling out of a post-cleanse face.',
  '5% Niacinamide': 'Regulates sebum and fades post-acne marks. 5% is potent without stinging.',
  'Ceramide NP': 'Replaces the exact lipid your barrier loses when it is stressed.',
  Madecassoside: 'The isolated calming fraction of centella — aimed straight at flushing.',
  'Hyaluronic Acid': 'Binds many times its weight in water without adding any weight to the skin.',
  Squalane: 'A light, non-comedogenic emollient that seals hydration in without shine.',
  'Beta-Glucan': 'A soothing hydrator that layers cleanly under sunscreen — no pilling.',
  'Tinosorb S': 'Broad-spectrum UVA and UVB filter, photostable in tropical midday sun.',
  'Uvinul A Plus': 'Dedicated UVA filter — the half of the spectrum behind pigment and ageing.',
  'Vitamin E': 'Antioxidant that also stabilises the filters and oils around it.',
  '2% Salicylic Acid': 'Oil-soluble, so it clears the pore lining from the inside rather than the surface.',
  'Zinc PCA': 'Dials down sebum production at the exact spot you apply it.',
  'Azelaic Acid': 'Works on the brown mark a spot leaves behind, not just the spot.',
  'Rice Ferment Filtrate': 'Fermented amino acids — adds slip and a soft, lit-from-within finish.',
  Allantoin: 'A quiet soother. Smooths roughness without using an acid to do it.',
  Trehalose: 'A sugar humectant that keeps holding water in dry, air-conditioned air.',
  Gluconolactone: 'A PHA. Larger molecules mean slower, gentler exfoliation than an AHA.',
  'Lactobionic Acid': 'A PHA that exfoliates and hydrates in the same pass.',
  'Green Tea': 'Polyphenol antioxidant that offsets the sting of exfoliating.',
  'Kaolin Clay': 'Absorbs surface oil without stripping the barrier underneath.',
  Niacinamide: 'Regulates sebum and fades post-acne marks over roughly eight weeks.',
  'Tea Tree': 'Antibacterial on congestion — effective, and easy to overdo.',
  '12% THD Ascorbate': 'An oil-soluble vitamin C. More stable and far less stingy than L-ascorbic.',
  'Ferulic Acid': 'Stabilises vitamin C and extends how long it keeps working.',
  'Ceramide Complex': 'Rebuilds the lipid mortar between skin cells while you sleep.',
  Cholesterol: 'The third lipid a barrier needs, alongside ceramides and fatty acids.',
  Peptides: 'Signal molecules that support firmness over months, not days.',
  'Camellia Oil': 'Dissolves SPF and sebum, then rinses clean without a film.',
  'Sunflower Seed Oil': 'High in linoleic acid, which acne-prone skin generally tolerates well.',
  '0.05% Retinal': 'One conversion step from retinoic acid — faster acting than retinol.',
  Bakuchiol: 'A plant-derived retinol alternative that buffers the retinal beside it.',
};

const TOD_LABEL: Record<TimeOfDay, string> = {
  am: 'morning',
  pm: 'evening',
  weekly: 'weekly',
};

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id ?? '');
  if (!product) return <NotFound id={id} />;
  return <ProductDetail product={product} />;
}

function NotFound({ id }: { id?: string }) {
  const router = useRouter();
  return (
    <Screen header={<AppHeader title="Product" />} padBottom={60}>
      <View style={styles.notFound}>
        <View style={styles.notFoundIcon}>
          <Ionicons name="cube-outline" size={28} color={palette.textMuted} />
        </View>
        <Txt variant="h3" center style={{ marginTop: spacing.lg }}>
          Product not found
        </Txt>
        <Txt variant="bodySm" tone="secondary" center style={{ marginTop: spacing.xs }}>
          {id ? `Nothing in the catalogue matches “${id}”.` : 'No product was requested.'} It may
          have been swapped out of your routine.
        </Txt>
        <View style={{ marginTop: spacing.xl, width: '100%' }}>
          <Button
            label="Back to the shelf"
            icon="bag-handle-outline"
            onPress={() => router.replace('/shop')}
          />
        </View>
        <View style={{ marginTop: spacing.md, width: '100%' }}>
          <Button
            label="Go back"
            variant="ghost"
            icon="chevron-back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          />
        </View>
      </View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const insets = useInsets();
  const { isSaved, dispatch } = useApp();

  const saved = isSaved(product.id);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastA = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef<Animated.CompositeAnimation | null>(null);

  const showToast = useCallback(
    (message: string) => {
      // Stop any in-flight toast first, otherwise the previous sequence's
      // fade-out fires mid-way through this one and hides it early.
      toastAnim.current?.stop();
      toastA.setValue(0);
      setToast(message);

      const anim = Animated.sequence([
        Animated.timing(toastA, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1900),
        Animated.timing(toastA, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]);
      toastAnim.current = anim;
      anim.start(({ finished }) => {
        if (!finished) return;
        toastAnim.current = null;
        setToast(null);
      });
    },
    [toastA],
  );

  // Never leave an animation running after the screen goes away.
  useEffect(() => () => toastAnim.current?.stop(), []);

  const routineStep = ROUTINE.find((s) => s.productId === product.id);
  const retailers = product.availableAt.split(',').map((r) => r.trim()).filter(Boolean);

  return (
    <View style={styles.fill}>
      <Screen
        padBottom={150}
        header={
          <AppHeader
            title={product.brand}
            subtitle={CATEGORY_LABEL[product.category]}
            right={
              <IconButton
                icon="share-outline"
                size={38}
                onPress={() => showToast('Link copied — share it with anyone.')}
              />
            }
          />
        }
      >
        {/* ---- Hero ---------------------------------------------------- */}
        <Enter>
          <View style={styles.plinthWrap}>
            <LinearGradient
              colors={[`${product.tint[0]}55`, `${product.tint[1]}1F`, palette.surface]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.plinth}
            >
              <View style={styles.matchPill}>
                <Ionicons name="sparkles" size={11} color={palette.blueDeep} />
                <Txt variant="micro" color={palette.blueDeep}>
                  {product.matchScore}% MATCH
                </Txt>
              </View>
              <View style={styles.plinthShadow} />
              <FloatArt product={product} />
            </LinearGradient>
          </View>
        </Enter>

        {/* ---- Title --------------------------------------------------- */}
        <Enter delay={70}>
          <Txt variant="micro" tone="muted" style={{ marginTop: spacing.xl }}>
            {product.brand.toUpperCase()} · {CATEGORY_LABEL[product.category].toUpperCase()}
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.xs }}>
            {product.name}
          </Txt>

          <Row justify="space-between" align="flex-end" style={{ marginTop: spacing.md }}>
            <Row gap={spacing.sm} align="baseline">
              <Txt variant="h2">{myr(product.price)}</Txt>
              <Txt variant="caption" tone="muted">
                {product.size} · {myr(Number((product.price / parseSize(product.size)).toFixed(2)))}
                /ml
              </Txt>
            </Row>
          </Row>

          <Row gap={spacing.sm} style={{ marginTop: spacing.md }}>
            <Stars value={product.rating} />
            <Txt variant="bodySm" tone="secondary">
              {product.rating.toFixed(1)}
            </Txt>
            <Txt variant="caption" tone="muted">
              {product.reviewCount.toLocaleString()} verified reviews
            </Txt>
          </Row>

          <Row gap={spacing.sm} wrap style={{ marginTop: spacing.md }}>
            {product.halalCertified ? (
              <Badge label="JAKIM halal" tone="halal" icon="ribbon-outline" />
            ) : (
              <Badge label="Not halal certified" tone="warn" icon="alert-circle-outline" />
            )}
            {product.dermTested ? (
              <Badge label="Derm tested" tone="good" icon="shield-checkmark-outline" />
            ) : null}
            {product.fragranceFree ? (
              <Badge label="Fragrance free" tone="brand" icon="flower-outline" />
            ) : (
              <Badge label="Contains fragrance" tone="neutral" icon="flower-outline" />
            )}
            {routineStep ? (
              <Badge
                label={`In your ${TOD_LABEL[routineStep.timeOfDay]}`}
                tone="premium"
                icon="checkmark-circle"
              />
            ) : null}
          </Row>
        </Enter>

        {/* ---- Match --------------------------------------------------- */}
        <Enter delay={130}>
          <Card tone="tinted" padding={spacing.lg} style={{ marginTop: spacing.xl }}>
            <Row gap={spacing.lg} align="center">
              <ScoreRing
                score={product.matchScore}
                size={76}
                strokeWidth={8}
                gradientId="pdpMatch"
                label="% match"
                track={palette.white}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt variant="label" color={palette.blueDeep}>
                  WHY WE PICKED THIS FOR YOU
                </Txt>
                <Txt variant="bodySm" tone="secondary">
                  {product.whyPicked}
                </Txt>
              </View>
            </Row>
            <Divider style={{ marginVertical: spacing.md, backgroundColor: palette.blueTintStrong }} />
            <Txt variant="micro" tone="muted">
              SCORED AGAINST YOUR LAST 12 WEEKLY SCANS · NOT A PAID PLACEMENT
            </Txt>
          </Card>
        </Enter>

        {/* ---- Key ingredients ----------------------------------------- */}
        <Enter delay={180}>
          <SectionHeader title="Key ingredients" style={{ marginTop: spacing.xxl }} />
          <View style={{ gap: spacing.sm }}>
            {product.keyIngredients.map((ing, i) => (
              <Card key={ing} padding={spacing.md} elevation="none" tone="outline">
                <Row gap={spacing.md} align="flex-start">
                  <View style={styles.ingDot}>
                    <Txt variant="micro" color={palette.blueDeep}>
                      {String(i + 1).padStart(2, '0')}
                    </Txt>
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Txt variant="bodyStrong">{ing}</Txt>
                    <Txt variant="caption" tone="secondary">
                      {INGREDIENT_NOTE[ing] ?? 'Supporting ingredient in this formula.'}
                    </Txt>
                  </View>
                </Row>
              </Card>
            ))}
          </View>
          <Txt variant="micro" tone="muted" style={{ marginTop: spacing.sm }}>
            FULL INCI LIST ON THE CARTON · PATCH TEST NEW ACTIVES FOR 3 NIGHTS
          </Txt>
        </Enter>

        {/* ---- Targets -------------------------------------------------- */}
        <Enter delay={220}>
          <SectionHeader title="What it targets" style={{ marginTop: spacing.xxl }} />
          <Row gap={spacing.sm} wrap>
            {product.targets.map((t) => {
              const concern = CONCERN_BY_KEY[t];
              return <Chip key={t} label={concern.label} emoji={concern.emoji} />;
            })}
          </Row>
        </Enter>

        {/* ---- Benefits ------------------------------------------------- */}
        <Enter delay={260}>
          <SectionHeader title="Benefits" style={{ marginTop: spacing.xxl }} />
          <Card padding={spacing.lg}>
            <View style={{ gap: spacing.md }}>
              {product.benefits.map((b) => (
                <Row key={b} gap={spacing.md} align="flex-start">
                  <Ionicons name="checkmark-circle" size={17} color={palette.good} />
                  <Txt variant="bodySm" style={{ flex: 1 }}>
                    {b}
                  </Txt>
                </Row>
              ))}
            </View>
          </Card>
        </Enter>

        {/* ---- Where to buy --------------------------------------------- */}
        <Enter delay={300}>
          <SectionHeader title="Where to buy" style={{ marginTop: spacing.xxl }} />
          <Card padding={0}>
            {retailers.map((r, i) => (
              <View key={r}>
                {i > 0 ? <Divider /> : null}
                <Row justify="space-between" style={styles.retailRow}>
                  <Row gap={spacing.md}>
                    <View style={styles.retailIcon}>
                      <Ionicons
                        name={retailIcon(r)}
                        size={15}
                        color={palette.blueDeep}
                      />
                    </View>
                    <View>
                      <Txt variant="bodyStrong">{r}</Txt>
                      <Txt variant="micro" tone="muted">
                        {retailNote(r)}
                      </Txt>
                    </View>
                  </Row>
                  <Txt variant="bodySm" tone="secondary">
                    {myr(product.price)}
                  </Txt>
                </Row>
              </View>
            ))}
            <Divider />
            <View style={styles.retailFoot}>
              <Row gap={spacing.sm} align="flex-start">
                <Ionicons name="information-circle-outline" size={14} color={palette.textMuted} />
                <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
                  Indicative Malaysian retail pricing. Simple+ earns no commission and does not
                  hold stock — you buy from the retailer directly.
                </Txt>
              </Row>
            </View>
          </Card>
        </Enter>

        {/* ---- Coaching note -------------------------------------------- */}
        {routineStep ? (
          <Enter delay={340}>
            <Card tone="sunken" padding={spacing.lg} elevation="none" style={{ marginTop: spacing.lg }}>
              <Row gap={spacing.sm}>
                <Ionicons name="time-outline" size={14} color={palette.blueDeep} />
                <Txt variant="label" color={palette.blueDeep}>
                  STEP {routineStep.order} · {routineStep.scheduledAt.toUpperCase()}
                </Txt>
              </Row>
              <Txt variant="bodySm" tone="secondary" style={{ marginTop: spacing.sm }}>
                {routineStep.coachNote}
              </Txt>
            </Card>
          </Enter>
        ) : null}
      </Screen>

      {/* ---- Toast --------------------------------------------------- */}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              top: insets.top + 62,
              opacity: toastA,
              transform: [
                { translateY: toastA.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={15} color={palette.white} />
          <Txt variant="label" tone="onBrand">
            {toast}
          </Txt>
        </Animated.View>
      ) : null}

      {/* ---- Sticky bar ---------------------------------------------- */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Row gap={spacing.md}>
          <IconButton
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            size={52}
            tone={saved ? 'tint' : 'surface'}
            color={saved ? palette.blue : palette.inkSoft}
            onPress={() => {
              dispatch({ type: 'toggleSaved', id: product.id });
              showToast(saved ? 'Removed from saved' : 'Saved to your shelf');
            }}
          />
          <View style={{ flex: 1 }}>
            {routineStep ? (
              <Button
                label={`In your ${TOD_LABEL[routineStep.timeOfDay]} routine`}
                variant="secondary"
                icon="checkmark-circle"
                onPress={() => router.push('/(tabs)/routine')}
              />
            ) : (
              <Button
                label={added ? 'Added to your routine' : 'Add to routine'}
                variant={added ? 'secondary' : 'primary'}
                icon={added ? 'checkmark-circle' : 'add'}
                onPress={() => {
                  if (added) {
                    router.push('/(tabs)/routine');
                    return;
                  }
                  hapticSuccess();
                  setAdded(true);
                  showToast('Queued for tonight — review it in Routine');
                }}
              />
            )}
          </View>
        </Row>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/** Slow bob so the hero bottle reads as a rendered object, not a flat asset. */
function FloatArt({ product }: { product: Product }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [4, -6] }) }],
      }}
    >
      <ProductArt
        category={product.category}
        tint={product.tint}
        size={168}
        id={`pdp-${product.id}`}
      />
    </Animated.View>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <Row gap={2}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name: keyof typeof Ionicons.glyphMap =
          value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={i} name={name} size={13} color={palette.warn} />;
      })}
    </Row>
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
      duration: 430,
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
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
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
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "150ml" -> 150. Falls back to 1 so the per-ml line never divides by zero. */
function parseSize(size: string): number {
  const n = parseFloat(size);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function retailIcon(name: string): keyof typeof Ionicons.glyphMap {
  const n = name.toLowerCase();
  if (n.includes('shopee') || n.includes('lazada') || n.includes('tiktok')) return 'phone-portrait-outline';
  if (n.includes('brand site')) return 'globe-outline';
  return 'storefront-outline';
}

function retailNote(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('watsons')) return 'IN STOCK · 240+ STORES NATIONWIDE';
  if (n.includes('guardian')) return 'IN STOCK · MEMBER POINTS APPLY';
  if (n.includes('sephora')) return 'IN STOCK · PAVILION & MID VALLEY';
  if (n.includes('shopee')) return 'ONLINE · FREE SHIPPING OVER RM40';
  if (n.includes('lazada')) return 'ONLINE · NEXT-DAY IN KLANG VALLEY';
  if (n.includes('tiktok')) return 'ONLINE · LIVE SELLER PRICING VARIES';
  if (n.includes('brand site')) return 'ONLINE · DIRECT FROM THE BRAND';
  return 'AVAILABILITY VARIES BY OUTLET';
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  fill: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.giant },
  notFoundIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  plinthWrap: { marginTop: spacing.sm, borderRadius: radius.xxl, overflow: 'hidden' },
  plinth: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  plinthShadow: {
    position: 'absolute',
    bottom: 34,
    width: 116,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.ink,
    opacity: 0.08,
  },
  matchPill: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: palette.blueTintStrong,
  },
  ingDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retailRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  retailIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retailFoot: { padding: spacing.md },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.inkSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.round,
    maxWidth: '88%',
    ...shadow.raised,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
