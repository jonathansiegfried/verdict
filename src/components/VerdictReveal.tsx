// VerdictReveal - Animated verdict display with staggered reveals
// The "signature moment" of the app - headline slides in, bullets stagger, scores pop
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useHaptics } from '../hooks/useHaptics';
import { colors, spacing, typography, borderRadius, animation } from '../constants/theme';
import type { AnalysisResult } from '../types';

// Celebration sparkle particle component
interface SparkleProps {
  delay: number;
  x: number;
  y: number;
  reduceMotion: boolean;
}

function Sparkle({ delay, x, y, reduceMotion }: SparkleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    // Animate sparkle with delay
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(0, { damping: 10, stiffness: 150 })
      )
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(300, withTiming(0, { duration: 200 }))
      )
    );
    rotation.value = withDelay(
      delay,
      withTiming(180, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, [delay, reduceMotion]);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (reduceMotion) return null;

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: x, top: y },
        sparkleStyle,
      ]}
    >
      <Text style={styles.sparkleText}>✦</Text>
    </Animated.View>
  );
}

// Celebration container component
function CelebrationEffect({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;

  // Predefined sparkle positions around the center
  const sparkles = [
    { x: -40, y: -30, delay: 200 },
    { x: 40, y: -25, delay: 280 },
    { x: -50, y: 10, delay: 360 },
    { x: 55, y: 5, delay: 440 },
    { x: -30, y: 35, delay: 320 },
    { x: 35, y: 40, delay: 400 },
  ];

  return (
    <View style={styles.celebrationContainer}>
      {sparkles.map((sparkle, index) => (
        <Sparkle
          key={index}
          x={sparkle.x}
          y={sparkle.y}
          delay={sparkle.delay}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

interface VerdictRevealProps {
  result: AnalysisResult;
  outcomeMode: 'win' | 'peace';
}

interface ScoreChipProps {
  label: string;
  score: number;
  delay: number;
  reduceMotion: boolean;
}

function ScoreChip({ label, score, delay, reduceMotion }: ScoreChipProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withDelay(delay, withSpring(1, animation.spring.bouncy));
      opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    }
  }, [delay, reduceMotion, scale, opacity]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Color based on score
  const getScoreColor = () => {
    if (score >= 7) return colors.success;
    if (score >= 5) return colors.warning;
    return colors.error;
  };

  return (
    <Animated.View style={[styles.scoreChip, chipStyle]}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
        {score.toFixed(1)}
      </Text>
    </Animated.View>
  );
}

export function VerdictReveal({ result, outcomeMode }: VerdictRevealProps) {
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();
  const hasTriggeredHaptic = useRef(false);

  // Trigger success haptic once on mount
  useEffect(() => {
    if (!hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = true;
      const delay = reduceMotion ? 0 : 300;
      setTimeout(() => trigger('success'), delay);
    }
  }, [trigger, reduceMotion]);

  const headlineDelay = 0;
  const explanationDelay = 200;
  const bulletBaseDelay = 400;
  const bulletStagger = 60;
  const scoreBaseDelay = 700;
  const scoreStagger = 80;

  // Get bullets based on outcome mode
  const bullets =
    outcomeMode === 'win'
      ? [
          result.winAnalysis?.reasoning,
          `Confidence: ${result.winAnalysis?.confidence}%`,
          ...result.outcomeChangers.slice(0, 2),
        ].filter(Boolean) as string[]
      : [
          ...result.peaceAnalysis?.stepsForward || [],
          result.peaceAnalysis?.suggestedCompromise,
        ].filter(Boolean) as string[];

  // Get average scores from first side (representative)
  const sideScores = result.sideAnalyses[0]?.scores;

  return (
    <View style={styles.container}>
      {/* Headline */}
      <Animated.Text
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.delay(headlineDelay).duration(250).springify()
        }
        style={styles.headline}
      >
        {result.verdictHeadline}
      </Animated.Text>

      {/* Explanation */}
      <Animated.Text
        entering={
          reduceMotion
            ? undefined
            : FadeIn.delay(explanationDelay).duration(200)
        }
        style={styles.explanation}
      >
        {result.verdictExplanation}
      </Animated.Text>

      {/* Winner badge for win mode with celebration */}
      {outcomeMode === 'win' && result.winAnalysis?.winnerLabel && (
        <View style={styles.winnerBadgeContainer}>
          <CelebrationEffect reduceMotion={reduceMotion} />
          <Animated.View
            entering={
              reduceMotion
                ? undefined
                : FadeInUp.delay(bulletBaseDelay - 100).duration(200).springify()
            }
            style={styles.winnerBadge}
          >
            <Text style={styles.winnerLabel}>
              {result.winAnalysis.winnerLabel}
            </Text>
            <Text style={styles.winnerSubtext}>stronger case</Text>
          </Animated.View>
        </View>
      )}

      {/* Peace badge for peace mode */}
      {outcomeMode === 'peace' && (
        <View style={styles.winnerBadgeContainer}>
          <CelebrationEffect reduceMotion={reduceMotion} />
          <Animated.View
            entering={
              reduceMotion
                ? undefined
                : FadeInUp.delay(bulletBaseDelay - 100).duration(200).springify()
            }
            style={styles.peaceBadge}
          >
            <Text style={styles.peaceIcon}>🕊️</Text>
            <Text style={styles.peaceLabel}>Path to Resolution</Text>
          </Animated.View>
        </View>
      )}

      {/* Bullet points */}
      <View style={styles.bulletList}>
        {bullets.map((bullet, index) => (
          <Animated.View
            key={index}
            entering={
              reduceMotion
                ? undefined
                : FadeInDown.delay(bulletBaseDelay + index * bulletStagger)
                    .duration(200)
            }
            style={styles.bulletItem}
          >
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{bullet}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Score chips */}
      {sideScores && (
        <View style={styles.scoresContainer}>
          <Text style={styles.scoresTitle}>Average Scores</Text>
          <View style={styles.scoresGrid}>
            <ScoreChip
              label="Clarity"
              score={sideScores.clarity}
              delay={scoreBaseDelay}
              reduceMotion={reduceMotion}
            />
            <ScoreChip
              label="Evidence"
              score={sideScores.evidenceQuality}
              delay={scoreBaseDelay + scoreStagger}
              reduceMotion={reduceMotion}
            />
            <ScoreChip
              label="Logic"
              score={sideScores.logicalConsistency}
              delay={scoreBaseDelay + scoreStagger * 2}
              reduceMotion={reduceMotion}
            />
            <ScoreChip
              label="Fairness"
              score={sideScores.fairness}
              delay={scoreBaseDelay + scoreStagger * 3}
              reduceMotion={reduceMotion}
            />
          </View>
        </View>
      )}

      {/* Patterns detected */}
      {result.patternsDetected.length > 0 && (
        <Animated.View
          entering={
            reduceMotion
              ? undefined
              : FadeIn.delay(scoreBaseDelay + 400).duration(200)
          }
          style={styles.patternsContainer}
        >
          <Text style={styles.patternsTitle}>Patterns Detected</Text>
          {result.patternsDetected.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternName}>{pattern.name}</Text>
              <Text style={styles.patternDesc}>{pattern.description}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  headline: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.sizes.xxl * typography.lineHeights.tight,
  },
  explanation: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  // Celebration sparkle styles
  celebrationContainer: {
    position: 'absolute',
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 16,
    color: colors.accent,
  },
  winnerBadgeContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  winnerBadge: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  peaceBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  peaceIcon: {
    fontSize: 20,
  },
  peaceLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  winnerLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  winnerSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    opacity: 0.8,
  },
  bulletList: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  scoresContainer: {
    marginBottom: spacing.xl,
  },
  scoresTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scoreChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  patternsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  patternsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  patternItem: {
    marginBottom: spacing.md,
  },
  patternName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  patternDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
