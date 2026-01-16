// PressableScale - Base pressable component with scale animation
// Used as foundation for other interactive components
// Respects theme-specific motion tokens for preset differentiation
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, ViewStyle, StyleProp, AccessibilityRole, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../context/ThemeContext';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleValue?: number;
  style?: StyleProp<ViewStyle>;
  hapticOnPress?: boolean;
  hitSlop?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  // Optional: show pressed overlay for more visual feedback
  showPressedOverlay?: boolean;
}

export function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled = false,
  scaleValue = 0.97,
  style,
  hapticOnPress = true,
  hitSlop = 8,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  showPressedOverlay = false,
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();
  const { tokens } = useTheme();

  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  // Create spring config from theme motion tokens
  const springConfig = useMemo(() => ({
    damping: tokens.motion.springDamping,
    stiffness: tokens.motion.springStiffness,
  }), [tokens.motion]);

  const handlePress = useCallback(() => {
    if (hapticOnPress) {
      trigger('light');
    }
    onPress?.();
  }, [onPress, hapticOnPress, trigger]);

  const handleLongPress = useCallback(() => {
    if (hapticOnPress) {
      trigger('medium');
    }
    onLongPress?.();
  }, [onLongPress, hapticOnPress, trigger]);

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(10000)
    .onBegin(() => {
      if (!reduceMotion) {
        scale.value = withSpring(scaleValue, springConfig);
      }
      pressed.value = withTiming(1, { duration: 50 });
    })
    .onFinalize((_, success) => {
      if (!reduceMotion) {
        scale.value = withSpring(1, springConfig);
      }
      pressed.value = withTiming(0, { duration: 150 });
      if (success) {
        runOnJS(handlePress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const composedGesture = Gesture.Race(gesture, longPressGesture);

  const animatedStyle = useAnimatedStyle(() => {
    // Opacity dims more when pressed, and when disabled
    const baseOpacity = disabled ? 0.55 : 1;
    const pressedOpacity = 1 - (pressed.value * 0.1);

    return {
      transform: [{ scale: scale.value }],
      opacity: baseOpacity * pressedOpacity,
    };
  });

  // Optional overlay that shows on press for extra visual feedback
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: showPressedOverlay ? pressed.value * 0.08 : 0,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.container, style, animatedStyle]}
        hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
        accessible={true}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled,
        }}
      >
        {children}
        {/* Pressed overlay for extra visual feedback */}
        {showPressedOverlay && (
          <Animated.View
            style={[styles.pressedOverlay, overlayStyle]}
            pointerEvents="none"
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  pressedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
});
