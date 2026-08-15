import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { METRIC_META, RATING_COLOR, ratingFor } from '@/data/taxonomy';
import { palette, radius, spacing } from '@/theme';
import type { MetricKey } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Row, Tap, Txt } from '@/components/ui/primitives';
import { DeltaPill } from '@/components/ui/Chip';

/** Full-width metric row: label, value, delta, meter, readout. */
export function MetricRow({
  metricKey,
  value,
  delta,
  readout,
  onPress,
}: {
  metricKey: MetricKey;
  value: number;
  delta?: number;
  readout?: string;
  onPress?: () => void;
}) {
  const meta = METRIC_META[metricKey];
  const rating = ratingFor(value);

  // Tap, not onTouchEnd — touch events never fire for a mouse click on web.
  const Wrapper = onPress ? Tap : View;
  const wrapperProps = onPress ? { onPress, scaleTo: 0.99 } : {};

  return (
    <Wrapper style={styles.row} {...wrapperProps}>
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <Row gap={8}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          <Txt variant="bodyStrong">{meta.label}</Txt>
        </Row>
        <Row gap={8}>
          {typeof delta === 'number' && delta !== 0 ? <DeltaPill value={delta} /> : null}
          <Txt variant="bodyStrong" color={RATING_COLOR[rating]}>
            {value}
          </Txt>
        </Row>
      </Row>
      <ProgressBar value={value / 100} color={meta.color} height={6} />
      {readout ? (
        <Txt variant="caption" tone="muted" style={{ marginTop: 6 }}>
          {readout}
        </Txt>
      ) : null}
    </Wrapper>
  );
}

/** Compact 4-up tile used in the Home hero card. */
export function MetricTile({
  metricKey,
  value,
  width,
}: {
  metricKey: MetricKey;
  value: number;
  width?: number;
}) {
  const meta = METRIC_META[metricKey];
  const rating = ratingFor(value);
  const LABEL: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    watch: 'Watch',
  };
  return (
    <View style={[styles.tile, width ? { width } : { flex: 1 }]}>
      <View style={[styles.tileIcon, { backgroundColor: `${meta.color}1A` }]}>
        <View style={[styles.tileDot, { backgroundColor: meta.color }]} />
      </View>
      <Txt variant="micro" tone="muted" center numberOfLines={1}>
        {meta.label.toUpperCase()}
      </Txt>
      <Txt variant="label" color={RATING_COLOR[rating]} center>
        {LABEL[rating]}
      </Txt>
    </View>
  );
}

/** Six-axis radar of the whole skin profile. */
export function SkinRadar({
  values,
  compare,
  size = 220,
  keys,
}: {
  values: Record<MetricKey, number>;
  /** Optional second series drawn faintly behind (e.g. the previous scan). */
  compare?: Record<MetricKey, number>;
  size?: number;
  keys: MetricKey[];
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;
  const n = keys.length;

  const point = (i: number, frac: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(a) * r * frac, y: cy + Math.sin(a) * r * frac };
  };

  const toPolygon = (src: Record<MetricKey, number>) =>
    keys
      .map((k, i) => {
        const p = point(i, Math.max(0.08, src[k] / 100));
        return `${p.x},${p.y}`;
      })
      .join(' ');

  return (
    <Svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Polygon
          key={f}
          points={keys.map((_, i) => {
            const p = point(i, f);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke={palette.border}
          strokeWidth={1}
        />
      ))}
      {keys.map((_, i) => {
        const p = point(i, 1);
        return (
          <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={palette.border} strokeWidth={1} />
        );
      })}

      {compare ? (
        <Polygon
          points={toPolygon(compare)}
          fill={palette.textMuted}
          fillOpacity={0.12}
          stroke={palette.textMuted}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      ) : null}

      <Polygon
        points={toPolygon(values)}
        fill={palette.blue}
        fillOpacity={0.18}
        stroke={palette.blue}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {keys.map((k, i) => {
        const p = point(i, Math.max(0.08, values[k] / 100));
        return <Circle key={k} cx={p.x} cy={p.y} r={3.5} fill={METRIC_META[k].color} />;
      })}

      {keys.map((k, i) => {
        const p = point(i, 1.2);
        return (
          <SvgText
            key={`l-${k}`}
            x={p.x}
            y={p.y + 3}
            fontSize={9.5}
            fill={palette.textSecondary}
            textAnchor="middle"
          >
            {METRIC_META[k].short}
          </SvgText>
        );
      })}
    </Svg>
  );
}

/** Mon-Sun adherence bars. */
export function WeekBars({
  values,
  height = 56,
  color = palette.blue,
}: {
  values: number[];
  height?: number;
  color?: string;
}) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <Row gap={8} align="flex-end" justify="space-between">
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <View style={[styles.barTrack, { height }]}>
            <View
              style={{
                height: Math.max(4, height * v),
                backgroundColor: v >= 1 ? color : `${color}66`,
                borderRadius: radius.sm,
                width: '100%',
              }}
            />
          </View>
          <Txt variant="micro" tone="muted">
            {days[i]}
          </Txt>
        </View>
      ))}
    </Row>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: spacing.sm + 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tile: { alignItems: 'center', gap: 4 },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tileDot: { width: 12, height: 12, borderRadius: 6 },
  barTrack: {
    width: '100%',
    backgroundColor: palette.surfaceSunken,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
});
