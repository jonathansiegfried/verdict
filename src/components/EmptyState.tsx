// EmptyState - Polished empty state component with subtle animations
// Used when there's no content to display (no analyses, no history, etc.)
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './PressableScale';
import { useTheme } from '../context/ThemeContext';
import { colors, typography } from '../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal' | 'gradient';
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = '📋',
  title,
  subtitle,
  actionLabel,
  onAction,
  variant = 'default',
  style,
}: EmptyStateProps) {
  const { tokens, reduceMotion } = useTheme();

  // Floating animation for the icon
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      floatAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    return () => {
      floatAnim.value = 0;
    };
  }, [reduceMotion, floatAnim]);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnim.value, [0, 1], [0, -8]);
    const scale = interpolate(floatAnim.value, [0, 1], [1, 1.05]);

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Gradient glow behind icon
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(floatAnim.value, [0, 1], [0.3, 0.5]);
    const scale = interpolate(floatAnim.value, [0, 1], [0.9, 1.1]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const containerStyle = [
    styles.container,
    {
      backgroundColor: variant === 'minimal' ? 'transparent' : colors.surface,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing.xxxl,
      borderWidth: variant === 'minimal' ? 0 : 1,
      borderColor: colors.surfaceBorder,
    },
    style,
  ];

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(400)}
      style={containerStyle}
    >
      {/* Icon with floating animation */}
      <View style={styles.iconContainer}>
        {/* Gradient glow */}
        {variant !== 'minimal' && (
          <Animated.View style={[styles.iconGlow, glowAnimatedStyle]}>
            <LinearGradient
              colors={[colors.accent + '40', colors.accent + '00']}
              style={styles.iconGlowGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        )}
        <Animated.View style={iconAnimatedStyle}>
          <Text style={[styles.icon, { marginBottom: tokens.spacing.lg }]}>{icon}</Text>
        </Animated.View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { fontSize: tokens.typography.lg, marginBottom: tokens.spacing.sm }]}>
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={[styles.subtitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.xl }]}>
          {subtitle}
        </Text>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <PressableScale
          onPress={onAction}
          style={[
            styles.actionButton,
            {
              paddingHorizontal: tokens.spacing.xl,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.radius.full,
            },
          ]}
        >
          <Text style={[styles.actionButtonText, { fontSize: tokens.typography.base }]}>
            {actionLabel}
          </Text>
        </PressableScale>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlowGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.accent,
  },
  actionButtonText: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
