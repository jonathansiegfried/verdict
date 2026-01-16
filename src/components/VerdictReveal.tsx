// VerdictReveal - Animated verdict display with staggered reveals
// The "signature moment" of the app - headline slides in, bullets stagger, scores pop
// Uses theme tokens for preset-specific animations and styling
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../context/ThemeContext';
import { colors, typography, animation } from '../constants/theme';
import type { AnalysisResult } from '../types';

// Celebration sparkle particle component
interface SparkleProps {
  delay: number;
  x: number;
  y: number;
  reduceMotion: boolean;
  accentColor: string;
  springConfig: { damping: number; stiffness: number };
}

function Sparkle({ delay, x, y, reduceMotion, accentColor, springConfig }: SparkleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    // Animate sparkle with delay using theme's spring config
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, springConfig),
        withSpring(0, springConfig)
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
  }, [delay, reduceMotion, springConfig]);

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
      <Text style={[styles.sparkleText, { color: accentColor }]}>✦</Text>
    </Animated.View>
  );
}

// Celebration container component
interface CelebrationProps {
  reduceMotion: boolean;
  accentColor: string;
  springConfig: { damping: number; stiffness: number };
  staggerDelay: number;
}

function CelebrationEffect({ reduceMotion, accentColor, springConfig, staggerDelay }: CelebrationProps) {
  if (reduceMotion) return null;

  // Predefined sparkle positions around the center with theme-based delays
  const sparkles = [
    { x: -40, y: -30, delay: staggerDelay * 4 },
    { x: 40, y: -25, delay: staggerDelay * 5 },
    { x: -50, y: 10, delay: staggerDelay * 6 },
    { x: 55, y: 5, delay: staggerDelay * 7 },
    { x: -30, y: 35, delay: staggerDelay * 5.5 },
    { x: 35, y: 40, delay: staggerDelay * 6.5 },
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
          accentColor={accentColor}
          springConfig={springConfig}
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
  springConfig: { damping: number; stiffness: number };
  radius: number;
}

function ScoreChip({ label, score, delay, reduceMotion, springConfig, radius }: ScoreChipProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = withDelay(delay, withSpring(1, springConfig));
      opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    }
  }, [delay, reduceMotion, scale, opacity, springConfig]);

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
    <Animated.View style={[styles.scoreChip, { borderRadius: radius }, chipStyle]}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
        {score.toFixed(1)}
      </Text>
    </Animated.View>
  );
}

export function VerdictReveal({ result, outcomeMode }: VerdictRevealProps) {
  const { tokens, reduceMotion, getAccentColor } = useTheme();
  const { trigger } = useHaptics();
  const hasTriggeredHaptic = useRef(false);
  const [showContent, setShowContent] = useState(false);

  // Get theme-specific values
  const accentColor = getAccentColor();
  const springConfig = useMemo(() => ({
    damping: tokens.motion.springDamping,
    stiffness: tokens.motion.springStiffness,
  }), [tokens.motion]);
  const staggerDelay = tokens.motion.staggerDelay;

  // Pulse animation for the verdict badge
  const pulseScale = useSharedValue(1);

  // 2-STEP REVEAL: Brief pause before showing content
  useEffect(() => {
    if (reduceMotion) {
      setShowContent(true);
      return;
    }

    // Step 1: Brief anticipation pause (600ms)
    const revealTimer = setTimeout(() => {
      setShowContent(true);
    }, 600);

    return () => clearTimeout(revealTimer);
  }, [reduceMotion]);

  // Trigger haptic and pulse when content appears
  useEffect(() => {
    if (!showContent) return;

    if (!hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = true;
      // Heavy haptic for the "moment of truth"
      trigger('success');

      // Soft pulse animation on the badge using theme's spring config
      if (!reduceMotion) {
        pulseScale.value = withSequence(
          withTiming(1.08, { duration: 150 }),
          withTiming(0.97, { duration: 100 }),
          withSpring(1, springConfig)
        );
      }
    }
  }, [showContent, trigger, reduceMotion, pulseScale, springConfig]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Dynamic styles based on theme tokens
  const dynamicStyles = useMemo(() => ({
    container: {
      paddingHorizontal: tokens.spacing.lg,
    },
    anticipationContainer: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.xxxl,
    },
    anticipationText: {
      fontSize: tokens.typography.lg,
      marginBottom: tokens.spacing.lg,
    },
    anticipationDots: {
      gap: tokens.spacing.sm,
    },
    dot: {
      backgroundColor: accentColor,
    },
    headline: {
      fontSize: tokens.typography.xxl,
      marginBottom: tokens.spacing.md,
    },
    explanation: {
      fontSize: tokens.typography.base,
      marginBottom: tokens.spacing.xl,
    },
    winnerBadge: {
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.radius.lg,
    },
    peaceBadge: {
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.radius.lg,
      borderColor: accentColor,
      gap: tokens.spacing.sm,
    },
    peaceLabel: {
      fontSize: tokens.typography.md,
      color: accentColor,
    },
    bulletList: {
      marginBottom: tokens.spacing.xl,
      gap: tokens.spacing.md,
    },
    bulletItem: {
      gap: tokens.spacing.sm,
    },
    bulletDot: {
      backgroundColor: accentColor,
    },
    scoresContainer: {
      marginBottom: tokens.spacing.xl,
    },
    scoresTitle: {
      fontSize: tokens.typography.sm,
      marginBottom: tokens.spacing.md,
    },
    scoresGrid: {
      gap: tokens.spacing.sm,
    },
    patternsContainer: {
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.lg,
    },
    patternsTitle: {
      fontSize: tokens.typography.sm,
      marginBottom: tokens.spacing.md,
    },
    patternItem: {
      marginBottom: tokens.spacing.md,
    },
    patternName: {
      fontSize: tokens.typography.base,
      marginBottom: tokens.spacing.xs,
    },
    patternDesc: {
      fontSize: tokens.typography.sm,
    },
  }), [tokens, accentColor]);

  // Adjusted delays using theme's stagger (after the 600ms initial pause)
  const headlineDelay = 0;
  const explanationDelay = staggerDelay * 3;
  const bulletBaseDelay = staggerDelay * 7;
  const bulletStagger = staggerDelay;
  const scoreBaseDelay = staggerDelay * 12;
  const scoreStagger = staggerDelay * 1.5;

  // Don't render anything during the anticipation pause (creates the "moment")
  if (!showContent && !reduceMotion) {
    return (
      <View style={[styles.anticipationContainer, dynamicStyles.anticipationContainer]}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.anticipationContent}
        >
          <Text style={[styles.anticipationText, dynamicStyles.anticipationText]}>Analyzing...</Text>
          <View style={[styles.anticipationDots, dynamicStyles.anticipationDots]}>
            <Animated.View
              style={[styles.dot, dynamicStyles.dot, { opacity: 0.4 }]}
            />
            <Animated.View
              style={[styles.dot, dynamicStyles.dot, { opacity: 0.6 }]}
            />
            <Animated.View
              style={[styles.dot, dynamicStyles.dot, { opacity: 0.8 }]}
            />
          </View>
        </Animated.View>
      </View>
    );
  }

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
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Headline */}
      <Animated.Text
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.delay(headlineDelay).duration(250).springify().damping(springConfig.damping)
        }
        style={[styles.headline, dynamicStyles.headline]}
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
        style={[styles.explanation, dynamicStyles.explanation]}
      >
        {result.verdictExplanation}
      </Animated.Text>

      {/* Winner badge for win mode with celebration + pulse */}
      {outcomeMode === 'win' && result.winAnalysis?.winnerLabel && (
        <View style={styles.winnerBadgeContainer}>
          <CelebrationEffect
            reduceMotion={reduceMotion}
            accentColor={accentColor}
            springConfig={springConfig}
            staggerDelay={staggerDelay}
          />
          <Animated.View
            entering={
              reduceMotion
                ? undefined
                : FadeInUp.delay(bulletBaseDelay - staggerDelay * 2).duration(200).springify().damping(springConfig.damping)
            }
            style={[styles.winnerBadge, dynamicStyles.winnerBadge, pulseStyle]}
          >
            <Text style={styles.winnerLabel}>
              {result.winAnalysis.winnerLabel}
            </Text>
            <Text style={styles.winnerSubtext}>stronger case</Text>
          </Animated.View>
        </View>
      )}

      {/* Peace badge for peace mode with pulse */}
      {outcomeMode === 'peace' && (
        <View style={styles.winnerBadgeContainer}>
          <CelebrationEffect
            reduceMotion={reduceMotion}
            accentColor={accentColor}
            springConfig={springConfig}
            staggerDelay={staggerDelay}
          />
          <Animated.View
            entering={
              reduceMotion
                ? undefined
                : FadeInUp.delay(bulletBaseDelay - staggerDelay * 2).duration(200).springify().damping(springConfig.damping)
            }
            style={[styles.peaceBadge, dynamicStyles.peaceBadge, pulseStyle]}
          >
            <Text style={styles.peaceIcon}>🕊️</Text>
            <Text style={[styles.peaceLabel, dynamicStyles.peaceLabel]}>Path to Resolution</Text>
          </Animated.View>
        </View>
      )}

      {/* Bullet points */}
      <View style={[styles.bulletList, dynamicStyles.bulletList]}>
        {bullets.map((bullet, index) => (
          <Animated.View
            key={index}
            entering={
              reduceMotion
                ? undefined
                : FadeInDown.delay(bulletBaseDelay + index * bulletStagger)
                    .duration(200)
                    .springify()
                    .damping(springConfig.damping)
            }
            style={[styles.bulletItem, dynamicStyles.bulletItem]}
          >
            <View style={[styles.bulletDot, dynamicStyles.bulletDot]} />
            <Text style={styles.bulletText}>{bullet}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Score chips */}
      {sideScores && (
        <View style={[styles.scoresContainer, dynamicStyles.scoresContainer]}>
          <Text style={[styles.scoresTitle, dynamicStyles.scoresTitle]}>Average Scores</Text>
          <View style={[styles.scoresGrid, dynamicStyles.scoresGrid]}>
            <ScoreChip
              label="Clarity"
              score={sideScores.clarity}
              delay={scoreBaseDelay}
              reduceMotion={reduceMotion}
              springConfig={springConfig}
              radius={tokens.radius.md}
            />
            <ScoreChip
              label="Evidence"
              score={sideScores.evidenceQuality}
              delay={scoreBaseDelay + scoreStagger}
              reduceMotion={reduceMotion}
              springConfig={springConfig}
              radius={tokens.radius.md}
            />
            <ScoreChip
              label="Logic"
              score={sideScores.logicalConsistency}
              delay={scoreBaseDelay + scoreStagger * 2}
              reduceMotion={reduceMotion}
              springConfig={springConfig}
              radius={tokens.radius.md}
            />
            <ScoreChip
              label="Fairness"
              score={sideScores.fairness}
              delay={scoreBaseDelay + scoreStagger * 3}
              reduceMotion={reduceMotion}
              springConfig={springConfig}
              radius={tokens.radius.md}
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
              : FadeIn.delay(scoreBaseDelay + staggerDelay * 8).duration(200)
          }
          style={[styles.patternsContainer, dynamicStyles.patternsContainer]}
        >
          <Text style={[styles.patternsTitle, dynamicStyles.patternsTitle]}>Patterns Detected</Text>
          {result.patternsDetected.map((pattern, index) => (
            <View key={index} style={[styles.patternItem, dynamicStyles.patternItem]}>
              <Text style={[styles.patternName, dynamicStyles.patternName]}>{pattern.name}</Text>
              <Text style={[styles.patternDesc, dynamicStyles.patternDesc]}>{pattern.description}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  // Anticipation pause state (the "moment of truth" build-up)
  anticipationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  anticipationContent: {
    alignItems: 'center',
  },
  anticipationText: {
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  anticipationDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headline: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  explanation: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  },
  winnerBadgeContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  winnerBadge: {
    backgroundColor: colors.successMuted,
    alignItems: 'center',
  },
  peaceBadge: {
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  peaceIcon: {
    fontSize: 20,
  },
  peaceLabel: {
    fontWeight: typography.weights.semibold,
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
  bulletList: {},
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  scoresContainer: {},
  scoresTitle: {
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  patternsTitle: {
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patternItem: {},
  patternName: {
    fontWeight: typography.weights.semibold,
    color: colors.warning,
  },
  patternDesc: {
    color: colors.textSecondary,
  },
});
