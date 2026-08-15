import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** expo-haptics is a no-op on web; guard so the demo never throws in a browser. */
const enabled = Platform.OS !== 'web';

export const tap = () => {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const select = () => {
  if (enabled) Haptics.selectionAsync().catch(() => {});
};

export const success = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
