// Toast - Lightweight toast notification component
// Supports different types (success, error, warning, info) with preset-specific animations
import React, { useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: ToastType;
}

// Icons for different toast types
const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

// Colors for different toast types
const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: colors.successMuted, border: colors.success, icon: colors.success },
  error: { bg: colors.errorMuted, border: colors.error, icon: colors.error },
  warning: { bg: colors.warningMuted, border: colors.warning, icon: colors.warning },
  info: { bg: colors.surfaceElevated, border: colors.accent, icon: colors.accent },
};

export function Toast({ message, visible, onHide, duration = 2500, type = 'info' }: ToastProps) {
  const insets = useSafeAreaInsets();
  const { tokens, reduceMotion, getAccentColor } = useTheme();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // Get colors based on type - use accent for info type
  const accentColor = getAccentColor();
  const toastColors = useMemo(() => {
    if (type === 'info') {
      return { bg: colors.surfaceElevated, border: accentColor, icon: accentColor };
    }
    return TOAST_COLORS[type];
  }, [type, accentColor]);

  // Spring config from theme
  const springConfig = useMemo(() => ({
    damping: tokens.motion.springDamping,
    stiffness: tokens.motion.springStiffness,
  }), [tokens.motion]);

  const hide = useCallback(() => {
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      // Show toast with spring animation
      if (reduceMotion) {
        translateY.value = 0;
        opacity.value = 1;
        scale.value = 1;
      } else {
        translateY.value = withSpring(0, springConfig);
        opacity.value = withTiming(1, { duration: 150 });
        scale.value = withSpring(1, springConfig);
      }

      // Auto hide after duration
      const hideAnimation = () => {
        if (reduceMotion) {
          translateY.value = -100;
          opacity.value = 0;
          scale.value = 0.9;
          runOnJS(hide)();
        } else {
          translateY.value = withTiming(-100, { duration: 200 });
          opacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(hide)();
          });
          scale.value = withTiming(0.9, { duration: 200 });
        }
      };

      const timeout = setTimeout(hideAnimation, duration);
      return () => clearTimeout(timeout);
    }
  }, [visible, duration, reduceMotion, hide, springConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 10,
          borderRadius: tokens.radius.lg,
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          backgroundColor: toastColors.bg,
          borderColor: toastColors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: toastColors.border }]}>
        <Text style={styles.icon}>{TOAST_ICONS[type]}</Text>
      </View>
      <Text style={[styles.message, { fontSize: tokens.typography.sm }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 9999,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
    fontSize: 14,
  },
  message: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
});

// Toast state hook for easy use
import { useState } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToastState({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    ...toastState,
    showToast,
    hideToast,
  };
}
