// Analyze Tab - Main CTA screen to start new analysis
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../src/store/useAppStore';
import { useReducedMotion, useHaptics } from '../../src/hooks';
import { colors, spacing, typography, shadows, borderRadius } from '../../src/constants/theme';

export default function AnalyzeTab() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();

  const settings = useAppStore((s) => s.settings);
  const resetInput = useAppStore((s) => s.resetInput);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);

  const remainingAnalyses = getRemainingAnalyses();

  // Pulse animation for the big button
  const pulseAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      // Subtle breathing pulse
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      // Glow animation
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnim.value, [0, 1], [1, 1.03]);
    return {
      transform: [{ scale }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glowAnim.value, [0, 1], [0.3, 0.7]);
    const scale = interpolate(glowAnim.value, [0, 1], [1, 1.2]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const handleStartNew = () => {
    trigger('medium');
    resetInput();
    router.push('/input');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(400)}
          style={styles.header}
        >
          <Text style={styles.title}>New Analysis</Text>
          <Text style={styles.subtitle}>
            Get an AI-powered verdict on any argument
          </Text>
        </Animated.View>

        {/* Big CTA Button */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.ctaSection}
        >
          <View style={styles.bigButtonContainer}>
            {/* Glow effect behind button */}
            <Animated.View style={[styles.buttonGlow, glowStyle]} />

            {/* Main button */}
            <Pressable onPress={handleStartNew}>
              <Animated.View style={[styles.bigButtonWrapper, pulseStyle]}>
                <LinearGradient
                  colors={[colors.accent, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bigButton}
                >
                  <Text style={styles.bigButtonIcon}>+</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>

          <Text style={styles.ctaLabel}>Start Analysis</Text>
          <Text style={styles.ctaHint}>Tap to begin</Text>
        </Animated.View>

        {/* Remaining analyses indicator */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
          style={styles.infoSection}
        >
          {!settings.isPro ? (
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingText}>
                {remainingAnalyses} free {remainingAnalyses === 1 ? 'analysis' : 'analyses'} left this week
              </Text>
              <Pressable onPress={() => router.push('/upgrade')}>
                <Text style={styles.upgradeLink}>Upgrade to Pro →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.proContainer}>
              <Text style={styles.proText}>Unlimited analyses with Pro</Text>
            </View>
          )}
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(400)}
          style={styles.featuresSection}
        >
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚖️</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Neutral Analysis</Text>
              <Text style={styles.featureDesc}>Unbiased evaluation of all sides</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Clear Verdicts</Text>
              <Text style={styles.featureDesc}>Win or peace - you decide the goal</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Private & Local</Text>
              <Text style={styles.featureDesc}>Your data stays on your device</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  bigButtonContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  buttonGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accent,
  },
  bigButtonWrapper: {
    ...shadows.lg,
  },
  bigButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonIcon: {
    fontSize: 56,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    marginTop: -4,
  },
  ctaLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ctaHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  infoSection: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  remainingContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  remainingText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  upgradeLink: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  proContainer: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  proText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  featuresSection: {
    marginTop: 'auto',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
