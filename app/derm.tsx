import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ProductMini } from '@/components/ProductCard';
import { LogoMark } from '@/components/brand/Logo';
import {
  AppHeader,
  Card,
  Chip,
  GradientCard,
  IconButton,
  Row,
  Screen,
  Txt,
} from '@/components/ui';
import { QUICK_PROMPTS } from '@/data/derm';
import { getProduct } from '@/data/products';
import { ENVIRONMENT, SCAN_HISTORY } from '@/data/user';
import { myr } from '@/lib/format';
import { useInsets } from '@/lib/frame';
import { useApp } from '@/store/AppStore';
import { gradients, palette, radius, spacing, type as typeScale } from '@/theme';
import type { DermMessage, Product } from '@/types';

/**
 * Sarah's record is 12 weekly scans — the number Insights, the analysis flow and
 * the chat greeting all cite. `SCAN_HISTORY` only carries the three most recent
 * ones in full, so the baseline is fixed here and anything scanned this session
 * is counted on top.
 */
const TRACKED_SCANS = 12;

/**
 * Digital Dermatologist — the scripted AI chat. Replies come from the store
 * (`askDerm`), which keyword-matches `DERM_SCRIPTS`, so free-typed questions in
 * a live demo still land on something that reads as data-backed.
 */
export default function DermChat() {
  const router = useRouter();
  const insets = useInsets();
  const { dermMessages, dermTyping, askDerm, score, scans } = useApp();

  const scanCount = TRACKED_SCANS + Math.max(0, scans.length - SCAN_HISTORY.length);

  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const showPrompts = dermMessages.length <= 2;
  const lastId = dermMessages[dermMessages.length - 1]?.id;

  const send = useCallback(() => {
    const value = draft.trim();
    if (!value) return;
    askDerm(value);
    setDraft('');
  }, [draft, askDerm]);

  const toEnd = useCallback((animated: boolean) => {
    scrollRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    if (dermMessages.length <= 1 && !dermTyping) return;
    const t = setTimeout(() => toEnd(true), 70);
    return () => clearTimeout(t);
  }, [dermMessages.length, dermTyping, toEnd]);

  const canSend = draft.trim().length > 0;

  return (
    <Screen
      scroll={false}
      gutter={0}
      contentStyle={styles.fill}
      header={
        <AppHeader
          title="Digital Dermatologist"
          subtitle={`Trained on your ${scanCount} scans`}
          right={<OnlineTag />}
        />
      }
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.fill}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {showPrompts ? (
            <Appear>
              <Card tone="tinted" padding={spacing.lg} elevation="none">
                <Row gap={6}>
                  <Ionicons name="sparkles" size={13} color={palette.blueDeep} />
                  <Txt variant="micro" color={palette.blueDeep}>
                    LOADED FOR THIS CHAT
                  </Txt>
                </Row>
                <Txt variant="caption" tone="secondary" style={{ marginTop: 6 }}>
                  Your {scanCount} scans, a score of {score}/100, and today’s {ENVIRONMENT.city}{' '}
                  UV index of {ENVIRONMENT.uvIndex} at {ENVIRONMENT.humidity}% humidity. Answers
                  cite your numbers, not averages.
                </Txt>
                <Row wrap gap={spacing.sm} style={{ marginTop: spacing.md }}>
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <Appear key={prompt} delay={90 + i * 55}>
                      <Chip label={prompt} onPress={() => askDerm(prompt)} />
                    </Appear>
                  ))}
                </Row>
              </Card>
            </Appear>
          ) : null}

          {dermMessages.map((message) =>
            message.role === 'ai' ? (
              <AiBubble
                key={message.id}
                message={message}
                onSuggest={askDerm}
                showSuggestions={message.id === lastId && !dermTyping && !showPrompts}
              />
            ) : (
              <UserBubble key={message.id} message={message} />
            ),
          )}

          {dermTyping ? <TypingBubble /> : null}
        </ScrollView>

        <View
          style={[
            styles.composerWrap,
            { marginBottom: -insets.bottom, paddingBottom: insets.bottom + spacing.sm },
          ]}
        >
          <Row gap={5} style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={12} color={palette.textMuted} />
            <Txt variant="micro" tone="muted" style={styles.disclaimerText}>
              AI guidance based on your scan data — not a medical diagnosis.{' '}
              <Txt
                variant="micro"
                tone="brand"
                onPress={() => router.push('/premium')}
                suppressHighlighting
              >
                Talk to a human dermatologist
              </Txt>
            </Txt>
          </Row>

          <Row gap={spacing.sm} align="flex-end">
            <View style={styles.inputShell}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask about your skin…"
                placeholderTextColor={palette.textMuted}
                style={styles.input}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={send}
                autoCorrect={false}
                selectionColor={palette.blue}
              />
            </View>
            <IconButton
              icon="arrow-up"
              onPress={send}
              size={46}
              tone={canSend ? 'brand' : 'surface'}
              color={canSend ? palette.white : palette.textMuted}
            />
          </Row>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ---------------------------------------------------------------- bubbles */

function AiBubble({
  message,
  onSuggest,
  showSuggestions,
}: {
  message: DermMessage;
  onSuggest: (text: string) => void;
  showSuggestions: boolean;
}) {
  const paragraphs = useMemo(
    () => message.text.split('\n\n').filter((p) => p.trim().length > 0),
    [message.text],
  );
  const products = useMemo<Product[]>(() => {
    const ids = message.productIds ?? [];
    return ids
      .map((id) => getProduct(id))
      .filter((p): p is Product => p !== undefined);
  }, [message.productIds]);

  return (
    <Appear>
      <Row gap={spacing.sm} align="flex-end">
        <Avatar />
        <Card padding={spacing.md + 2} style={styles.aiBubble}>
          {paragraphs.map((p, i) => (
            <Txt key={i} variant="body" style={i > 0 ? { marginTop: spacing.md } : undefined}>
              {p}
            </Txt>
          ))}
        </Card>
      </Row>

      {products.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.indent}
          contentContainerStyle={styles.productRow}
        >
          {products.map((product) => (
            <ProductMini
              key={product.id}
              product={product}
              width={128}
              caption={`${product.matchScore}% match · ${myr(product.price)}`}
            />
          ))}
        </ScrollView>
      ) : null}

      {showSuggestions && message.suggestions?.length ? (
        <Row wrap gap={spacing.sm} style={[styles.indent, { marginTop: spacing.md }]}>
          {message.suggestions.map((s, i) => (
            <Appear key={s} delay={120 + i * 70}>
              <Chip label={s} icon="return-down-forward" onPress={() => onSuggest(s)} />
            </Appear>
          ))}
        </Row>
      ) : null}

      <Txt variant="micro" tone="muted" style={[styles.indent, styles.stamp]}>
        Simple+ AI · {message.timestamp}
      </Txt>
    </Appear>
  );
}

function UserBubble({ message }: { message: DermMessage }) {
  return (
    <Appear style={styles.alignEnd}>
      <GradientCard colors={gradients.action} padding={spacing.md + 2} style={styles.userBubble}>
        <Txt variant="body" tone="onBrand">
          {message.text}
        </Txt>
      </GradientCard>
      <Txt variant="micro" tone="muted" style={styles.stampEnd}>
        {message.timestamp}
      </Txt>
    </Appear>
  );
}

function TypingBubble() {
  return (
    <Appear>
      <Row gap={spacing.sm} align="flex-end">
        <Avatar />
        <Card padding={spacing.md} style={styles.typing} elevation="card">
          <Row gap={5}>
            {[0, 1, 2].map((i) => (
              <TypingDot key={i} index={i} />
            ))}
          </Row>
        </Card>
        <Txt variant="micro" tone="muted">
          reading your scans…
        </Txt>
      </Row>
    </Appear>
  );
}

function TypingDot({ index }: { index: number }) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 160),
        Animated.timing(a, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.delay(480 - index * 160),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a, index]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.28, 1] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.1] }) }],
        },
      ]}
    />
  );
}

/** Brand mark shown beside every AI bubble. */
function Avatar() {
  return (
    <View style={styles.avatar}>
      <LogoMark size={16} />
    </View>
  );
}

/* ------------------------------------------------------------ header slot */

function OnlineTag() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Row gap={5}>
      <View style={styles.dotWrap}>
        <Animated.View
          style={[
            styles.halo,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) },
              ],
            },
          ]}
        />
        <View style={styles.liveDot} />
      </View>
      <Txt variant="micro" tone="good">
        Online
      </Txt>
    </Row>
  );
}

/* -------------------------------------------------------------- animation */

function Appear({
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
    Animated.timing(a, {
      toValue: 1,
      duration: 340,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const GUTTER = spacing.xl;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  aiBubble: {
    flexShrink: 1,
    borderBottomLeftRadius: spacing.sm,
  },
  userBubble: {
    maxWidth: '86%',
    borderBottomRightRadius: spacing.sm,
  },
  alignEnd: { alignItems: 'flex-end' },
  indent: { marginLeft: 34 },
  productRow: { gap: spacing.sm + 2, paddingTop: spacing.md, paddingBottom: spacing.xs },
  stamp: { marginTop: 5 },
  stampEnd: { marginTop: 5, marginRight: 4 },

  typing: { borderBottomLeftRadius: spacing.sm, paddingHorizontal: spacing.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.blue },

  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.good,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.good },

  composerWrap: {
    paddingHorizontal: GUTTER,
    paddingTop: spacing.sm + 2,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: spacing.sm,
  },
  disclaimer: { alignItems: 'flex-start' },
  disclaimerText: { flex: 1, lineHeight: 15 },
  inputShell: {
    flex: 1,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.round,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  input: {
    fontFamily: typeScale.body.fontFamily,
    fontSize: typeScale.body.fontSize,
    color: palette.text,
    padding: 0,
  },
});
