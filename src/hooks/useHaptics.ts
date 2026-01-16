// Hook for haptic feedback respecting user preferences
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHaptics() {
  const hapticsEnabled = useAppStore((s) => s.settings.hapticsEnabled);

  const trigger = useCallback(
    async (type: HapticType = 'light') => {
      if (!hapticsEnabled) return;

      try {
        switch (type) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case 'selection':
            await Haptics.selectionAsync();
            break;
        }
      } catch {
        // Haptics not available on this device
      }
    },
    [hapticsEnabled]
  );

  return { trigger, enabled: hapticsEnabled };
}
