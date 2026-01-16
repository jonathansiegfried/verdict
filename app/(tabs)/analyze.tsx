// Analyze Tab - Main CTA screen to start new analysis
import React, { useEffect, useMemo } from 'react';
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
import { useHaptics } from '../../src/hooks';
import { useTheme } from '../../src/context/ThemeContext';
import { colors, typography, shadows } from '../../src/constants/theme';

export default function AnalyzeTab() {
  const router = useRouter();
  const { tokens, reduceMotion, getAccentColor, getGradient } = useTheme();
  const { trigger } = useHaptics();

  // Get preset-specific colors
  const accentColor = getAccentColor();
  const gradientColors = getGradient();

  const settings = useAppStore((s) => s.settings);
  const resetInput = useAppStore((s) => s.resetInput);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);

  const remainingAnalyses = getRemainingAnalyses();

  // Dynamic styles based on theme tokens and preset colors
  const dynamicStyles = useMemo(() => ({
    content: {
      flex: 1,
      paddingHorizontal: tokens.spacing.lg,
    },
    header: {
      marginTop: tokens.spacing.xl,
      alignItems: 'center' as const,
    },
    ctaSection: {
      alignItems: 'center' as const,
      marginTop: tokens.spacing.xxxl,
    },
    bigButtonContainer: {
      width: 180,
      height: 180,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: tokens.spacing.lg,
    },
    buttonGlow: {
      position: 'absolute' as const,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: accentColor,
    },
    bigButton: {
      width: 160,
      height: 160,
      borderRadius: tokens.radius.full === 9999 ? 80 : tokens.radius.lg * 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: tokens.button.borderWidth,
      borderColor: accentColor,
    },
    infoSection: {
      marginTop: tokens.spacing.xxl,
      alignItems: 'center' as const,
    },
    remainingContainer: {
      alignItems: 'center' as const,
      gap: tokens.spacing.sm,
    },
    proContainer: {
      backgroundColor: colors.successMuted,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.full,
    },
    featuresSection: {
      marginTop: 'auto' as const,
      marginBottom: tokens.spacing.xxl,
      gap: tokens.spacing.md,
    },
    featureItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.md,
      gap: tokens.spacing.md,
      borderWidth: tokens.card.borderWidth,
      borderColor: colors.surfaceBorder,
      ...(tokens.card.shadowOpacity > 0 ? {
        shadowColor: '#000',
        shadowOpacity: tokens.card.shadowOpacity,
        shadowRadius: tokens.card.shadowRadius,
        shadowOffset: { width: 0, height: tokens.card.shadowOffsetY },
        elevation: 4,
      } : {}),
    },
    upgradeLink: {
      color: accentColor,
    },
  }), [tokens, accentColor]);

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
      <View style={dynamicStyles.content}>
        {/* Header */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(400)}
          style={dynamicStyles.header}
        >
          <Text style={[styles.title, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
            New Analysis
          </Text>
          <Text style={[styles.subtitle, { fontSize: tokens.typography.base }]}>
            Get an AI-powered verdict on any argument
          </Text>
        </Animated.View>

        {/* Big CTA Button */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={dynamicStyles.ctaSection}
        >
          <View style={dynamicStyles.bigButtonContainer}>
            {/* Glow effect behind button */}
            <Animated.View style={[dynamicStyles.buttonGlow, glowStyle]} />

            {/* Main button */}
            <Pressable onPress={handleStartNew}>
              <Animated.View style={[styles.bigButtonWrapper, pulseStyle]}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={dynamicStyles.bigButton}
                >
                  <Text style={styles.bigButtonIcon}>+</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>

          <Text style={[styles.ctaLabel, { fontSize: tokens.typography.lg, marginBottom: tokens.spacing.xs }]}>
            Start Analysis
          </Text>
          <Text style={[styles.ctaHint, { fontSize: tokens.typography.sm }]}>Tap to begin</Text>
        </Animated.View>

        {/* Remaining analyses indicator */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
          style={dynamicStyles.infoSection}
        >
          {!settings.isPro ? (
            <View style={dynamicStyles.remainingContainer}>
              <Text style={[styles.remainingText, { fontSize: tokens.typography.sm }]}>
                {remainingAnalyses} free {remainingAnalyses === 1 ? 'analysis' : 'analyses'} left this week
              </Text>
              <Pressable onPress={() => router.push('/upgrade')}>
                <Text style={[styles.upgradeLink, dynamicStyles.upgradeLink, { fontSize: tokens.typography.sm }]}>Upgrade to Pro →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={dynamicStyles.proContainer}>
              <Text style={[styles.proText, { fontSize: tokens.typography.sm }]}>Unlimited analyses with Pro</Text>
            </View>
          )}
        </Animated.View>

        {/* Features - staggered entrance */}
        <View style={dynamicStyles.featuresSection}>
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300 + tokens.motion.staggerDelay * 0).duration(300).springify().damping(tokens.motion.springDamping)}
            style={dynamicStyles.featureItem}
          >
            <Text style={styles.featureIcon}>⚖️</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { fontSize: tokens.typography.base }]}>Neutral Analysis</Text>
              <Text style={[styles.featureDesc, { fontSize: tokens.typography.sm }]}>Unbiased evaluation of all sides</Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300 + tokens.motion.staggerDelay * 1).duration(300).springify().damping(tokens.motion.springDamping)}
            style={dynamicStyles.featureItem}
          >
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { fontSize: tokens.typography.base }]}>Clear Verdicts</Text>
              <Text style={[styles.featureDesc, { fontSize: tokens.typography.sm }]}>Win or peace - you decide the goal</Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300 + tokens.motion.staggerDelay * 2).duration(300).springify().damping(tokens.motion.springDamping)}
            style={dynamicStyles.featureItem}
          >
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { fontSize: tokens.typography.base }]}>Private & Local</Text>
              <Text style={[styles.featureDesc, { fontSize: tokens.typography.sm }]}>Your data stays on your device</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bigButtonWrapper: {
    ...shadows.lg,
  },
  bigButtonIcon: {
    fontSize: 56,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    marginTop: -4,
  },
  ctaLabel: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  ctaHint: {
    color: colors.textTertiary,
  },
  remainingText: {
    color: colors.textTertiary,
  },
  upgradeLink: {
    fontWeight: typography.weights.medium,
  },
  proText: {
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    color: colors.textSecondary,
  },
});
