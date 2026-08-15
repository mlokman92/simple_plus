import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ProductCard } from '@/components/ProductCard';
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Chip,
  DeltaPill,
  Divider,
  GradientCard,
  IconButton,
  Row,
  Screen,
  SectionHeader,
  Spacer,
  Txt,
  Tap,
} from '@/components/ui';
import { getProduct } from '@/data/products';
import { CONCERN_BY_KEY, GOALS, SKIN_TYPES } from '@/data/taxonomy';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, shadow, spacing } from '@/theme';
import type { Product } from '@/types';

/** Inline disclosures that have real copy but no destination screen. */
type SheetKey = 'help' | 'privacy' | 'about';

const SHEETS: Record<SheetKey, { title: string; body: string; foot: string }> = {
  help: {
    title: 'Help centre',
    body:
      'Scan troubleshooting, ingredient explainers, and a WhatsApp support line staffed 9:00 AM – 6:00 PM MYT. Most questions land on lighting: scan by a window, no direct sun, same time each week.',
    foot: 'The live help index is not wired into this prototype build.',
  },
  privacy: {
    title: 'Privacy & your face data',
    body:
      'In this prototype nothing leaves your device — the analysis runs against a mock model held in memory, and closing the tab clears it. At launch, scans are processed on Malaysian-hosted infrastructure and deleted after 90 days unless you pin them to your photo log.',
    foot: 'You can export or delete everything from Settings › Data.',
  },
  about: {
    title: 'About Simple+',
    body:
      'Skin. Predictive. Personalised. Built in Kuala Lumpur for humid, high-UV skin. Simple+ reads six skin signals from a photo, projects where they are heading, and adjusts your routine week by week.',
    foot: 'A wellness companion, not a medical device — see a dermatologist for anything that changes fast, bleeds, or hurts.',
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, score, scoreDelta, scans, savedProductIds, adherence, dispatch } = useApp();
  const [sheet, setSheet] = useState<SheetKey | null>(null);

  const skinType = useMemo(
    () => SKIN_TYPES.find((s) => s.key === profile.skinType),
    [profile.skinType],
  );
  const goals = useMemo(
    () => GOALS.filter((g) => profile.goals.includes(g.key)),
    [profile.goals],
  );
  const shelf = useMemo(
    () => savedProductIds.map((id) => getProduct(id)).filter((p): p is Product => p !== undefined),
    [savedProductIds],
  );

  const resetDemo = () => {
    dispatch({ type: 'reset' });
    router.replace('/');
  };

  const openSheet = (key: SheetKey) => setSheet((cur) => (cur === key ? null : key));

  return (
    <Screen
      padBottom={120}
      header={
        <AppHeader
          title="Profile"
          showBack={false}
          right={<IconButton icon="settings-outline" onPress={() => router.push('/settings')} />}
        />
      }
    >
      {/* ---- Hero -------------------------------------------------------- */}
      <Reveal delay={0}>
        <Card padding={spacing.lg + 2}>
          <Row gap={spacing.lg} align="center">
            <View>
              <LinearGradient
                colors={gradients.brand as unknown as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Txt variant="h2" color={palette.white}>
                  {profile.initials}
                </Txt>
              </LinearGradient>
              <View style={styles.avatarRing} pointerEvents="none" />
            </View>

            <View style={styles.heroText}>
              <Row justify="space-between" align="center">
                <Txt variant="h2" numberOfLines={1} style={styles.flex}>
                  {profile.name}
                </Txt>
                <Badge
                  label={profile.isPremium ? 'Premium' : 'Free plan'}
                  tone={profile.isPremium ? 'premium' : 'neutral'}
                  icon={profile.isPremium ? 'sparkles' : undefined}
                />
              </Row>
              <Txt variant="caption" tone="muted">
                Member since {profile.memberSince}
              </Txt>
              <Row gap={4} style={styles.cityRow}>
                <Ionicons name="location" size={12} color={palette.textSecondary} />
                <Txt variant="caption" tone="secondary">
                  {profile.city} · {profile.ageRange}
                </Txt>
              </Row>
            </View>
          </Row>

          <Divider style={styles.heroDivider} />

          <Row justify="space-between" align="stretch">
            <Stat label="Skin score" value={String(score)} accessory={<DeltaPill value={scoreDelta} />} />
            <VRule />
            <Stat
              label="Day streak"
              value={String(adherence.streakDays)}
              accessory={<Ionicons name="flame" size={13} color={palette.warn} />}
            />
            <VRule />
            <Stat
              label={scans.length === 1 ? 'Scan saved' : 'Scans saved'}
              value={String(scans.length)}
              accessory={<Ionicons name="scan" size={13} color={palette.blue} />}
            />
          </Row>
        </Card>
      </Reveal>

      {/* ---- Skin profile ------------------------------------------------ */}
      <Reveal delay={70}>
        <Spacer h={spacing.xxl} />
        <SectionHeader
          title="My skin profile"
          action="Edit"
          onAction={() => router.push('/onboarding/concerns')}
        />
        <Card padding={spacing.lg}>
          <Row gap={spacing.md} align="center">
            <View style={styles.emojiChip}>
              <Txt variant="h3">{skinType?.emoji ?? '🌗'}</Txt>
            </View>
            <View style={styles.flex}>
              <Txt variant="micro" tone="muted">
                SKIN TYPE
              </Txt>
              <Txt variant="h4">{skinType?.label ?? 'Combination'}</Txt>
              <Txt variant="caption" tone="secondary">
                {skinType?.blurb ?? 'Oily T-zone, dry cheeks'}
              </Txt>
            </View>
            <Badge label={`Age ${profile.ageRange}`} tone="brand" />
          </Row>

          <Divider style={styles.blockDivider} />

          <Txt variant="micro" tone="muted">
            CONCERNS · {profile.concerns.length} TRACKED
          </Txt>
          <Row gap={spacing.sm} wrap style={styles.chipRow}>
            {profile.concerns.map((key) => (
              <Chip
                key={key}
                label={CONCERN_BY_KEY[key].label}
                emoji={CONCERN_BY_KEY[key].emoji}
              />
            ))}
          </Row>

          <Divider style={styles.blockDivider} />

          <Txt variant="micro" tone="muted">
            GOALS · WHAT WE OPTIMISE FOR
          </Txt>
          <Row gap={spacing.sm} wrap style={styles.chipRow}>
            {goals.map((g) => (
              <Chip key={g.key} label={g.label} emoji={g.emoji} selected tone="brand" />
            ))}
          </Row>

          <View style={styles.noteRow}>
            <Ionicons name="pulse-outline" size={13} color={palette.blueDeep} />
            <Txt variant="caption" tone="secondary" style={styles.flex}>
              Your routine is rebuilt against these every Sunday. Last change: essence toner added
              3 Aug.
            </Txt>
          </View>
        </Card>
      </Reveal>

      {/* ---- Shelf ------------------------------------------------------- */}
      <Reveal delay={140}>
        <Spacer h={spacing.xxl} />
        <SectionHeader
          title="My shelf"
          action={shelf.length > 0 ? 'Shop' : undefined}
          onAction={() => router.push('/shop')}
        />
        {shelf.length === 0 ? (
          <Card tone="sunken" padding={spacing.xl} elevation="none">
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={20} color={palette.blue} />
            </View>
            <Spacer h={spacing.md} />
            <Txt variant="h4" center>
              Nothing saved yet
            </Txt>
            <Txt variant="bodySm" tone="secondary" center style={styles.emptyBody}>
              Tap the bookmark on any product to keep it here — handy when you are standing in the
              Watsons aisle deciding.
            </Txt>
            <Spacer h={spacing.lg} />
            <Button
              label="Browse the shop"
              variant="secondary"
              size="sm"
              icon="bag-handle-outline"
              onPress={() => router.push('/shop')}
            />
          </Card>
        ) : (
          <View style={styles.stack}>
            {shelf.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                right={
                  <IconButton
                    icon="bookmark"
                    size={30}
                    tone="ghost"
                    color={palette.blue}
                    onPress={() => dispatch({ type: 'toggleSaved', id: p.id })}
                  />
                }
              />
            ))}
            <Txt variant="caption" tone="muted" center>
              {shelf.length} saved · tap the bookmark to remove
            </Txt>
          </View>
        )}
      </Reveal>

      {/* ---- Plan -------------------------------------------------------- */}
      <Reveal delay={200}>
        <Spacer h={spacing.xxl} />
        {profile.isPremium ? (
          <Card padding={spacing.lg} tone="outline" onPress={() => router.push('/premium')}>
            <Row gap={spacing.md} align="center">
              <View style={styles.premiumChip}>
                <Ionicons name="sparkles" size={17} color={palette.white} />
              </View>
              <View style={styles.flex}>
                <Row gap={spacing.sm}>
                  <Txt variant="h4">Premium active</Txt>
                  <Badge label="RM19.90/mo" tone="premium" />
                </Row>
                <Txt variant="caption" tone="secondary">
                  Unlimited scans, a video consult with a licensed dermatologist, and the
                  ingredient conflict checker. Renews 15 Sep 2026.
                </Txt>
              </View>
              <Ionicons name="chevron-forward" size={17} color={palette.textMuted} />
            </Row>
          </Card>
        ) : (
          <GradientCard
            colors={gradients.premium}
            padding={spacing.lg + 2}
            onPress={() => router.push('/premium')}
          >
            <Row justify="space-between" align="flex-start">
              <Badge label="7 days free" tone="premium" style={styles.premiumBadge} />
              <Ionicons name="sparkles" size={18} color="rgba(255,255,255,0.65)" />
            </Row>
            <Spacer h={spacing.md} />
            <Txt variant="h2" color={palette.white}>
              Go Premium
            </Txt>
            <Txt variant="bodySm" color="rgba(255,255,255,0.78)" style={styles.premiumBody}>
              Unlimited scans, a video consult with an MMC-registered dermatologist within 24
              hours, and the ingredient conflict checker. RM19.90/month after the trial.
            </Txt>
            <Spacer h={spacing.lg} />
            <Row gap={spacing.sm} wrap>
              {['Unlimited scans', 'Video consult', 'Ingredient conflicts'].map((f) => (
                <View key={f} style={styles.premiumPill}>
                  <Ionicons name="checkmark" size={11} color={palette.white} />
                  <Txt variant="micro" color={palette.white}>
                    {f.toUpperCase()}
                  </Txt>
                </View>
              ))}
            </Row>
            <Spacer h={spacing.lg} />
            <Row justify="space-between">
              <Txt variant="label" color={palette.white}>
                Start free trial
              </Txt>
              <Ionicons name="arrow-forward" size={16} color={palette.white} />
            </Row>
          </GradientCard>
        )}
      </Reveal>

      {/* ---- Menu -------------------------------------------------------- */}
      <Reveal delay={260}>
        <Spacer h={spacing.xxl} />
        <SectionHeader title="Manage" />
        <Card padding={0}>
          <MenuRow
            icon="settings-outline"
            label="Settings"
            hint="Language, halal filter, notifications"
            onPress={() => router.push('/settings')}
          />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            hint="5 unread"
            count={5}
            onPress={() => router.push('/notifications')}
          />
          <MenuRow
            icon="trending-up-outline"
            label="Progress & photo log"
            hint="12 weeks · 61 → 82"
            onPress={() => router.push('/progress')}
          />
          <MenuRow
            icon="bag-handle-outline"
            label="Shop"
            hint="Matched to your skin, RM prices"
            onPress={() => router.push('/shop')}
          />
          <MenuRow
            icon="chatbubble-ellipses-outline"
            label="Digital dermatologist"
            hint="Ask anything about your skin"
            onPress={() => router.push('/derm')}
            last
          />
        </Card>
      </Reveal>

      {/* ---- Support ----------------------------------------------------- */}
      <Reveal delay={310}>
        <Spacer h={spacing.lg} />
        <Card padding={0}>
          <MenuRow
            icon="help-circle-outline"
            label="Help centre"
            onPress={() => openSheet('help')}
            expanded={sheet === 'help'}
            chevron="down"
          />
          {sheet === 'help' ? <SheetBody sheet={SHEETS.help} /> : null}
          <MenuRow
            icon="shield-checkmark-outline"
            label="Privacy & data"
            onPress={() => openSheet('privacy')}
            expanded={sheet === 'privacy'}
            chevron="down"
          />
          {sheet === 'privacy' ? <SheetBody sheet={SHEETS.privacy} /> : null}
          <MenuRow
            icon="information-circle-outline"
            label="About Simple+"
            onPress={() => openSheet('about')}
            expanded={sheet === 'about'}
            chevron="down"
            last={sheet !== 'about'}
          />
          {sheet === 'about' ? <SheetBody sheet={SHEETS.about} last /> : null}
        </Card>
      </Reveal>

      {/* ---- Footer ------------------------------------------------------ */}
      <Reveal delay={360}>
        <Spacer h={spacing.xxl} />
        <View style={styles.footer}>
          <Txt variant="caption" tone="muted" center>
            Simple+ v1.0.0 · Prototype build
          </Txt>
          <Txt variant="micro" tone="muted" center style={styles.footerNote}>
            MOCK DATA · SESSION ONLY · NOT A MEDICAL DEVICE
          </Txt>
          <Spacer h={spacing.md} />
          <Button
            label="Reset demo"
            variant="ghost"
            size="sm"
            icon="refresh-outline"
            onPress={resetDemo}
          />
          <Txt variant="caption" tone="muted" center style={styles.footerNote}>
            Puts Sarah back at 82/100 with a fresh onboarding — useful between pitch runs.
          </Txt>
        </View>
      </Reveal>
    </Screen>
  );
}

/* ------------------------------------------------------------------------ */
/* Local pieces                                                              */
/* ------------------------------------------------------------------------ */

function Reveal({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 460,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);

  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [
          { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Stat({
  label,
  value,
  accessory,
}: {
  label: string;
  value: string;
  accessory?: React.ReactNode;
}) {
  return (
    <View style={styles.stat}>
      <Txt variant="h1">{value}</Txt>
      <Txt variant="micro" tone="muted" center style={styles.statLabel}>
        {label.toUpperCase()}
      </Txt>
      <View style={styles.statAccessory}>{accessory}</View>
    </View>
  );
}

function VRule() {
  return <View style={styles.vrule} />;
}

function MenuRow({
  icon,
  label,
  hint,
  count,
  onPress,
  last,
  expanded,
  chevron = 'forward',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  count?: number;
  onPress: () => void;
  last?: boolean;
  expanded?: boolean;
  chevron?: 'forward' | 'down';
}) {
  return (
    <Tap onPress={onPress} scaleTo={0.995}>
      <View style={[styles.menuRow, last && styles.menuRowLast]}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={17} color={palette.blueDeep} />
        </View>
        <View style={styles.flex}>
          <Txt variant="bodyStrong">{label}</Txt>
          {hint ? (
            <Txt variant="caption" tone="muted" numberOfLines={1}>
              {hint}
            </Txt>
          ) : null}
        </View>
        {typeof count === 'number' && count > 0 ? (
          <View style={styles.countPill}>
            <Txt variant="micro" color={palette.alert}>
              {count}
            </Txt>
          </View>
        ) : null}
        <Ionicons
          name={chevron === 'down' ? (expanded ? 'chevron-up' : 'chevron-down') : 'chevron-forward'}
          size={16}
          color={palette.textMuted}
        />
      </View>
    </Tap>
  );
}

function SheetBody({
  sheet,
  last,
}: {
  sheet: { title: string; body: string; foot: string };
  last?: boolean;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        last && styles.menuRowLast,
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
        },
      ]}
    >
      <Txt variant="bodySm" tone="secondary">
        {sheet.body}
      </Txt>
      <Row gap={6} align="flex-start" style={styles.sheetFoot}>
        <Ionicons name="information-circle-outline" size={13} color={palette.textMuted} />
        <Txt variant="caption" tone="muted" style={styles.flex}>
          {sheet.foot}
        </Txt>
      </Row>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.md },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1.5,
    borderColor: palette.blueTintStrong,
  },
  heroText: { flex: 1, gap: 1 },
  cityRow: { marginTop: 3 },
  heroDivider: { marginVertical: spacing.lg },

  stat: { flex: 1, alignItems: 'center', gap: 1 },
  statLabel: { marginTop: 2 },
  statAccessory: { marginTop: spacing.xs, minHeight: 18, justifyContent: 'center' },
  vrule: { width: StyleSheet.hairlineWidth, backgroundColor: palette.border, alignSelf: 'stretch' },

  emojiChip: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockDivider: { marginVertical: spacing.lg },
  chipRow: { marginTop: spacing.sm },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceSunken,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  emptyBody: { marginTop: spacing.xs },

  premiumChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: { backgroundColor: 'rgba(255,255,255,0.16)' },
  premiumBody: { marginTop: spacing.xs },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.round,
    backgroundColor: palette.alertTint,
    alignItems: 'center',
  },

  sheet: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    backgroundColor: palette.surfaceSunken,
  },
  sheetFoot: { marginTop: spacing.sm },

  footer: { alignItems: 'center', gap: 2 },
  footerNote: { marginTop: 3 },
});
