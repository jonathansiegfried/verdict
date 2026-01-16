// Home Tab - Overview, recent analyses, quick stats
import React, { useEffect, useMemo } from 'react';
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
import { Card, PressableScale, EmptyState } from '../../src/components';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/context/ThemeContext';
import { colors, typography } from '../../src/constants/theme';

export default function HomeTab() {
  const router = useRouter();
  const { tokens, reduceMotion } = useTheme();

  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const settings = useAppStore((s) => s.settings);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);
  const loadInsights = useAppStore((s) => s.loadInsights);
  const weeklyInsights = useAppStore((s) => s.weeklyInsights);

  const remainingAnalyses = getRemainingAnalyses();
  const recentAnalyses = analysisSummaries.slice(0, 3);

  // Dynamic styles based on theme tokens
  const dynamicStyles = useMemo(() => ({
    scrollContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xxxl,
    },
    header: {
      marginTop: tokens.spacing.xl,
      marginBottom: tokens.spacing.xxl,
    },
    statsRow: {
      flexDirection: 'row' as const,
      gap: tokens.spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.lg,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    sectionHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: tokens.spacing.md,
    },
    recentList: {
      gap: tokens.spacing.md,
    },
    emptyStateCard: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing.xxxl,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    proCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.accent,
    },
  }), [tokens]);

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
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(400)}
          style={dynamicStyles.header}
        >
          <Text style={[styles.greeting, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.xs }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { fontSize: tokens.typography.xxxl }]}>Verdict+</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={[styles.statsSection, { marginBottom: tokens.spacing.xxl }]}
        >
          <View style={dynamicStyles.statsRow}>
            <Animated.View style={[dynamicStyles.statCard, pulseStyle]}>
              <Text style={[styles.statValue, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                {weeklyInsights?.totalAnalyses || 0}
              </Text>
              <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>This week</Text>
            </Animated.View>
            <View style={dynamicStyles.statCard}>
              <Text style={[styles.statValue, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                {analysisSummaries.length}
              </Text>
              <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>Total</Text>
            </View>
            {!settings.isPro && (
              <View style={dynamicStyles.statCard}>
                <Text style={[styles.statValue, styles.statValueAccent, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                  {remainingAnalyses}
                </Text>
                <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>Remaining</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
            style={[styles.recentSection, { marginBottom: tokens.spacing.xxl }]}
          >
            <View style={dynamicStyles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: tokens.typography.lg }]}>Recent</Text>
              <PressableScale onPress={() => router.push('/(tabs)/history')}>
                <Text style={[styles.viewAllLink, { fontSize: tokens.typography.sm }]}>View all</Text>
              </PressableScale>
            </View>

            <View style={dynamicStyles.recentList}>
              {recentAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  onPress={() => handleOpenAnalysis(analysis.id)}
                  padding="md"
                  style={styles.recentCard}
                >
                  <Text style={[styles.recentHeadline, { fontSize: tokens.typography.base, marginBottom: tokens.spacing.sm }]} numberOfLines={2}>
                    {analysis.verdictHeadline}
                  </Text>
                  <View style={styles.recentMeta}>
                    <Text style={[styles.recentParticipants, { fontSize: tokens.typography.sm }]}>
                      {analysis.participantLabels.join(' vs ')}
                    </Text>
                    <Text style={[styles.recentDate, { fontSize: tokens.typography.xs }]}>
                      {formatDate(analysis.createdAt)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={[styles.emptySection, { marginBottom: tokens.spacing.xxl }]}>
            <EmptyState
              icon="⚖️"
              title="No analyses yet"
              subtitle="Tap the Analyze tab to settle your first argument"
              actionLabel="Start First Analysis"
              onAction={() => router.push('/(tabs)/analyze')}
            />
          </View>
        )}

        {/* Pro Upsell */}
        {!settings.isPro && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(400)}
          >
            <PressableScale onPress={() => router.push('/upgrade')} style={dynamicStyles.proCard}>
              <View style={styles.proContent}>
                <Text style={[styles.proTitle, { fontSize: tokens.typography.base, marginBottom: tokens.spacing.xs }]}>
                  Upgrade to Pro
                </Text>
                <Text style={[styles.proSubtitle, { fontSize: tokens.typography.sm }]}>
                  Unlimited analyses, more sides, premium features
                </Text>
              </View>
              <Text style={[styles.proArrow, { fontSize: tokens.typography.xl }]}>→</Text>
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
  greeting: {
    color: colors.textTertiary,
  },
  title: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statsSection: {},
  statValue: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statValueAccent: {
    color: colors.accent,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  recentSection: {},
  sectionTitle: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  viewAllLink: {
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  recentCard: {
    marginBottom: 0,
  },
  recentHeadline: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentParticipants: {
    color: colors.textSecondary,
  },
  recentDate: {
    color: colors.textTertiary,
  },
  emptySection: {},
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  proContent: {
    flex: 1,
  },
  proTitle: {
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  proSubtitle: {
    color: colors.textSecondary,
  },
  proArrow: {
    color: colors.accent,
  },
});
