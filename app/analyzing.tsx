// Analyzing Screen - Staged loader showing analysis progress
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StagedLoader } from '../src/components';
import { useAppStore } from '../src/store/useAppStore';
import { ANALYSIS_STEPS } from '../src/types';
import { colors, spacing, typography } from '../src/constants/theme';

export default function AnalyzingScreen() {
  const router = useRouter();

  const startAnalysis = useAppStore((s) => s.startAnalysis);
  const isAnalyzing = useAppStore((s) => s.isAnalyzing);
  const currentAnalysis = useAppStore((s) => s.currentAnalysis);
  const analysisError = useAppStore((s) => s.analysisError);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Start analysis on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startAnalysis().catch(() => {
        // Error handled in store
      });
    }
  }, [hasStarted, startAnalysis]);

  // Simulate step progression
  useEffect(() => {
    if (!isAnalyzing && hasStarted) {
      // Analysis finished, jump to complete
      setIsComplete(true);
      return;
    }

    if (isAnalyzing && currentStepIndex < ANALYSIS_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
      }, 600); // Progress every 600ms

      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStepIndex, hasStarted]);

  // Navigate to verdict when complete
  const handleComplete = useCallback(() => {
    if (currentAnalysis) {
      router.replace({
        pathname: '/verdict',
        params: { id: currentAnalysis.id },
      });
    }
  }, [currentAnalysis, router]);

  // Handle error
  useEffect(() => {
    if (analysisError) {
      // Go back on error
      router.back();
    }
  }, [analysisError, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Analyzing</Text>
        <Text style={styles.subtitle}>
          Processing the arguments...
        </Text>

        <View style={styles.loaderContainer}>
          <StagedLoader
            steps={ANALYSIS_STEPS}
            currentStepIndex={currentStepIndex}
            isComplete={isComplete}
            onComplete={handleComplete}
          />
        </View>

        <Text style={styles.hint}>
          This analysis is performed locally and privately
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  loaderContainer: {
    marginBottom: spacing.xxxl,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
