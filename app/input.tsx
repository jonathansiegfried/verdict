// Input Screen - Enter sides, select modes, start analysis
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  PrimaryButton,
  AnimatedSegmentedControl,
  PressableScale,
  Header,
} from '../src/components';
import { useAppStore } from '../src/store/useAppStore';
import { useReducedMotion, useHaptics } from '../src/hooks';
import { useTheme } from '../src/context/ThemeContext';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  commentatorStyles,
  evidenceModes,
} from '../src/constants/theme';
import { FREE_TIER_LIMITS, PRO_TIER_LIMITS } from '../src/types';
import type { CommentatorStyle } from '../src/constants/theme';

export default function InputScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();
  const { getAccentColor } = useTheme();
  const accentColor = getAccentColor();

  const currentSides = useAppStore((s) => s.currentSides);
  const currentCommentatorStyle = useAppStore((s) => s.currentCommentatorStyle);
  const currentEvidenceMode = useAppStore((s) => s.currentEvidenceMode);
  const currentContext = useAppStore((s) => s.currentContext);
  const settings = useAppStore((s) => s.settings);

  const updateSide = useAppStore((s) => s.updateSide);
  const addSide = useAppStore((s) => s.addSide);
  const removeSide = useAppStore((s) => s.removeSide);
  const setCommentatorStyle = useAppStore((s) => s.setCommentatorStyle);
  const setEvidenceMode = useAppStore((s) => s.setEvidenceMode);
  const setContext = useAppStore((s) => s.setContext);
  const canStartAnalysis = useAppStore((s) => s.canStartAnalysis);
  const getRemainingAnalyses = useAppStore((s) => s.getRemainingAnalyses);
  const saveCurrentDraft = useAppStore((s) => s.saveCurrentDraft);
  const loadSavedDraft = useAppStore((s) => s.loadSavedDraft);
  const clearSavedDraft = useAppStore((s) => s.clearSavedDraft);
  const restoreDraft = useAppStore((s) => s.restoreDraft);

  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for saved draft on mount
  useEffect(() => {
    if (hasCheckedDraft) return;

    const checkDraft = async () => {
      const draft = await loadSavedDraft();
      setHasCheckedDraft(true);

      if (draft) {
        // Check if current state is empty (default)
        const currentIsEmpty = currentSides.every(s => s.content.trim() === '');

        if (currentIsEmpty) {
          Alert.alert(
            'Restore Draft?',
            'You have an unsaved draft from earlier. Would you like to continue where you left off?',
            [
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => clearSavedDraft(),
              },
              {
                text: 'Restore',
                onPress: () => restoreDraft(draft),
              },
            ]
          );
        }
      }
    };

    checkDraft();
  }, [hasCheckedDraft, loadSavedDraft, clearSavedDraft, restoreDraft, currentSides]);

  // Autosave on content changes (debounced)
  useEffect(() => {
    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Set new autosave timer (save after 2 seconds of no changes)
    autosaveTimerRef.current = setTimeout(() => {
      saveCurrentDraft();
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [currentSides, currentCommentatorStyle, currentEvidenceMode, currentContext, saveCurrentDraft]);

  const remainingAnalyses = getRemainingAnalyses();
  const maxSides = settings.isPro ? PRO_TIER_LIMITS.maxSides : FREE_TIER_LIMITS.maxSides;
  const canAddSide = currentSides.length < maxSides;
  const canRemoveSide = currentSides.length > 2;
  const isValid = canStartAnalysis();

  // handleBack removed - now using shared Header component

  const handleAnalyze = useCallback(() => {
    if (!isValid) {
      if (remainingAnalyses === 0) {
        router.push('/upgrade');
      }
      return;
    }
    // Clear draft when starting analysis
    clearSavedDraft();
    router.push('/analyzing');
  }, [isValid, remainingAnalyses, router, clearSavedDraft]);

  const handleAddSide = () => {
    trigger('light');
    addSide();
  };

  const handleRemoveSide = (id: string) => {
    trigger('light');
    removeSide(id);
  };

  // Prepare commentator options for segmented control
  const styleOptions = commentatorStyles.map((s) => ({
    id: s.id,
    label: s.label,
  }));

  const evidenceOptions = evidenceModes.map((m) => ({
    id: m.id,
    label: m.label,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Header title="New Analysis" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sides Input */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Arguments</Text>
            <Text style={styles.sectionSubtitle}>
              Enter each side's perspective
            </Text>

            {currentSides.map((side, index) => (
              <View key={side.id} style={styles.sideCard}>
                <View style={styles.sideHeader}>
                  <TextInput
                    style={styles.sideLabel}
                    value={side.label}
                    onChangeText={(text) => updateSide(side.id, { label: text })}
                    placeholder={`Side ${String.fromCharCode(65 + index)}`}
                    placeholderTextColor={colors.textTertiary}
                  />
                  {canRemoveSide && (
                    <Pressable
                      onPress={() => handleRemoveSide(side.id)}
                      hitSlop={12}
                    >
                      <Text style={styles.removeButton}>Remove</Text>
                    </Pressable>
                  )}
                </View>
                <TextInput
                  style={styles.sideInput}
                  value={side.content}
                  onChangeText={(text) => updateSide(side.id, { content: text })}
                  placeholder="Enter their argument or position..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}

            {canAddSide && (
              <PressableScale onPress={handleAddSide} style={styles.addSideButton}>
                <Text style={[styles.addSideText, { color: accentColor }]}>+ Add another side</Text>
              </PressableScale>
            )}
          </Animated.View>

          {/* Context (Optional) */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Context (Optional)</Text>
            <TextInput
              style={styles.contextInput}
              value={currentContext}
              onChangeText={setContext}
              placeholder="Any background info that might help..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Commentator Style */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Commentator Style</Text>
            <Text style={styles.sectionSubtitle}>
              {commentatorStyles.find((s) => s.id === currentCommentatorStyle)?.description}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.styleScrollContent}
            >
              {styleOptions.map((option) => (
                <PressableScale
                  key={option.id}
                  onPress={() => setCommentatorStyle(option.id as CommentatorStyle)}
                  style={[
                    styles.styleChip,
                    currentCommentatorStyle === option.id && {
                      backgroundColor: accentColor,
                      borderColor: accentColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.styleChipText,
                      currentCommentatorStyle === option.id && styles.styleChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Evidence Mode */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Evidence Mode</Text>
            <Text style={styles.sectionSubtitle}>
              {evidenceModes.find((m) => m.id === currentEvidenceMode)?.description}
            </Text>
            <AnimatedSegmentedControl
              options={evidenceOptions}
              value={currentEvidenceMode}
              onChange={setEvidenceMode}
            />
          </Animated.View>

          {/* Spacer for button */}
          <View style={styles.buttonSpacer} />
        </ScrollView>

        {/* Analyze Button */}
        <View style={styles.buttonContainer}>
          {!settings.isPro && remainingAnalyses === 0 ? (
            <PrimaryButton
              label="Upgrade to Continue"
              onPress={() => router.push('/upgrade')}
              variant="outline"
            />
          ) : (
            <PrimaryButton
              label="Analyze"
              onPress={handleAnalyze}
              disabled={!isValid}
              size="large"
            />
          )}
          {!isValid && remainingAnalyses > 0 && (
            <Text style={styles.validationHint}>
              Enter content for all sides to continue
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sideCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sideLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  removeButton: {
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  sideInput: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    minHeight: 80,
    padding: 0,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  addSideButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
  },
  addSideText: {
    fontSize: typography.sizes.base,
    // color applied inline via getAccentColor()
    fontWeight: typography.weights.medium,
  },
  contextInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  styleScrollContent: {
    gap: spacing.sm,
  },
  styleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  // styleChipActive removed - styles applied inline via getAccentColor()
  styleChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  styleChipTextActive: {
    color: colors.textPrimary,
  },
  buttonSpacer: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  validationHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
