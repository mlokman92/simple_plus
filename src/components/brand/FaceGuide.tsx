import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { palette, radius } from '@/theme';
import type { ScanZoneFinding } from '@/types';

/** Cropped from marketing-assets/simple+ ad.png — the campaign model, framed as a selfie. */
const FACE = require('../../../assets/brand/face.png');

/** The artwork and every overlay path are authored in this coordinate space. */
const W = 300;
const H = 380;

/** Capture-frame bracket origins: [x, y, xDirection, yDirection]. */
const CORNERS: [number, number, number, number][] = [
  [22, 40, 1, 1],
  [278, 40, -1, 1],
  [22, 336, 1, -1],
  [278, 336, -1, -1],
];

const SEVERITY_COLOR = {
  low: palette.good,
  medium: palette.warn,
  high: palette.alert,
} as const;

/** Marker hit area in viewBox units — comfortably larger than the 20u halo. */
const TOUCH_SIZE = 52;

/**
 * The face used by the scan flow. The prototype never opens a real camera, so
 * this doubles as the capture preview and the annotated result view.
 */
export function FaceGuide({
  width,
  height,
  findings = [],
  /** Draw the dashed capture oval + corner brackets. */
  guide = false,
  /** Draw the analysis mesh over the face. */
  mesh = false,
  /** Highlight a specific finding index. */
  activeIndex,
  cornerRadius = radius.lg,
  style,
  onSelect,
}: {
  width: number;
  height: number;
  findings?: ScanZoneFinding[];
  guide?: boolean;
  mesh?: boolean;
  activeIndex?: number;
  cornerRadius?: number;
  style?: StyleProp<ViewStyle>;
  onSelect?: (index: number) => void;
}) {
  // Fit the 300x380 artwork box inside whatever the caller gave us, so the
  // photo and every overlay share one coordinate space.
  const fit = Math.min(width / W, height / H);
  const boxW = W * fit;
  const boxH = H * fit;

  return (
    <View style={[{ width, height }, styles.center, style]}>
      <View style={[{ width: boxW, height: boxH, borderRadius: cornerRadius }, styles.clip]}>
        <Image
          source={FACE}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
          accessibilityLabel="Face preview"
        />

        <Svg
          width={boxW}
          height={boxH}
          viewBox={`0 0 ${W} ${H}`}
          style={StyleSheet.absoluteFill}
        >
          {mesh ? <AnalysisMesh /> : null}

          {guide ? (
            <G>
              <Ellipse
                cx={150}
                cy={188}
                rx={104}
                ry={140}
                fill="none"
                stroke={palette.white}
                strokeWidth={2.5}
                strokeDasharray="10 10"
                opacity={0.85}
              />
              {CORNERS.map(([x, y, sx, sy], i) => {
                // SVG rects cannot take a negative width/height, so mirror the
                // bracket by shifting its origin instead of negating its size.
                const arm = 30;
                const thick = 3;
                return (
                  <G key={i}>
                    <Rect
                      x={sx > 0 ? x : x - arm}
                      y={sy > 0 ? y : y - thick}
                      width={arm}
                      height={thick}
                      rx={1.5}
                      fill={palette.white}
                    />
                    <Rect
                      x={sx > 0 ? x : x - thick}
                      y={sy > 0 ? y : y - arm}
                      width={thick}
                      height={arm}
                      rx={1.5}
                      fill={palette.white}
                    />
                  </G>
                );
              })}
            </G>
          ) : null}

          {findings.map((f, i) => {
            const cx = f.x * W;
            const cy = f.y * H;
            const c = SEVERITY_COLOR[f.severity];
            const active = activeIndex === i;
            return (
              <G key={`${f.label}-${i}`}>
                <Circle cx={cx} cy={cy} r={active ? 26 : 20} fill={c} opacity={active ? 0.3 : 0.2} />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={active ? 15 : 11}
                  fill="none"
                  stroke={palette.white}
                  strokeWidth={3.5}
                  opacity={0.9}
                />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={active ? 15 : 11}
                  fill="none"
                  stroke={c}
                  strokeWidth={2.5}
                />
                <Circle cx={cx} cy={cy} r={4} fill={c} />
              </G>
            );
          })}
        </Svg>

        {/*
          Touch targets live outside the Svg on purpose. Putting onPress on an
          SVG node makes react-native-svg forward React Native's responder
          props (onResponderTerminate and friends) to the DOM element on web,
          which React then warns about as unknown event handlers.
        */}
        {onSelect ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {findings.map((f, i) => {
              const size = TOUCH_SIZE * fit;
              return (
                <Pressable
                  key={`hit-${f.label}-${i}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.label}: ${f.note}`}
                  onPress={() => onSelect(i)}
                  style={{
                    position: 'absolute',
                    left: f.x * boxW - size / 2,
                    top: f.y * boxH - size / 2,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function AnalysisMesh() {
  const lines: React.ReactElement[] = [];
  for (let i = 0; i < 9; i++) {
    const y = 80 + i * 26;
    lines.push(
      <Path
        key={`h${i}`}
        d={`M ${92 + Math.abs(i - 4) * 5} ${y} Q 150 ${y + 8} ${208 - Math.abs(i - 4) * 5} ${y}`}
        stroke={palette.blueBright}
        strokeWidth={0.9}
        fill="none"
        opacity={0.55}
      />,
    );
  }
  for (let i = 0; i < 7; i++) {
    const x = 96 + i * 18;
    lines.push(
      <Path
        key={`v${i}`}
        d={`M ${x} 84 Q ${150 + (x - 150) * 0.55} 190 ${x} 296`}
        stroke={palette.blueBright}
        strokeWidth={0.9}
        fill="none"
        opacity={0.5}
      />,
    );
  }
  return <G>{lines}</G>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  clip: { overflow: 'hidden', backgroundColor: palette.blueTint },
});
