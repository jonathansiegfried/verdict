// Hook to check system and app-level reduced motion preference
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export function useReducedMotion(): boolean {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const appReduceMotion = useAppStore((s) => s.settings.reduceMotion);

  useEffect(() => {
    // Check initial system setting
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // App setting overrides system if explicitly set, but we default to system
  return appReduceMotion || systemReduceMotion;
}
