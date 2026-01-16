// Verdict Screen - Display analysis results with Win/Peace tabs
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  VerdictReveal,
  AnimatedSegmentedControl,
  PrimaryButton,
  Card,
} from '../src/components';
import { useAppStore } from '../src/store/useAppStore';
import { getAnalysisById, saveTakeaway } from '../src/services/storage';
import { useHaptics } from '../src/hooks';
import { useTheme } from '../src/context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../src/constants/theme';
import type { AnalysisResult, OutcomeType } from '../src/types';

export default function VerdictScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trigger } = useHaptics();
  const { getAccentColor } = useTheme();
  const accentColor = getAccentColor();

  const currentAnalysis = useAppStore((s) => s.currentAnalysis);
  const resetInput = useAppStore((s) => s.resetInput);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outcomeMode, setOutcomeMode] = useState<OutcomeType>('win');
  const [loading, setLoading] = useState(true);

  // Reflection Loop state
  const [takeawayText, setTakeawayText] = useState('');
  const [takeawayExpanded, setTakeawayExpanded] = useState(false);
  const [takeawaySaving, setTakeawaySaving] = useState(false);
  const [takeawaySaved, setTakeawaySaved] = useState(false);

  // Load analysis
  useEffect(() => {
    async function loadAnalysis() {
      setLoading(true);

      // First check if it's the current analysis
      if (currentAnalysis?.id === id) {
        setAnalysis(currentAnalysis);
        setTakeawayText(currentAnalysis.takeaway || '');
        setTakeawaySaved(!!currentAnalysis.takeaway);
        setLoading(false);
        return;
      }

      // Otherwise load from storage
      if (id) {
        const stored = await getAnalysisById(id);
        setAnalysis(stored);
        if (stored?.takeaway) {
          setTakeawayText(stored.takeaway);
          setTakeawaySaved(true);
        }
      }

      setLoading(false);
    }

    loadAnalysis();
  }, [id, currentAnalysis]);

  // Handle saving takeaway
  const handleSaveTakeaway = useCallback(async () => {
    if (!analysis || !takeawayText.trim()) return;

    setTakeawaySaving(true);
    try {
      await saveTakeaway(analysis.id, takeawayText.trim());
      trigger('success');
      setTakeawaySaved(true);
      setTakeawayExpanded(false);
    } catch {
      trigger('error');
    }
    setTakeawaySaving(false);
  }, [analysis, takeawayText, trigger]);

  const toggleTakeaway = useCallback(() => {
    trigger('light');
    setTakeawayExpanded((prev) => !prev);
  }, [trigger]);

  const handleBack = () => {
    router.back();
  };

  const handleNewAnalysis = () => {
    resetInput();
    router.replace('/input');
  };

  const handleGoHome = () => {
    // Navigate to home tab
    router.dismissAll();
  };

  const outcomeOptions = [
    { id: 'win' as const, label: 'Win' },
    { id: 'peace' as const, label: 'Peace' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Analysis not found</Text>
          <PrimaryButton label="Go Home" onPress={handleGoHome} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={[styles.backButton, { color: accentColor }]}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Verdict</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Outcome Mode Tabs */}
        <View style={styles.tabsContainer}>
          <AnimatedSegmentedControl
            options={outcomeOptions}
            value={outcomeMode}
            onChange={setOutcomeMode}
          />
        </View>

        {/* Verdict Reveal */}
        <VerdictReveal result={analysis} outcomeMode={outcomeMode} />

        {/* Side Analyses */}
        <View style={styles.sidesSection}>
          <Text style={styles.sidesTitle}>Side-by-Side Analysis</Text>

          {analysis.sideAnalyses.map((side) => (
            <Card key={side.sideId} padding="lg" style={styles.sideCard}>
              <Text style={styles.sideName}>{side.label}</Text>
              <Text style={styles.sideSummary}>{side.summary}</Text>

              {/* Claims */}
              {side.claims.length > 0 && (
                <View style={styles.sideSection}>
                  <Text style={styles.sideSectionTitle}>Key Claims</Text>
                  {side.claims.map((claim, i) => (
                    <Text key={i} style={styles.sideBullet}>
                      • {claim}
                    </Text>
                  ))}
                </View>
              )}

              {/* Flagged Assumptions (Strict Mode) */}
              {side.flaggedAssumptions && side.flaggedAssumptions.length > 0 && (
                <View style={[styles.sideSection, styles.flaggedSection]}>
                  <Text style={styles.flaggedTitle}>Flagged Assumptions</Text>
                  {side.flaggedAssumptions.map((assumption, i) => (
                    <Text key={i} style={styles.flaggedBullet}>
                      ⚠ {assumption}
                    </Text>
                  ))}
                </View>
              )}

              {/* Scores */}
              <View style={styles.scoresRow}>
                <ScorePill label="Clarity" score={side.scores.clarity} />
                <ScorePill label="Evidence" score={side.scores.evidenceQuality} />
                <ScorePill label="Logic" score={side.scores.logicalConsistency} />
              </View>
            </Card>
          ))}
        </View>

        {/* What Would Change the Outcome */}
        <View style={styles.changersSection}>
          <Text style={styles.changersTitle}>What Would Change the Outcome</Text>
          {analysis.outcomeChangers.map((changer, i) => (
            <View key={i} style={styles.changerItem}>
              <Text style={[styles.changerBullet, { color: accentColor }]}>→</Text>
              <Text style={styles.changerText}>{changer}</Text>
            </View>
          ))}
        </View>

        {/* Reflection Loop - My Takeaway */}
        <View style={styles.takeawaySection}>
          <Pressable
            onPress={toggleTakeaway}
            style={styles.takeawayHeader}
            accessibilityLabel={takeawaySaved ? 'View your takeaway' : 'Add your takeaway'}
            accessibilityHint="Expand to write your personal reflection"
          >
            <View style={styles.takeawayHeaderLeft}>
              <Text style={styles.takeawayIcon}>{takeawaySaved ? '💡' : '✏️'}</Text>
              <Text style={styles.takeawayTitle}>
                {takeawaySaved ? 'My Takeaway' : 'Add a Takeaway'}
              </Text>
            </View>
            <Text style={styles.takeawayExpand}>
              {takeawayExpanded ? '−' : '+'}
            </Text>
          </Pressable>

          {takeawayExpanded && (
            <View style={styles.takeawayContent}>
              <Text style={styles.takeawayPrompt}>
                What did you learn? What will you do differently?
              </Text>
              <TextInput
                style={styles.takeawayInput}
                value={takeawayText}
                onChangeText={setTakeawayText}
                placeholder="Write your personal reflection..."
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
              />
              <Pressable
                onPress={handleSaveTakeaway}
                disabled={takeawaySaving || !takeawayText.trim()}
                style={[
                  styles.takeawaySaveButton,
                  { backgroundColor: accentColor },
                  (!takeawayText.trim() || takeawaySaving) && styles.takeawaySaveButtonDisabled,
                ]}
              >
                <Text style={[
                  styles.takeawaySaveText,
                  (!takeawayText.trim() || takeawaySaving) && styles.takeawaySaveTextDisabled,
                ]}>
                  {takeawaySaving ? 'Saving...' : takeawaySaved ? 'Update' : 'Save'}
                </Text>
              </Pressable>
            </View>
          )}

          {!takeawayExpanded && takeawaySaved && takeawayText && (
            <Text style={styles.takeawayPreview} numberOfLines={2}>
              {takeawayText}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <PrimaryButton
            label="New Analysis"
            onPress={handleNewAnalysis}
          />
          <Pressable onPress={handleGoHome} style={styles.homeLink}>
            <Text style={styles.homeLinkText}>Return to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  const getColor = () => {
    if (score >= 7) return colors.success;
    if (score >= 5) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.scorePill}>
      <Text style={styles.scorePillLabel}>{label}</Text>
      <Text style={[styles.scorePillValue, { color: getColor() }]}>
        {score.toFixed(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
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
  backButton: {
    fontSize: typography.sizes.base,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sidesSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sidesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sideCard: {
    marginBottom: spacing.md,
  },
  sideName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sideSummary: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  sideSection: {
    marginBottom: spacing.md,
  },
  sideSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sideBullet: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  flaggedSection: {
    backgroundColor: colors.warningMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  flaggedTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  flaggedBullet: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  scorePillLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  scorePillValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  changersSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  changersTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  changerItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  changerBullet: {
    fontSize: typography.sizes.base,
    color: colors.accent,
  },
  changerText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  takeawaySection: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  takeawayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  takeawayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  takeawayIcon: {
    fontSize: 20,
  },
  takeawayTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  takeawayExpand: {
    fontSize: typography.sizes.xl,
    color: colors.textTertiary,
    fontWeight: '300' as const,
  },
  takeawayContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  takeawayPrompt: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  takeawayInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: spacing.md,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  takeawaySaveButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-end',
  },
  takeawaySaveButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
  },
  takeawaySaveText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  takeawaySaveTextDisabled: {
    color: colors.textTertiary,
  },
  takeawayPreview: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  actionsSection: {
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  homeLink: {
    alignItems: 'center',
    padding: spacing.md,
  },
  homeLinkText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
