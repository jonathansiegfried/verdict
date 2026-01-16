// Compare Screen - Side-by-side analysis comparison
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { PressableScale, Card } from '../src/components';
import { useTheme } from '../src/context/ThemeContext';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { getAnalysisById } from '../src/services/storage';
import type { AnalysisResult } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CompareScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const { tokens, reduceMotion, getAccentColor } = useTheme();
  const accentColor = getAccentColor();

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'patterns'>('overview');

  // Load analyses
  useEffect(() => {
    const loadAnalyses = async () => {
      if (!ids) return;
      const idList = ids.split(',');
      const loaded: AnalysisResult[] = [];

      for (const id of idList) {
        const analysis = await getAnalysisById(id);
        if (analysis) {
          loaded.push(analysis);
        }
      }

      setAnalyses(loaded);
      setLoading(false);
    };

    loadAnalyses();
  }, [ids]);

  // Calculate card width based on number of analyses
  const cardWidth = useMemo(() => {
    if (analyses.length === 2) return SCREEN_WIDTH * 0.45;
    return SCREEN_WIDTH * 0.38;
  }, [analyses.length]);

  const handleBack = () => {
    router.back();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading comparison...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (analyses.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not load analyses for comparison</Text>
          <PressableScale onPress={handleBack} style={[styles.backButton, { backgroundColor: accentColor }]}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(300)}
        style={styles.header}
      >
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={[styles.backLink, { color: accentColor }]}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Compare</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Tab Selector */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.delay(100).duration(300)}
        style={styles.tabContainer}
      >
        {(['overview', 'scores', 'patterns'] as const).map((tab) => (
          <PressableScale
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: accentColor }]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </PressableScale>
        ))}
      </Animated.View>

      {/* Comparison Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Analysis Headers */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(200).duration(300)}
          style={styles.compareRow}
        >
          {analyses.map((analysis, index) => (
            <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
              <Text style={styles.columnDate}>{formatDate(analysis.createdAt)}</Text>
              <Text style={styles.columnHeadline} numberOfLines={2}>
                {analysis.verdictHeadline}
              </Text>
              <Text style={styles.columnParticipants}>
                {analysis.input.sides.map((s) => s.label).join(' vs ')}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)}>
            {/* Winner/Outcome */}
            <View style={styles.compareSection}>
              <Text style={styles.sectionTitle}>Outcome</Text>
              <View style={styles.compareRow}>
                {analyses.map((analysis) => (
                  <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                    <Card padding="sm" style={styles.outcomeCard}>
                      {analysis.winAnalysis?.winnerId ? (
                        <>
                          <Text style={styles.outcomeLabel}>Winner</Text>
                          <Text style={[styles.outcomeValue, { color: accentColor }]}>
                            {analysis.winAnalysis.winnerLabel}
                          </Text>
                          <Text style={styles.outcomeConfidence}>
                            {analysis.winAnalysis.confidence}% confidence
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.outcomeLabel}>Result</Text>
                          <Text style={styles.outcomeValue}>Tie / Balanced</Text>
                        </>
                      )}
                    </Card>
                  </View>
                ))}
              </View>
            </View>

            {/* Style Used */}
            <View style={styles.compareSection}>
              <Text style={styles.sectionTitle}>Commentator Style</Text>
              <View style={styles.compareRow}>
                {analyses.map((analysis) => (
                  <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                    <View style={[styles.styleTag, { backgroundColor: accentColor }]}>
                      <Text style={styles.styleTagText}>
                        {analysis.input.commentatorStyle}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={styles.compareSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.compareRow}>
                {analyses.map((analysis) => (
                  <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                    <View style={styles.tagsContainer}>
                      {analysis.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Scores Tab */}
        {activeTab === 'scores' && (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)}>
            {/* Score categories */}
            {['clarity', 'evidenceQuality', 'logicalConsistency', 'fairness'].map((scoreKey) => (
              <View key={scoreKey} style={styles.compareSection}>
                <Text style={styles.sectionTitle}>
                  {scoreKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </Text>
                <View style={styles.compareRow}>
                  {analyses.map((analysis) => {
                    // Get average score across all sides
                    const avgScore = analysis.sideAnalyses.reduce(
                      (sum, side) => sum + (side.scores[scoreKey as keyof typeof side.scores] || 0),
                      0
                    ) / analysis.sideAnalyses.length;

                    return (
                      <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreValue}>{avgScore.toFixed(1)}</Text>
                          <View style={styles.scoreBar}>
                            <View
                              style={[
                                styles.scoreBarFill,
                                { width: `${avgScore * 10}%`, backgroundColor: accentColor },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(200)}>
            <View style={styles.compareSection}>
              <Text style={styles.sectionTitle}>Patterns Detected</Text>
              <View style={styles.compareRow}>
                {analyses.map((analysis) => (
                  <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                    {analysis.patternsDetected.length > 0 ? (
                      analysis.patternsDetected.slice(0, 4).map((pattern, idx) => (
                        <View key={idx} style={styles.patternItem}>
                          <Text style={styles.patternName}>{pattern.name}</Text>
                          <Text style={[styles.patternCount, { color: accentColor }]}>
                            {pattern.occurrences.length}x
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noPatterns}>No patterns detected</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Outcome Changers */}
            <View style={styles.compareSection}>
              <Text style={styles.sectionTitle}>What Would Change It</Text>
              <View style={styles.compareRow}>
                {analyses.map((analysis) => (
                  <View key={analysis.id} style={[styles.compareColumn, { width: cardWidth }]}>
                    {analysis.outcomeChangers.slice(0, 2).map((changer, idx) => (
                      <Text key={idx} style={styles.changerText} numberOfLines={3}>
                        {changer}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backLink: {
    fontSize: typography.sizes.base,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: spacing.sm,
  },
  compareColumn: {
    alignItems: 'center',
  },
  columnDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  columnHeadline: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  columnParticipants: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  compareSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  outcomeCard: {
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    width: '100%',
  },
  outcomeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  outcomeValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    textAlign: 'center',
  },
  outcomeConfidence: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  styleTag: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  styleTagText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
    width: '100%',
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  scoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    width: '100%',
  },
  patternName: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    flex: 1,
  },
  patternCount: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  noPatterns: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  changerText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * 1.4,
    marginBottom: spacing.sm,
  },
});
