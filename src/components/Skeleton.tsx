// Skeleton Loading Component
// Provides visual placeholders while content is loading for perceived speed

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius: radius = borderRadius.md, style }: SkeletonProps) {
  const { reduceMotion } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [reduceMotion, shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = reduceMotion
      ? 0.5
      : interpolate(shimmer.value, [0, 1], [0.3, 0.6]);

    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius: radius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Preset skeleton patterns
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.card, { borderRadius: tokens.radius.lg, padding: tokens.spacing.lg }, style]}>
      <Skeleton width="70%" height={16} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="90%" height={12} style={{ marginBottom: spacing.xs }} />
      <Skeleton width="60%" height={12} style={{ marginBottom: spacing.md }} />
      <View style={styles.cardFooter}>
        <Skeleton width={60} height={24} borderRadius={borderRadius.full} />
        <Skeleton width={40} height={20} />
      </View>
    </View>
  );
}

export function SkeletonHistoryList() {
  return (
    <View style={styles.list}>
      <Skeleton width={80} height={12} style={{ marginBottom: spacing.md }} />
      <SkeletonCard style={{ marginBottom: spacing.md }} />
      <SkeletonCard style={{ marginBottom: spacing.md }} />
      <SkeletonCard />
    </View>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: i === lines - 1 ? 0 : spacing.sm }}
        />
      ))}
    </View>
  );
}

export function SkeletonVerdictHeader() {
  const { tokens } = useTheme();

  return (
    <View style={[styles.verdictHeader, { padding: tokens.spacing.lg }]}>
      <Skeleton width="50%" height={24} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
      <Skeleton width="80%" height={16} style={{ alignSelf: 'center', marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={60} borderRadius={tokens.radius.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  verdictHeader: {
    alignItems: 'stretch',
  },
});
