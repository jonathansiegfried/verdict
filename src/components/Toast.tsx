// Toast - Lightweight toast notification component
import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  const insets = useSafeAreaInsets();
  const { tokens, reduceMotion } = useTheme();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withTiming(0, {
        duration: reduceMotion ? 0 : 200,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: reduceMotion ? 0 : 150 });

      // Auto hide after duration
      translateY.value = withDelay(
        duration,
        withTiming(-100, {
          duration: reduceMotion ? 0 : 200,
          easing: Easing.in(Easing.ease),
        }, () => {
          runOnJS(hide)();
        })
      );
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: reduceMotion ? 0 : 150 })
      );
    }
  }, [visible, duration, reduceMotion, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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
        },
        animatedStyle,
      ]}
    >
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
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    zIndex: 9999,
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
  message: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
});

// Toast state hook for easy use
import { useState } from 'react';

export function useToast() {
  const [toastState, setToastState] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = useCallback((message: string) => {
    setToastState({ visible: true, message });
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
