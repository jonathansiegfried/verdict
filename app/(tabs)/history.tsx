// History Tab - All analyses grouped by date with long-press actions
import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  SlideOutLeft,
  FadeInDown,
} from 'react-native-reanimated';
import { Card, PressableScale, EmptyState } from '../../src/components';
import { useAppStore } from '../../src/store/useAppStore';
import { useHaptics } from '../../src/hooks';
import { useTheme } from '../../src/context/ThemeContext';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { AnalysisSummary } from '../../src/types';

interface GroupedAnalyses {
  title: string;
  data: AnalysisSummary[];
}

export default function HistoryTab() {
  const router = useRouter();
  const { trigger } = useHaptics();
  const { tokens, reduceMotion } = useTheme();

  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const deleteAnalysis = useAppStore((s) => s.deleteAnalysis);
  const renameAnalysis = useAppStore((s) => s.renameAnalysis);
  const duplicateAnalysis = useAppStore((s) => s.duplicateAnalysis);
  const weeklyInsights = useAppStore((s) => s.weeklyInsights);
  const loadInsights = useAppStore((s) => s.loadInsights);

  const [selectedItem, setSelectedItem] = useState<AnalysisSummary | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');

  // Dynamic styles based on theme tokens
  const dynamicStyles = useMemo(() => ({
    header: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.xl,
      paddingBottom: tokens.spacing.md,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.md,
      paddingBottom: tokens.spacing.xxxl,
    },
    insightCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.lg,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    emptyStateCard: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing.xxxl,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    emptyButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.radius.full,
    },
    styleTag: {
      backgroundColor: colors.accent,
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.radius.sm,
    },
    tag: {
      backgroundColor: colors.backgroundTertiary,
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.radius.sm,
    },
    actionSheet: {
      backgroundColor: colors.backgroundSecondary,
      borderTopLeftRadius: tokens.radius.xl,
      borderTopRightRadius: tokens.radius.xl,
      width: '100%' as const,
      paddingBottom: tokens.spacing.xxxl,
      paddingTop: tokens.spacing.md,
    },
    renameModal: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing.xl,
      width: '90%',
      maxWidth: 400,
    },
    renameInput: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.md,
      padding: tokens.spacing.md,
      fontSize: tokens.typography.base,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      marginBottom: tokens.spacing.lg,
    },
  }), [tokens]);

  // Load insights on mount
  React.useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Group analyses by date
  const groupedAnalyses = useMemo((): GroupedAnalyses[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const groups: Record<string, AnalysisSummary[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    analysisSummaries.forEach((analysis) => {
      const date = new Date(analysis.createdAt);
      const analysisDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (analysisDate.getTime() === today.getTime()) {
        groups['Today'].push(analysis);
      } else if (analysisDate.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(analysis);
      } else if (analysisDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        groups['This Week'].push(analysis);
      } else {
        groups['Older'].push(analysis);
      }
    });

    return Object.entries(groups)
      .filter(([_, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  }, [analysisSummaries]);

  const handleOpenAnalysis = (id: string) => {
    router.push({ pathname: '/verdict', params: { id } });
  };

  const handleLongPress = useCallback((item: AnalysisSummary) => {
    trigger('medium');
    setSelectedItem(item);
    setShowActionSheet(true);
  }, [trigger]);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;

    setShowActionSheet(false);

    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            trigger('warning');
            deleteAnalysis(selectedItem.id);
            setSelectedItem(null);
          },
        },
      ]
    );
  }, [selectedItem, deleteAnalysis, trigger]);

  const handleDuplicate = useCallback(async () => {
    if (!selectedItem) return;

    trigger('success');
    setShowActionSheet(false);

    try {
      await duplicateAnalysis(selectedItem.id);
    } catch {
      Alert.alert('Error', 'Could not duplicate the analysis. Please try again.');
    }
    setSelectedItem(null);
  }, [selectedItem, duplicateAnalysis, trigger]);

  const handleRename = useCallback(() => {
    if (!selectedItem) return;
    setRenameText(selectedItem.verdictHeadline);
    setShowActionSheet(false);
    setShowRenameModal(true);
  }, [selectedItem]);

  const handleRenameSubmit = useCallback(async () => {
    if (!selectedItem || !renameText.trim()) {
      setShowRenameModal(false);
      setSelectedItem(null);
      return;
    }

    trigger('success');
    setShowRenameModal(false);

    try {
      await renameAnalysis(selectedItem.id, renameText.trim());
    } catch {
      Alert.alert('Error', 'Could not rename the analysis. Please try again.');
    }
    setSelectedItem(null);
  }, [selectedItem, renameText, renameAnalysis, trigger]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(300)}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>
          {analysisSummaries.length} {analysisSummaries.length === 1 ? 'analysis' : 'analyses'}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Insights */}
        {weeklyInsights && weeklyInsights.totalAnalyses > 0 && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.delay(0).duration(300)}
            style={styles.insightsSection}
          >
            <View style={styles.insightsRow}>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>
                  {weeklyInsights.totalAnalyses}
                </Text>
                <Text style={styles.insightLabel}>This Week</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>
                  {weeklyInsights.mostUsedStyle}
                </Text>
                <Text style={styles.insightLabel}>Top Style</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Analysis List */}
        {analysisSummaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="📜"
              title="No analyses yet"
              subtitle="Your completed analyses will appear here"
              actionLabel="Start your first analysis"
              onAction={() => router.push('/(tabs)/analyze')}
            />
          </View>
        ) : (
          groupedAnalyses.map((group, groupIndex) => (
            <Animated.View
              key={group.title}
              entering={reduceMotion ? undefined : FadeIn.delay(groupIndex * 50).duration(200)}
              style={styles.groupSection}
            >
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.data.map((analysis, index) => (
                <Animated.View
                  key={analysis.id}
                  entering={reduceMotion ? undefined : FadeIn.delay(index * 30).duration(200)}
                  exiting={reduceMotion ? undefined : SlideOutLeft.duration(200)}
                  layout={reduceMotion ? undefined : Layout.springify()}
                >
                  <Card
                    onPress={() => handleOpenAnalysis(analysis.id)}
                    onLongPress={() => handleLongPress(analysis)}
                    padding="md"
                    style={styles.analysisCard}
                  >
                    <Text style={styles.analysisHeadline} numberOfLines={2}>
                      {analysis.verdictHeadline}
                    </Text>
                    <View style={styles.analysisMeta}>
                      <Text style={styles.analysisParticipants}>
                        {analysis.participantLabels.join(' vs ')}
                      </Text>
                      <Text style={styles.analysisTime}>
                        {formatTime(analysis.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.analysisFooter}>
                      <View style={styles.styleTag}>
                        <Text style={styles.styleTagText}>
                          {analysis.commentatorStyle}
                        </Text>
                      </View>
                      {analysis.tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </Animated.View>
          ))
        )}

        {/* Hint for long press */}
        {analysisSummaries.length > 0 && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.delay(300).duration(300)}
            style={styles.hintContainer}
          >
            <Text style={styles.hintText}>
              Long press on an item for more options
            </Text>
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowActionSheet(false)}
        >
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={styles.actionSheet}
          >
            <View style={styles.actionSheetHeader}>
              <Text style={styles.actionSheetTitle} numberOfLines={1}>
                {selectedItem?.verdictHeadline}
              </Text>
            </View>
            <PressableScale onPress={handleRename} style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <Text style={styles.actionButtonText}>Rename</Text>
            </PressableScale>
            <PressableScale onPress={handleDuplicate} style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📋</Text>
              <Text style={styles.actionButtonText}>Duplicate</Text>
            </PressableScale>
            <PressableScale onPress={handleDelete} style={[styles.actionButton, styles.actionButtonDanger]}>
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Delete</Text>
            </PressableScale>
            <PressableScale
              onPress={() => setShowActionSheet(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </PressableScale>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRenameModal(false)}
        >
          <Pressable style={styles.renameModal} onPress={() => {}}>
            <Text style={styles.renameTitle}>Rename Analysis</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Enter new title..."
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.renameButtons}>
              <PressableScale
                onPress={() => setShowRenameModal(false)}
                style={styles.renameCancelButton}
              >
                <Text style={styles.renameCancelText}>Cancel</Text>
              </PressableScale>
              <PressableScale
                onPress={handleRenameSubmit}
                style={styles.renameSaveButton}
              >
                <Text style={styles.renameSaveText}>Save</Text>
              </PressableScale>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  insightValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  insightLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingTop: spacing.xxxl,
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
    fontSize: 56,
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
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  emptyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  groupSection: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  analysisCard: {
    marginBottom: spacing.md,
  },
  analysisHeadline: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  analysisMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  analysisParticipants: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  analysisTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  analysisFooter: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  styleTag: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  styleTagText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
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
  hintContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionSheet: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    width: '100%',
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  actionSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  actionSheetTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButtonDanger: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  actionButtonTextDanger: {
    color: colors.error,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  renameModal: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  renameTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  renameInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
  },
  renameButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  renameCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  renameCancelText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  renameSaveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
  },
  renameSaveText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
});
