import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { palette } from '@/theme';

export interface LineChartProps {
  data: number[];
  labels?: string[];
  width: number;
  height?: number;
  color?: string;
  /** Fill the area under the curve. */
  area?: boolean;
  /** Draw faint horizontal guides. */
  grid?: boolean;
  /** Force the y-domain. Otherwise padded min/max of the data. */
  domain?: [number, number];
  /** Highlight the final point with a dot + halo. */
  markLast?: boolean;
  gradientId?: string;
  showLabels?: boolean;
  strokeWidth?: number;
}

/** Smooth cardinal-ish spline through the points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.22;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({
  data,
  labels,
  width,
  height = 160,
  color = palette.blue,
  area = true,
  grid = true,
  domain,
  markLast = true,
  gradientId = 'lineFill',
  showLabels = true,
  strokeWidth = 3,
}: LineChartProps) {
  const padX = 6;
  const padTop = 14;
  const padBottom = showLabels && labels ? 22 : 10;
  const innerW = Math.max(1, width - padX * 2);
  const innerH = Math.max(1, height - padTop - padBottom);

  const lo = domain ? domain[0] : Math.min(...data) - 6;
  const hi = domain ? domain[1] : Math.max(...data) + 6;
  const span = Math.max(1, hi - lo);

  const pts = data.map((v, i) => ({
    x: padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: padTop + innerH - ((v - lo) / span) * innerH,
  }));

  const line = smoothPath(pts);
  const areaPath = `${line} L ${pts[pts.length - 1].x} ${padTop + innerH} L ${pts[0].x} ${
    padTop + innerH
  } Z`;

  const last = pts[pts.length - 1];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.24} />
            <Stop offset="1" stopColor={color} stopOpacity={0.01} />
          </LinearGradient>
        </Defs>

        {grid
          ? [0, 0.5, 1].map((f) => (
              <Line
                key={f}
                x1={padX}
                x2={width - padX}
                y1={padTop + innerH * f}
                y2={padTop + innerH * f}
                stroke={palette.border}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ))
          : null}

        {area ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        <Path
          d={line}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {markLast ? (
          <>
            <Circle cx={last.x} cy={last.y} r={9} fill={color} opacity={0.16} />
            <Circle cx={last.x} cy={last.y} r={4.5} fill={color} stroke="#fff" strokeWidth={2.5} />
          </>
        ) : null}

        {showLabels && labels
          ? labels.map((l, i) =>
              l ? (
                <SvgText
                  key={`${l}-${i}`}
                  x={pts[i].x}
                  y={height - 5}
                  fontSize={9.5}
                  fill={palette.textMuted}
                  // Anchor the end labels inward so they cannot clip at the edges.
                  textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
                >
                  {l}
                </SvgText>
              ) : null,
            )
          : null}
      </Svg>
    </View>
  );
}

/** Tiny inline trend line, no axes. */
export function Sparkline({
  data,
  width = 64,
  height = 24,
  color = palette.blue,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const span = Math.max(1, hi - lo);
  const pts = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * width,
    y: height - 2 - ((v - lo) / span) * (height - 4),
  }));
  return (
    <Svg width={width} height={height}>
      <Path
        d={smoothPath(pts)}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const chartStyles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
