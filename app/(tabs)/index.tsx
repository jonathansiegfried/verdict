// Home Tab - Overview, recent analyses, quick stats
import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useHaptics } from '../../src/hooks';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { AnalysisTemplate } from '../../src/types';
import type { DraftData } from '../../src/services/storage';

export default function HomeTab() {
  const router = useRouter();
  const { tokens, reduceMotion } = useTheme();
  const { trigger } = useHaptics();

  // Draft state
  const [savedDraft, setSavedDraft] = useState<DraftData | null>(null);

  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const settings = useAppStore((s) => s.settings);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);
  const loadInsights = useAppStore((s) => s.loadInsights);
  const weeklyInsights = useAppStore((s) => s.weeklyInsights);

  // Templates
  const recentTemplates = useAppStore((s) => s.recentTemplates);
  const templates = useAppStore((s) => s.templates);
  const loadAllTemplates = useAppStore((s) => s.loadAllTemplates);
  const applyTemplate = useAppStore((s) => s.applyTemplate);
  const useTemplate = useAppStore((s) => s.useTemplate);

  // Draft
  const loadSavedDraft = useAppStore((s) => s.loadSavedDraft);
  const clearSavedDraft = useAppStore((s) => s.clearSavedDraft);
  const restoreDraft = useAppStore((s) => s.restoreDraft);

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

  // Load insights, templates, and check for drafts on mount
  useEffect(() => {
    loadInsights();
    loadAllTemplates();

    // Check for saved draft
    const checkDraft = async () => {
      const draft = await loadSavedDraft();
      if (draft) {
        setSavedDraft(draft);
      }
    };
    checkDraft();
  }, [loadInsights, loadAllTemplates, loadSavedDraft]);

  // Draft handlers
  const handleResumeDraft = useCallback(() => {
    if (!savedDraft) return;
    trigger('light');
    restoreDraft(savedDraft);
    setSavedDraft(null);
    router.push('/input');
  }, [savedDraft, restoreDraft, router, trigger]);

  const handleDiscardDraft = useCallback(async () => {
    trigger('light');
    await clearSavedDraft();
    setSavedDraft(null);
  }, [clearSavedDraft, trigger]);

  // Templates to show in Quick Start: recent if available, otherwise defaults
  const quickStartTemplates = recentTemplates.length > 0
    ? recentTemplates
    : templates.slice(0, 3);

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

  const handleSelectTemplate = async (template: AnalysisTemplate) => {
    applyTemplate(template);
    await useTemplate(template.id);
    router.push('/(tabs)/analyze');
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

  const formatDraftTime = (timestamp: number) => {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'yesterday';
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

        {/* Draft Banner */}
        {savedDraft && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(50).duration(300)}
            style={styles.draftBanner}
          >
            <View style={styles.draftBannerContent}>
              <Text style={styles.draftBannerIcon}>📝</Text>
              <View style={styles.draftBannerText}>
                <Text style={styles.draftBannerTitle}>Unsaved Draft</Text>
                <Text style={styles.draftBannerSubtitle}>
                  {savedDraft.sides.length} sides • saved {formatDraftTime(savedDraft.savedAt)}
                </Text>
              </View>
            </View>
            <View style={styles.draftBannerActions}>
              <PressableScale
                onPress={handleDiscardDraft}
                style={styles.draftDiscardButton}
                accessibilityLabel="Discard draft"
              >
                <Text style={styles.draftDiscardText}>Discard</Text>
              </PressableScale>
              <PressableScale
                onPress={handleResumeDraft}
                style={styles.draftResumeButton}
                accessibilityLabel="Resume draft"
              >
                <Text style={styles.draftResumeText}>Resume</Text>
              </PressableScale>
            </View>
          </Animated.View>
        )}

        {/* Stats Cards */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={[styles.statsSection, { marginBottom: tokens.spacing.xxl }]}
        >
          <View style={dynamicStyles.statsRow} accessibilityRole="summary">
            <Animated.View
              style={[dynamicStyles.statCard, pulseStyle]}
              accessible={true}
              accessibilityLabel={`${weeklyInsights?.totalAnalyses || 0} analyses this week`}
            >
              <Text style={[styles.statValue, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                {weeklyInsights?.totalAnalyses || 0}
              </Text>
              <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>This week</Text>
            </Animated.View>
            <View
              style={dynamicStyles.statCard}
              accessible={true}
              accessibilityLabel={`${analysisSummaries.length} total analyses`}
            >
              <Text style={[styles.statValue, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                {analysisSummaries.length}
              </Text>
              <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>Total</Text>
            </View>
            {!settings.isPro && (
              <View
                style={dynamicStyles.statCard}
                accessible={true}
                accessibilityLabel={`${remainingAnalyses} analyses remaining this week`}
              >
                <Text style={[styles.statValue, styles.statValueAccent, { fontSize: tokens.typography.xxl, marginBottom: tokens.spacing.xs }]}>
                  {remainingAnalyses}
                </Text>
                <Text style={[styles.statLabel, { fontSize: tokens.typography.xs }]}>Remaining</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Start Templates */}
        {quickStartTemplates.length > 0 && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
            style={[styles.quickStartSection, { marginBottom: tokens.spacing.xxl }]}
          >
            <Text style={[styles.sectionTitle, { fontSize: tokens.typography.lg, marginBottom: tokens.spacing.md }]}>
              Quick Start
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickStartScrollContent}
            >
              {quickStartTemplates.map((template) => (
                <PressableScale
                  key={template.id}
                  onPress={() => handleSelectTemplate(template)}
                  style={styles.templateCard}
                  accessibilityLabel={`${template.title}. ${template.description || ''}`}
                  accessibilityHint="Double tap to start analysis with this template"
                >
                  <Text style={[styles.templateTitle, { fontSize: tokens.typography.base }]} numberOfLines={1}>
                    {template.title}
                  </Text>
                  {template.description && (
                    <Text style={[styles.templateDescription, { fontSize: tokens.typography.xs }]} numberOfLines={2}>
                      {template.description}
                    </Text>
                  )}
                  <View style={styles.templateMeta}>
                    <Text style={[styles.templateSides, { fontSize: tokens.typography.xs }]}>
                      {template.sides.length} sides
                    </Text>
                    {template.useCount > 0 && (
                      <Text style={[styles.templateUseCount, { fontSize: tokens.typography.xs }]}>
                        Used {template.useCount}×
                      </Text>
                    )}
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(400)}
            style={[styles.recentSection, { marginBottom: tokens.spacing.xxl }]}
          >
            <View style={dynamicStyles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: tokens.typography.lg }]}>Recent</Text>
              <PressableScale
                onPress={() => router.push('/(tabs)/history')}
                accessibilityLabel="View all analyses"
                accessibilityHint="Opens the history tab"
              >
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
                  accessibilityLabel={`${analysis.verdictHeadline}. ${analysis.participantLabels.join(' versus ')}. ${formatDate(analysis.createdAt)}`}
                  accessibilityHint="Double tap to view analysis details"
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
            entering={reduceMotion ? undefined : FadeInDown.delay(400).duration(400)}
          >
            <PressableScale
              onPress={() => router.push('/upgrade')}
              style={dynamicStyles.proCard}
              accessibilityLabel="Upgrade to Pro. Unlimited analyses, more sides, premium features"
              accessibilityHint="Double tap to view upgrade options"
            >
              <View style={styles.proContent}>
                <Text style={[styles.proTitle, { fontSize: tokens.typography.base, marginBottom: tokens.spacing.xs }]}>
                  Upgrade to Pro
                </Text>
                <Text style={[styles.proSubtitle, { fontSize: tokens.typography.sm }]}>
                  Unlimited analyses, more sides, premium features
                </Text>
              </View>
              <Text style={[styles.proArrow, { fontSize: tokens.typography.xl }]} importantForAccessibility="no">→</Text>
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
  draftBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  draftBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  draftBannerIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  draftBannerText: {
    flex: 1,
  },
  draftBannerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  draftBannerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  draftBannerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  draftDiscardButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  draftDiscardText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  draftResumeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  draftResumeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
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
  quickStartSection: {},
  quickStartScrollContent: {
    gap: spacing.md,
    paddingRight: spacing.xs,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: 160,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  templateTitle: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  templateDescription: {
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  templateSides: {
    color: colors.textTertiary,
  },
  templateUseCount: {
    color: colors.accent,
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
