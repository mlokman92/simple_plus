import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

/** Wide-web viewports render the app inside a simulated phone. */
export const FRAME_BREAKPOINT = 900;

export function useFramed(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= FRAME_BREAKPOINT;
}

/**
 * Safe-area insets that also work inside the simulated phone on web, where the
 * real insets are always zero but a notch and home indicator are drawn.
 */
export function useInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  const framed = useFramed();

  if (framed) return { top: 54, bottom: 28, left: 0, right: 0 };
  if (Platform.OS === 'web') {
    return {
      top: Math.max(insets.top, 14),
      bottom: Math.max(insets.bottom, 8),
      left: insets.left,
      right: insets.right,
    };
  }
  return insets;
}
