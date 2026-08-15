import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  AppHeader,
  Badge,
  Button,
  Card,
  Row,
  Screen,
  SectionHeader,
  Spacer,
  Tap,
  Txt,
} from '@/components/ui';
import { useApp } from '@/store/AppStore';
import { palette, radius, shadow, spacing } from '@/theme';
import type { Language } from '@/types';

type DataSheet = 'export' | 'delete' | 'privacy';

const LANGUAGES: ReadonlyArray<{ key: Language; label: string; sub: string }> = [
  { key: 'en', label: 'English', sub: 'Default' },
  { key: 'ms', label: 'Bahasa Melayu', sub: 'Partial' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    profile,
    language,
    halalOnly,
    notificationsEnabled,
    scans,
    savedProductIds,
    dispatch,
  } = useApp();

  // Prototype-local preferences — the store does not persist these yet.
  const [fragranceFree, setFragranceFree] = useState(true);
  const [scanReminder, setScanReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notiRoutine, setNotiRoutine] = useState(true);
  const [notiScan, setNotiScan] = useState(true);
  const [notiInsights, setNotiInsights] = useState(true);
  const [notiRestock, setNotiRestock] = useState(false);
  const [sheet, setSheet] = useState<DataSheet | null>(null);

  const toggleSheet = (key: DataSheet) => setSheet((cur) => (cur === key ? null : key));

  const signOut = () => {
    dispatch({ type: 'reset' });
    router.replace('/');
  };

  return (
    <Screen padBottom={56} header={<AppHeader title="Settings" subtitle={profile.name} />}>
      {/* ---- Language ---------------------------------------------------- */}
      <Reveal delay={0}>
        <SectionHeader title="Language" />
        <Card padding={spacing.lg}>
          <Segmented
            options={LANGUAGES}
            value={language}
            onChange={(key) => dispatch({ type: 'setLanguage', value: key })}
          />
          {language === 'ms' ? (
            <Note
              icon="information-circle-outline"
              text="Bahasa Melayu is only partly wired up in this prototype — navigation and headings switch, but AI derm replies and ingredient copy stay in English. Full BM localisation, including halal ingredient names, ships at launch."
            />
          ) : (
            <Txt variant="caption" tone="muted" style={styles.underNote}>
              Bahasa Melayu is available. Chinese and Tamil are on the launch roadmap.
            </Txt>
          )}
        </Card>
      </Reveal>

      {/* ---- Preferences ------------------------------------------------- */}
      <Reveal delay={60}>
        <Spacer h={spacing.xxl} />
        <SectionHeader title="Preferences" />
        <Card padding={0}>
          <SettingRow
            icon="ribbon-outline"
            label="Halal-certified only"
            hint="JAKIM-certified shelf. 9 of 12 matches qualify."
            value={halalOnly}
            onChange={(v) => dispatch({ type: 'setHalalOnly', value: v })}
          />
          <SettingRow
            icon="leaf-outline"
            label="Fragrance-free only"
            hint="Hides added fragrance and essential oils — sensible for your reactive cheeks."
            value={fragranceFree}
            onChange={setFragranceFree}
          />
          <SettingRow
            icon="alarm-outline"
            label="Weekly scan reminder"
            hint="Sunday, 9:00 PM — the night before your Monday scan."
            value={scanReminder}
            onChange={setScanReminder}
          />
          <SettingRow
            icon="moon-outline"
            label="Dark mode"
            hint="Bathroom-at-2am mode."
            value={darkMode}
            onChange={setDarkMode}
            disabled
            trailing={<Badge label="Soon" tone="neutral" />}
            last
          />
        </Card>
      </Reveal>

      {/* ---- Notifications ----------------------------------------------- */}
      <Reveal delay={120}>
        <Spacer h={spacing.xxl} />
        <SectionHeader title="Notifications" action="View inbox" onAction={() => router.push('/notifications')} />
        <Card padding={0}>
          <SettingRow
            icon="notifications-outline"
            label="Allow notifications"
            hint={
              notificationsEnabled
                ? 'On — quiet hours 11:00 PM to 7:00 AM.'
                : 'Off — nothing will reach you, including UV alerts.'
            }
            value={notificationsEnabled}
            onChange={(v) => dispatch({ type: 'setNotifications', value: v })}
          />
          <SettingRow
            icon="list-outline"
            label="Routine reminders"
            hint="8:00 AM and 10:00 PM, your logged times."
            value={notiRoutine}
            onChange={setNotiRoutine}
            disabled={!notificationsEnabled}
            indent
          />
          <SettingRow
            icon="scan-outline"
            label="Scan reminders"
            hint="Sunday evening, ahead of your Monday scan."
            value={notiScan}
            onChange={setNotiScan}
            disabled={!notificationsEnabled}
            indent
          />
          <SettingRow
            icon="bulb-outline"
            label="Weekly insights"
            hint="Monday summary, trend calls, and KL UV warnings."
            value={notiInsights}
            onChange={setNotiInsights}
            disabled={!notificationsEnabled}
            indent
          />
          <SettingRow
            icon="cube-outline"
            label="Product restock"
            hint="When a product is roughly two weeks from empty."
            value={notiRestock}
            onChange={setNotiRestock}
            disabled={!notificationsEnabled}
            indent
            last
          />
        </Card>
      </Reveal>

      {/* ---- Data -------------------------------------------------------- */}
      <Reveal delay={180}>
        <Spacer h={spacing.xxl} />
        <SectionHeader title="Data" />
        <Card padding={0}>
          <ActionRow
            icon="download-outline"
            label="Export my data"
            hint="Scans, scores, and routine history as JSON"
            open={sheet === 'export'}
            onPress={() => toggleSheet('export')}
          />
          {sheet === 'export' ? (
            <Panel>
              <Txt variant="bodySm" tone="secondary">
                We would package {scans.length} scans, 12 weeks of score history, and{' '}
                {savedProductIds.length} saved products into a single JSON file and email it to you
                within a minute.
              </Txt>
              <Row gap={spacing.sm} style={styles.panelActions}>
                <Button
                  label="Export"
                  size="sm"
                  variant="secondary"
                  full={false}
                  disabled
                  onPress={() => undefined}
                />
                <Button
                  label="Cancel"
                  size="sm"
                  variant="ghost"
                  full={false}
                  onPress={() => setSheet(null)}
                />
              </Row>
              <Txt variant="caption" tone="muted">
                Disabled in the prototype — there is no backend to export from.
              </Txt>
            </Panel>
          ) : null}

          <ActionRow
            icon="trash-outline"
            label="Delete my scans"
            hint={`${scans.length} scans and their photo log entries`}
            tone="alert"
            open={sheet === 'delete'}
            onPress={() => toggleSheet('delete')}
          />
          {sheet === 'delete' ? (
            <Panel tone="alert">
              <Row gap={6} align="flex-start">
                <Ionicons name="warning-outline" size={14} color={palette.alert} />
                <Txt variant="bodySm" tone="secondary" style={styles.flex}>
                  Deleting removes every scan, your 61 → 82 trend line, and the projections built on
                  it. Your routine and saved products stay. This cannot be undone.
                </Txt>
              </Row>
              <Row gap={spacing.sm} style={styles.panelActions}>
                <Button
                  label={`Delete ${scans.length} scans`}
                  size="sm"
                  variant="danger"
                  full={false}
                  disabled
                  onPress={() => undefined}
                />
                <Button
                  label="Keep them"
                  size="sm"
                  variant="ghost"
                  full={false}
                  onPress={() => setSheet(null)}
                />
              </Row>
              <Txt variant="caption" tone="muted">
                Disabled in the prototype so the demo data survives the pitch.
              </Txt>
            </Panel>
          ) : null}

          <ActionRow
            icon="document-text-outline"
            label="Privacy policy"
            hint="How face scans are handled"
            open={sheet === 'privacy'}
            onPress={() => toggleSheet('privacy')}
            last={sheet !== 'privacy'}
          />
          {sheet === 'privacy' ? (
            <Panel last>
              <Txt variant="bodySm" tone="secondary">
                At launch: scans are processed on Malaysian-hosted infrastructure, encrypted at
                rest, never sold, and deleted after 90 days unless you pin them to your photo log.
                Face images are never used to train shared models without an explicit opt-in.
              </Txt>
              <Row gap={spacing.sm} style={styles.panelActions}>
                <Button
                  label="Close"
                  size="sm"
                  variant="ghost"
                  full={false}
                  onPress={() => setSheet(null)}
                />
              </Row>
            </Panel>
          ) : null}
        </Card>
        <Note
          icon="lock-closed-outline"
          text="Everything in this prototype is mock data held in memory for this session. Nothing is uploaded, and closing the tab clears it."
          standalone
        />
      </Reveal>

      {/* ---- Account ----------------------------------------------------- */}
      <Reveal delay={240}>
        <Spacer h={spacing.xxl} />
        <SectionHeader title="Account" />
        <Card padding={0}>
          <ActionRow
            icon="person-circle-outline"
            label={profile.isPremium ? 'Premium plan' : 'Free plan'}
            hint={
              profile.isPremium
                ? 'RM19.90/month · renews 15 Sep 2026'
                : '1 scan a week · upgrade for unlimited'
            }
            trailing={
              <Badge
                label={profile.isPremium ? 'Active' : 'Upgrade'}
                tone={profile.isPremium ? 'good' : 'brand'}
              />
            }
            onPress={() => router.push('/premium')}
          />
          <ActionRow
            icon="mail-outline"
            label="Email"
            hint="sarah.kl@example.my"
            onPress={() => undefined}
            last
          />
        </Card>

        <Spacer h={spacing.lg} />
        <Button
          label="Sign out"
          variant="ghost"
          icon="log-out-outline"
          onPress={signOut}
        />
        <Txt variant="caption" tone="muted" center style={styles.underNote}>
          Signing out resets the demo to a fresh onboarding.
        </Txt>

        <Spacer h={spacing.xl} />
        <Txt variant="micro" tone="muted" center>
          SIMPLE+ V1.0.0 · PROTOTYPE BUILD · KUALA LUMPUR
        </Txt>
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
      duration: 440,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);

  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const TRACK_W = 48;
const TRACK_H = 28;
const KNOB = 22;

/**
 * Local pill switch. React Native's <Switch> renders inconsistently on web, so
 * the prototype draws its own.
 */
function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const a = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: value ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [a, value]);

  const background = a.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.borderStrong, palette.blue],
  });
  const translateX = a.interpolate({
    inputRange: [0, 1],
    outputRange: [3, TRACK_W - KNOB - 3],
  });

  return (
    <Tap
      onPress={() => onChange(!value)}
      disabled={disabled}
      scaleTo={0.9}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    >
      <Animated.View
        style={[styles.track, { backgroundColor: background }, disabled && styles.trackDisabled]}
      >
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Tap>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ key: T; label: string; sub: string }>;
  value: T;
  onChange: (key: T) => void;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const a = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: index,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [a, index]);

  const cell = width > 0 ? (width - 8) / options.length : 0;
  const translateX = a.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => i * cell),
  });

  return (
    <View
      style={styles.segment}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Animated.View
          style={[styles.segmentPill, { width: cell, transform: [{ translateX }] }]}
        />
      ) : null}
      {options.map((o) => {
        const active = o.key === value;
        return (
          <View key={o.key} style={styles.segmentCell}>
            <Tap onPress={() => onChange(o.key)} scaleTo={0.97}>
              <View style={styles.segmentInner}>
                <Txt variant="label" color={active ? palette.white : palette.textSecondary}>
                  {o.label}
                </Txt>
                <Txt
                  variant="micro"
                  color={active ? 'rgba(255,255,255,0.72)' : palette.textMuted}
                >
                  {o.sub.toUpperCase()}
                </Txt>
              </View>
            </Tap>
          </View>
        );
      })}
    </View>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  value,
  onChange,
  disabled,
  indent,
  last,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  indent?: boolean;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.row,
        indent && styles.rowIndent,
        last && styles.rowLast,
        disabled && styles.rowDisabled,
      ]}
    >
      <View style={[styles.rowIcon, indent && styles.rowIconSmall]}>
        <Ionicons name={icon} size={indent ? 14 : 17} color={palette.blueDeep} />
      </View>
      <View style={styles.flex}>
        <Row gap={spacing.sm}>
          <Txt variant={indent ? 'bodySm' : 'bodyStrong'}>{label}</Txt>
          {trailing}
        </Row>
        {hint ? (
          <Txt variant="caption" tone="muted">
            {hint}
          </Txt>
        ) : null}
      </View>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onPress,
  last,
  open,
  tone = 'default',
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
  last?: boolean;
  open?: boolean;
  tone?: 'default' | 'alert';
  trailing?: React.ReactNode;
}) {
  const fg = tone === 'alert' ? palette.alert : palette.blueDeep;
  return (
    <Tap onPress={onPress} scaleTo={0.995}>
      <View style={[styles.row, last && styles.rowLast]}>
        <View style={[styles.rowIcon, tone === 'alert' && styles.rowIconAlert]}>
          <Ionicons name={icon} size={17} color={fg} />
        </View>
        <View style={styles.flex}>
          <Txt variant="bodyStrong" color={tone === 'alert' ? palette.alert : undefined}>
            {label}
          </Txt>
          {hint ? (
            <Txt variant="caption" tone="muted" numberOfLines={1}>
              {hint}
            </Txt>
          ) : null}
        </View>
        {trailing}
        <Ionicons
          name={open === undefined ? 'chevron-forward' : open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={palette.textMuted}
        />
      </View>
    </Tap>
  );
}

function Panel({
  children,
  tone = 'default',
  last,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'alert';
  last?: boolean;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a]);

  return (
    <Animated.View
      style={[
        styles.panel,
        tone === 'alert' && styles.panelAlert,
        last && styles.rowLast,
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Note({
  icon,
  text,
  standalone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  standalone?: boolean;
}) {
  return (
    <View style={[styles.note, standalone && styles.noteStandalone]}>
      <Ionicons name={icon} size={14} color={palette.blueDeep} />
      <Txt variant="caption" tone="secondary" style={styles.flex}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  underNote: { marginTop: spacing.md },

  segment: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceSunken,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: radius.sm,
    backgroundColor: palette.blue,
  },
  segmentCell: { flex: 1 },
  segmentInner: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, gap: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  rowIndent: { paddingLeft: spacing.xxl + spacing.sm, backgroundColor: palette.canvasSoft },
  rowLast: { borderBottomWidth: 0 },
  rowDisabled: { opacity: 0.55 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSmall: { width: 26, height: 26, borderRadius: radius.xs },
  rowIconAlert: { backgroundColor: palette.alertTint },

  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: radius.round,
    justifyContent: 'center',
  },
  trackDisabled: { opacity: 0.4 },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: palette.white,
    ...shadow.card,
  },

  panel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: palette.surfaceSunken,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  panelAlert: { backgroundColor: palette.alertTint },
  panelActions: { marginTop: 2 },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.blueTint,
  },
  noteStandalone: { marginTop: spacing.md },
});
