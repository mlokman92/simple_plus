import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';

import { palette, radius } from '@/theme';
import type { ProductCategory } from '@/types';

/**
 * The prototype ships no product photography, so every product gets a generated
 * bottle drawn from its category silhouette and tint pair. Reads as deliberate
 * art direction rather than a missing image.
 */
export function ProductArt({
  category,
  tint,
  size = 76,
  style,
  id,
}: {
  category: ProductCategory;
  tint: [string, string];
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Unique suffix so multiple gradients can coexist. */
  id?: string;
}) {
  const gid = `pa-${id ?? category}-${tint[1].replace('#', '')}`;
  const S = 100; // viewBox units
  const shape = SILHOUETTE[category];

  return (
    <View style={[{ width: size, height: size }, styles.wrap, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={tint[0]} />
            <Stop offset="1" stopColor={tint[1]} />
          </LinearGradient>
          <LinearGradient id={`${gid}-glass`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.45} />
            <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.22} />
          </LinearGradient>
        </Defs>

        {shape.map((el, i) =>
          el.kind === 'rect' ? (
            <Rect
              key={i}
              x={el.x}
              y={el.y}
              width={el.w}
              height={el.h}
              rx={el.r}
              fill={el.fill === 'grad' ? `url(#${gid})` : el.fill}
              opacity={el.opacity}
            />
          ) : (
            <Ellipse
              key={i}
              cx={el.cx}
              cy={el.cy}
              rx={el.rx}
              ry={el.ry}
              fill={el.fill === 'grad' ? `url(#${gid})` : el.fill}
              opacity={el.opacity}
            />
          ),
        )}

        {/* Glass highlight sweep over the body */}
        <Rect x={26} y={26} width={16} height={54} rx={8} fill={`url(#${gid}-glass)`} />
      </Svg>
    </View>
  );
}

type El =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number; fill: string; opacity?: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string; opacity?: number };

const CAP = '#FFFFFF';

const SILHOUETTE: Record<ProductCategory, El[]> = {
  // Tall pump bottle
  serum: [
    { kind: 'rect', x: 45, y: 6, w: 10, h: 12, r: 3, fill: CAP },
    { kind: 'rect', x: 38, y: 16, w: 24, h: 10, r: 5, fill: CAP },
    { kind: 'rect', x: 26, y: 24, w: 48, h: 68, r: 14, fill: 'grad' },
    { kind: 'rect', x: 32, y: 54, w: 36, h: 22, r: 6, fill: '#FFFFFF', opacity: 0.35 },
  ],
  // Squeeze tube
  cleanser: [
    { kind: 'rect', x: 40, y: 8, w: 20, h: 10, r: 4, fill: CAP },
    { kind: 'rect', x: 24, y: 16, w: 52, h: 76, r: 16, fill: 'grad' },
    { kind: 'rect', x: 24, y: 84, w: 52, h: 8, r: 3, fill: '#FFFFFF', opacity: 0.5 },
    { kind: 'rect', x: 32, y: 44, w: 36, h: 20, r: 5, fill: '#FFFFFF', opacity: 0.32 },
  ],
  // Wide jar
  moisturizer: [
    { kind: 'rect', x: 20, y: 22, w: 60, h: 16, r: 7, fill: CAP },
    { kind: 'rect', x: 24, y: 34, w: 52, h: 54, r: 14, fill: 'grad' },
    { kind: 'ellipse', cx: 50, cy: 34, rx: 26, ry: 6, fill: '#FFFFFF', opacity: 0.35 },
    { kind: 'rect', x: 32, y: 52, w: 36, h: 18, r: 5, fill: '#FFFFFF', opacity: 0.3 },
  ],
  // Slim flat bottle
  sunscreen: [
    { kind: 'rect', x: 44, y: 6, w: 12, h: 10, r: 3, fill: CAP },
    { kind: 'rect', x: 36, y: 14, w: 28, h: 8, r: 4, fill: CAP },
    { kind: 'rect', x: 28, y: 20, w: 44, h: 72, r: 12, fill: 'grad' },
    { kind: 'ellipse', cx: 50, cy: 46, rx: 13, ry: 13, fill: '#FFFFFF', opacity: 0.38 },
  ],
  // Tall slim toner
  toner: [
    { kind: 'rect', x: 43, y: 4, w: 14, h: 14, r: 4, fill: CAP },
    { kind: 'rect', x: 30, y: 16, w: 40, h: 76, r: 10, fill: 'grad' },
    { kind: 'rect', x: 36, y: 40, w: 28, h: 26, r: 5, fill: '#FFFFFF', opacity: 0.3 },
  ],
  // Dropper
  treatment: [
    { kind: 'rect', x: 46, y: 2, w: 8, h: 16, r: 3, fill: CAP },
    { kind: 'rect', x: 36, y: 16, w: 28, h: 8, r: 4, fill: CAP },
    { kind: 'rect', x: 32, y: 22, w: 36, h: 70, r: 12, fill: 'grad' },
    { kind: 'ellipse', cx: 50, cy: 64, rx: 11, ry: 11, fill: '#FFFFFF', opacity: 0.3 },
  ],
  // Squat tub
  mask: [
    { kind: 'rect', x: 18, y: 26, w: 64, h: 14, r: 6, fill: CAP },
    { kind: 'rect', x: 22, y: 36, w: 56, h: 52, r: 16, fill: 'grad' },
    { kind: 'ellipse', cx: 50, cy: 60, rx: 17, ry: 12, fill: '#FFFFFF', opacity: 0.3 },
  ],
  // Pump bottle, shorter
  exfoliant: [
    { kind: 'rect', x: 45, y: 8, w: 10, h: 10, r: 3, fill: CAP },
    { kind: 'rect', x: 36, y: 16, w: 28, h: 8, r: 4, fill: CAP },
    { kind: 'rect', x: 28, y: 22, w: 44, h: 68, r: 20, fill: 'grad' },
    { kind: 'rect', x: 36, y: 48, w: 28, h: 20, r: 5, fill: '#FFFFFF', opacity: 0.32 },
  ],
};

/** Rounded plinth the art sits on inside product cards. */
export function ProductTile({
  category,
  tint,
  size = 84,
  id,
  style,
}: {
  category: ProductCategory;
  tint: [string, string];
  size?: number;
  id?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, backgroundColor: `${tint[1]}14` },
        style,
      ]}
    >
      <ProductArt category={category} tint={tint} size={size * 0.78} id={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  tile: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
});
