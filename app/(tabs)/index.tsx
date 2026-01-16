// Home Tab - Overview, recent analyses, quick stats
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
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
import { Card, PressableScale } from '../../src/components';
import { useAppStore } from '../../src/store/useAppStore';
import { useReducedMotion } from '../../src/hooks';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function HomeTab() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const settings = useAppStore((s) => s.settings);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);
  const loadInsights = useAppStore((s) => s.loadInsights);
  const weeklyInsights = useAppStore((s) => s.weeklyInsights);

  const remainingAnalyses = getRemainingAnalyses();
  const recentAnalyses = analysisSummaries.slice(0, 3);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Subtle pulse animation for stats
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 1], [0.6, 1]);
    return { opacity };
  });

  const handleOpenAnalysis = (id: string) => {
    router.push({ pathname: '/verdict', params: { id } });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(400)}
          style={styles.header}
        >
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Verdict+</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.statsSection}
        >
          <View style={styles.statsRow}>
            <Animated.View style={[styles.statCard, pulseStyle]}>
              <Text style={styles.statValue}>
                {weeklyInsights?.totalAnalyses || 0}
              </Text>
              <Text style={styles.statLabel}>This week</Text>
            </Animated.View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{analysisSummaries.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            {!settings.isPro && (
              <View style={styles.statCard}>
                <Text style={[styles.statValue, styles.statValueAccent]}>
                  {remainingAnalyses}
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
            style={styles.recentSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <PressableScale onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.viewAllLink}>View all</Text>
              </PressableScale>
            </View>

            <View style={styles.recentList}>
              {recentAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  onPress={() => handleOpenAnalysis(analysis.id)}
                  padding="md"
                  style={styles.recentCard}
                >
                  <Text style={styles.recentHeadline} numberOfLines={2}>
                    {analysis.verdictHeadline}
                  </Text>
                  <View style={styles.recentMeta}>
                    <Text style={styles.recentParticipants}>
                      {analysis.participantLabels.join(' vs ')}
                    </Text>
                    <Text style={styles.recentDate}>
                      {formatDate(analysis.createdAt)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
            style={styles.emptySection}
          >
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No analyses yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the Analyze tab to settle your first argument
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Pro Upsell */}
        {!settings.isPro && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(400)}
          >
            <PressableScale onPress={() => router.push('/upgrade')} style={styles.proCard}>
              <View style={styles.proContent}>
                <Text style={styles.proTitle}>Upgrade to Pro</Text>
                <Text style={styles.proSubtitle}>
                  Unlimited analyses, more sides, premium features
                </Text>
              </View>
              <Text style={styles.proArrow}>→</Text>
            </PressableScale>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statsSection: {
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statValueAccent: {
    color: colors.accent,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  recentSection: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  viewAllLink: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  recentList: {
    gap: spacing.md,
  },
  recentCard: {
    marginBottom: 0,
  },
  recentHeadline: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentParticipants: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  recentDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  emptySection: {
    marginBottom: spacing.xxl,
  },
  emptyStateCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  proCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  proContent: {
    flex: 1,
  },
  proTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  proSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  proArrow: {
    fontSize: typography.sizes.xl,
    color: colors.accent,
  },
});
