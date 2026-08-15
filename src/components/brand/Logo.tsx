import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { palette } from '@/theme';
import { Row, Txt } from '@/components/ui/primitives';

/** Cropped straight out of marketing-assets/screens.png, background keyed to alpha. */
const MARK = require('../../../assets/brand/logo-mark.png');

/** Native aspect of the cropped mark. */
const MARK_RATIO = 121 / 106;

/**
 * The Simple+ mark. This is the real brand artwork from the marketing assets
 * rather than a redraw, so the prototype and the deck cannot drift apart.
 */
export function LogoMark({
  size = 44,
  plate = false,
  style,
}: {
  /** Width in px; height follows the artwork's aspect ratio. */
  size?: number;
  /**
   * Sit the mark on a light chip. The artwork's upper half is a deep teal that
   * the marketing assets only ever show on a pale background — on a navy
   * surface it muddies, so dark screens use the plate.
   */
  plate?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const mark = (
    <Image
      source={MARK}
      style={{ width: size, height: size * MARK_RATIO }}
      contentFit="contain"
      transition={0}
      accessibilityLabel="Simple+"
    />
  );

  if (!plate) return <View style={style}>{mark}</View>;

  const box = size * MARK_RATIO + size * 0.5;
  return (
    <View
      style={[
        {
          width: box,
          height: box,
          borderRadius: box * 0.3,
          backgroundColor: 'rgba(255,255,255,0.94)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {mark}
    </View>
  );
}

/**
 * Mark + wordmark, laid out like the marketing lockup. The wordmark stays as
 * live text so it renders crisply at any size and can flip for dark surfaces.
 */
export function LogoLockup({
  size = 34,
  tone = 'dark',
  style,
  tagline,
}: {
  size?: number;
  tone?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
  tagline?: string;
}) {
  const ink = tone === 'dark' ? palette.ink : palette.white;
  const plus = tone === 'dark' ? palette.blue : '#BFE0FF';
  return (
    <View style={style}>
      <Row gap={size * 0.24}>
        <LogoMark size={size} plate={tone === 'light'} />
        <Txt
          variant="h1"
          color={ink}
          style={{ fontSize: size * 0.92, lineHeight: size * 1.08, letterSpacing: -1 }}
        >
          Simple
          <Txt
            variant="h1"
            color={plus}
            style={{ fontSize: size * 0.92, lineHeight: size * 1.08 }}
          >
            +
          </Txt>
        </Txt>
      </Row>
      {tagline ? (
        <Txt
          variant="caption"
          color={tone === 'dark' ? palette.textSecondary : 'rgba(255,255,255,0.8)'}
          style={{ marginTop: 6, letterSpacing: 0.4 }}
        >
          {tagline}
        </Txt>
      ) : null}
    </View>
  );
}
