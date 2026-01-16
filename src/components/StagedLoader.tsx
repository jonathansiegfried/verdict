// StagedLoader - Animated multi-step loading indicator
// Shows progress through analysis stages with smooth transitions
// Uses theme tokens for preset-specific styling
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInLeft,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { colors, typography, animation } from '../constants/theme';
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
  const { tokens, reduceMotion, getAccentColor } = useTheme();
  const accentColor = getAccentColor();
  const progressWidth = useSharedValue(0);

  // Spring config from theme
  const springConfig = useMemo(() => ({
    damping: tokens.motion.springDamping,
    stiffness: tokens.motion.springStiffness,
  }), [tokens.motion]);

  // Calculate progress percentage
  const progressPercent = isComplete
    ? 100
    : Math.min(100, ((currentStepIndex + 0.5) / steps.length) * 100);

  useEffect(() => {
    if (reduceMotion) {
      progressWidth.value = progressPercent;
    } else {
      progressWidth.value = withSpring(progressPercent, springConfig);
    }
  }, [progressPercent, reduceMotion, progressWidth, springConfig]);

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

  // Dynamic styles based on theme tokens
  const dynamicStyles = useMemo(() => ({
    container: {
      paddingHorizontal: tokens.spacing.lg,
    },
    textContainer: {
      marginBottom: tokens.spacing.lg,
    },
    progressTrack: {
      borderRadius: tokens.radius.xs,
      marginBottom: tokens.spacing.xl,
    },
    progressFill: {
      backgroundColor: accentColor,
      borderRadius: tokens.radius.xs,
    },
    stepsRow: {
      marginBottom: tokens.spacing.xxl,
    },
    stepDotActive: {
      backgroundColor: accentColor,
    },
    completedList: {
      gap: tokens.spacing.sm,
    },
    completedItem: {
      gap: tokens.spacing.sm,
    },
    checkmark: {
      borderRadius: tokens.radius.full === 9999 ? 10 : tokens.radius.sm,
    },
  }), [tokens, accentColor]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Current step text with animation */}
      <View style={[styles.textContainer, dynamicStyles.textContainer]}>
        <Animated.Text
          key={displayText}
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          exiting={reduceMotion ? undefined : FadeOut.duration(150)}
          style={[styles.stepText, { fontSize: tokens.typography.lg }]}
        >
          {displayText}
        </Animated.Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, dynamicStyles.progressTrack]}>
        <Animated.View style={[styles.progressFill, dynamicStyles.progressFill, progressStyle]} />
      </View>

      {/* Step indicators */}
      <View style={[styles.stepsRow, dynamicStyles.stepsRow]}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = index < currentStepIndex || isComplete;

          return (
            <View key={step.id} style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  isDone && styles.stepDotDone,
                  isActive && [styles.stepDotActive, dynamicStyles.stepDotActive],
                ]}
              />
              <Text
                style={[
                  styles.stepLabel,
                  (isDone || isActive) && styles.stepLabelActive,
                  { fontSize: tokens.typography.xs },
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
      <View style={[styles.completedList, dynamicStyles.completedList]}>
        {steps.slice(0, currentStepIndex).map((step, index) => (
          <Animated.View
            key={step.id}
            entering={reduceMotion ? undefined : SlideInLeft.delay(index * tokens.motion.staggerDelay).duration(200).springify().damping(tokens.motion.springDamping)}
            style={[styles.completedItem, dynamicStyles.completedItem]}
          >
            <View style={[styles.checkmark, dynamicStyles.checkmark]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={[styles.completedText, { fontSize: tokens.typography.sm }]}>
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
  },
  textContainer: {
    height: 32,
    justifyContent: 'center',
  },
  stepText: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
    marginBottom: 4,
  },
  stepDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.textSecondary,
  },
  completedList: {
    width: '100%',
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    width: 20,
    height: 20,
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
    color: colors.textSecondary,
  },
});
