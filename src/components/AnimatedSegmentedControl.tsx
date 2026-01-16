// AnimatedSegmentedControl - Sliding pill selector with haptic feedback
// Used for commentator style, evidence mode, and outcome mode selection
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useHaptics } from '../hooks/useHaptics';
import { colors, borderRadius, spacing, typography, animation } from '../constants/theme';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
}

interface AnimatedSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'default' | 'compact';
}

export function AnimatedSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
}: AnimatedSegmentedControlProps<T>) {
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();

  const segmentWidth = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  const selectedIndex = options.findIndex((opt) => opt.id === value);

  // Update position when value changes
  useEffect(() => {
    if (containerWidth.value > 0) {
      const width = containerWidth.value / options.length;
      const targetX = selectedIndex * width;

      if (reduceMotion) {
        translateX.value = targetX;
      } else {
        translateX.value = withSpring(targetX, animation.spring.default);
      }
    }
  }, [selectedIndex, containerWidth.value, options.length, reduceMotion, translateX]);

  const handleContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      containerWidth.value = width;
      segmentWidth.value = width / options.length;

      // Set initial position without animation
      translateX.value = selectedIndex * (width / options.length);
    },
    [options.length, selectedIndex, containerWidth, segmentWidth, translateX]
  );

  const handleSelect = useCallback(
    (id: T) => {
      trigger('selection');
      onChange(id);
    },
    [onChange, trigger]
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth.value,
  }));

  const isCompact = size === 'compact';
  const height = isCompact ? 36 : 44;
  const fontSize = isCompact ? typography.sizes.sm : typography.sizes.base;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={handleContainerLayout}
    >
      {/* Sliding pill background */}
      <Animated.View style={[styles.pill, pillStyle]} />

      {/* Segment options */}
      {options.map((option, index) => {
        const isSelected = option.id === value;

        const tapGesture = Gesture.Tap()
          .onEnd(() => {
            if (!isSelected) {
              runOnJS(handleSelect)(option.id);
            }
          });

        return (
          <GestureDetector key={option.id} gesture={tapGesture}>
            <View style={styles.segment}>
              <Text
                style={[
                  styles.segmentLabel,
                  { fontSize },
                  isSelected && styles.segmentLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </View>
          </GestureDetector>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 3,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md - 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentLabel: {
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  segmentLabelSelected: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
});
