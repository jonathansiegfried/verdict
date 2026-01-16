// Hook for haptic feedback respecting user preferences
// Provides both raw haptic types and semantic patterns for common actions
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Semantic haptic patterns for common app actions
type HapticPattern =
  | 'buttonPress'       // Light tap for standard buttons
  | 'tabChange'         // Selection feedback for tab switches
  | 'toggleSwitch'      // Medium impact for toggle interactions
  | 'longPress'         // Medium feedback when long press triggers
  | 'delete'            // Warning notification for destructive actions
  | 'analysisComplete'  // Success celebration
  | 'analysisStart'     // Light tap when starting analysis
  | 'cardSelect'        // Selection for choosing cards/items
  | 'slider'            // Light tick for slider movement
  | 'doubleTap';        // Quick double light tap for special actions

// Small delay helper
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useHaptics() {
  const hapticsEnabled = useAppStore((s) => s.settings.hapticsEnabled);

  // Raw haptic trigger
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

  // Semantic pattern trigger - use these for consistent haptic language
  const pattern = useCallback(
    async (patternType: HapticPattern) => {
      if (!hapticsEnabled) return;

      try {
        switch (patternType) {
          case 'buttonPress':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'tabChange':
            await Haptics.selectionAsync();
            break;
          case 'toggleSwitch':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'longPress':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'delete':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'analysisComplete':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'analysisStart':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'cardSelect':
            await Haptics.selectionAsync();
            break;
          case 'slider':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'doubleTap':
            // Quick double tap pattern
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await wait(60);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        }
      } catch {
        // Haptics not available on this device
      }
    },
    [hapticsEnabled]
  );

  return { trigger, pattern, enabled: hapticsEnabled };
}
