// StagedLoader - Animated multi-step loading indicator
// Shows progress through analysis stages with smooth transitions
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, spacing, typography, animation, borderRadius } from '../constants/theme';
import type { LoaderStep } from '../types';

interface StagedLoaderProps {
  steps: LoaderStep[];
  currentStepIndex: number;
  isComplete?: boolean;
  onComplete?: () => void;
}

export function StagedLoader({
  steps,
  currentStepIndex,
  isComplete = false,
  onComplete,
}: StagedLoaderProps) {
  const reduceMotion = useReducedMotion();
  const progressWidth = useSharedValue(0);

  // Calculate progress percentage
  const progressPercent = isComplete
    ? 100
    : Math.min(100, ((currentStepIndex + 0.5) / steps.length) * 100);

  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, {
      duration: reduceMotion ? 100 : animation.duration.normal,
    });
  }, [progressPercent, reduceMotion, progressWidth]);

  useEffect(() => {
    if (isComplete && onComplete) {
      const timer = setTimeout(onComplete, reduceMotion ? 100 : 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete, reduceMotion]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const currentStep = steps[currentStepIndex];
  const displayText = isComplete
    ? 'Analysis complete'
    : currentStep?.label || 'Processing...';

  return (
    <View style={styles.container}>
      {/* Current step text with animation */}
      <View style={styles.textContainer}>
        <Animated.Text
          key={displayText}
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          exiting={reduceMotion ? undefined : FadeOut.duration(150)}
          style={styles.stepText}
        >
          {displayText}
        </Animated.Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Step indicators */}
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = index < currentStepIndex || isComplete;

          return (
            <View key={step.id} style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  isDone && styles.stepDotDone,
                  isActive && styles.stepDotActive,
                ]}
              />
              <Text
                style={[
                  styles.stepLabel,
                  (isDone || isActive) && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {index + 1}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Completed steps list */}
      <View style={styles.completedList}>
        {steps.slice(0, currentStepIndex).map((step, index) => (
          <Animated.View
            key={step.id}
            entering={reduceMotion ? undefined : SlideInLeft.delay(index * 50).duration(200)}
            style={styles.completedItem}
          >
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.completedText}>
              {step.completedLabel || step.label.replace('...', '')}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  textContainer: {
    height: 32,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stepText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xxl,
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.textSecondary,
  },
  completedList: {
    width: '100%',
    gap: spacing.sm,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
