import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, type CircleProps } from 'react-native-svg';

import { palette } from '@/theme';
import { Txt } from '@/components/ui/primitives';

/**
 * Animated.createAnimatedComponent injects `collapsable={false}`, a React Native
 * layout hint. react-native-svg forwards unknown props onto the DOM node on web,
 * where React rejects it as a non-boolean attribute — so drop it on the way in.
 */
const PlainCircle = React.forwardRef<
  React.ComponentRef<typeof Circle>,
  CircleProps & { collapsable?: boolean }
>(function PlainCircle({ collapsable, ...rest }, ref) {
  void collapsable;
  return <Circle ref={ref} {...rest} />;
});

const AnimatedCircle = Animated.createAnimatedComponent(PlainCircle);

export interface ScoreRingProps {
  /** 0-100. */
  score: number;
  size?: number;
  strokeWidth?: number;
  /** Content in the middle. Defaults to the score + "/100". */
  children?: React.ReactNode;
  colors?: [string, string];
  track?: string;
  /** Sweep in on mount. */
  animate?: boolean;
  /** Unique gradient id — required when several rings share a screen. */
  gradientId?: string;
  label?: string;
}

export function ScoreRing({
  score,
  size = 132,
  strokeWidth = 11,
  children,
  colors = [palette.hydration, palette.greenBright],
  track = '#E4EFF9',
  animate = true,
  gradientId = 'scoreRing',
  label = '/100',
}: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;

  const progress = useRef(new Animated.Value(animate ? 0 : pct)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct,
      duration: animate ? 1200 : 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, animate, progress]);

  const dashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [c, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashoffset as unknown as number}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {children ?? (
          <>
            <Txt
              variant="number"
              style={{ fontSize: size * 0.3, lineHeight: size * 0.34 }}
            >
              {Math.round(score)}
            </Txt>
            <Txt variant="caption" tone="muted" style={{ marginTop: -2 }}>
              {label}
            </Txt>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
