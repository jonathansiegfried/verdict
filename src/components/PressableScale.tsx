// PressableScale - Base pressable component with scale animation
// Used as foundation for other interactive components
import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useHaptics } from '../hooks/useHaptics';
import { animation } from '../constants/theme';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleValue?: number;
  style?: StyleProp<ViewStyle>;
  hapticOnPress?: boolean;
  hitSlop?: number;
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
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

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
        scale.value = withSpring(scaleValue, animation.spring.stiff);
      }
      opacity.value = withTiming(0.9, { duration: 50 });
    })
    .onFinalize((_, success) => {
      if (!reduceMotion) {
        scale.value = withSpring(1, animation.spring.default);
      }
      opacity.value = withTiming(1, { duration: 100 });
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.55 : opacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.container, style, animatedStyle]}
        hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});
