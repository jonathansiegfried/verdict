// AnalysisCard - Memoized card component for history list
// Prevents unnecessary rerenders when parent state changes

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInDown, SlideOutLeft, Layout } from 'react-native-reanimated';
import { Card, PressableScale } from './index';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import type { AnalysisSummary } from '../types';

interface AnalysisCardProps {
  analysis: AnalysisSummary;
  index: number;
  accentColor: string;
  reduceMotion: boolean;
  tokens: {
    motion: {
      staggerDelay: number;
      springDamping: number;
      springStiffness: number;
    };
  };
  compareMode: boolean;
  isSelected: boolean;
  onPress: (id: string) => void;
  onLongPress?: (analysis: AnalysisSummary) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function AnalysisCardComponent({
  analysis,
  index,
  accentColor,
  reduceMotion,
  tokens,
  compareMode,
  isSelected,
  onPress,
  onLongPress,
}: AnalysisCardProps) {
  // Memoize callbacks to prevent Card from rerendering
  const handlePress = useCallback(() => {
    onPress(analysis.id);
  }, [onPress, analysis.id]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress(analysis);
    }
  }, [onLongPress, analysis]);

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(index * tokens.motion.staggerDelay).duration(200).springify().damping(tokens.motion.springDamping).stiffness(tokens.motion.springStiffness)}
      exiting={reduceMotion ? undefined : SlideOutLeft.duration(200)}
      layout={reduceMotion ? undefined : Layout.springify().damping(tokens.motion.springDamping).stiffness(tokens.motion.springStiffness)}
    >
      <Card
        onPress={handlePress}
        onLongPress={compareMode ? undefined : handleLongPress}
        padding="md"
        style={[
          styles.analysisCard,
          compareMode && isSelected && { borderColor: accentColor, borderWidth: 2 },
        ]}
      >
        {compareMode && (
          <View style={[
            styles.selectionIndicator,
            isSelected && { backgroundColor: accentColor, borderColor: accentColor },
          ]}>
            {isSelected && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        )}
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
          <View style={[styles.styleTag, { backgroundColor: accentColor }]}>
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
  );
}

// Memoize the component to prevent unnecessary rerenders
// Only rerender if props actually change
export const AnalysisCard = memo(AnalysisCardComponent, (prevProps, nextProps) => {
  // Custom comparison - only check props that affect rendering
  return (
    prevProps.analysis.id === nextProps.analysis.id &&
    prevProps.analysis.verdictHeadline === nextProps.analysis.verdictHeadline &&
    prevProps.index === nextProps.index &&
    prevProps.accentColor === nextProps.accentColor &&
    prevProps.reduceMotion === nextProps.reduceMotion &&
    prevProps.compareMode === nextProps.compareMode &&
    prevProps.isSelected === nextProps.isSelected
    // Note: We intentionally don't check onPress/onLongPress since they should be stable callbacks
  );
});

const styles = StyleSheet.create({
  analysisCard: {
    marginBottom: spacing.md,
  },
  selectionIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkmark: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  analysisHeadline: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingRight: spacing.xxl,
  },
  analysisMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  analysisParticipants: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  analysisTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  analysisFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  styleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  styleTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textTransform: 'capitalize',
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
});
