// DEV ONLY - Component Playground
// Showcases all components with live preset switching
// Access via: router.push('/playground')

import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  PressableScale,
  PrimaryButton,
  AnimatedSegmentedControl,
  Card,
  EmptyState,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Header,
  Spacer,
  Divider,
  SectionHeader,
} from '../src/components';
import { useTheme, PRESET_LIST } from '../src/context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../src/constants/theme';

export default function PlaygroundScreen() {
  const router = useRouter();
  const { tokens, preset, setPreset, reduceMotion, getAccentColor } = useTheme();
  const accentColor = getAccentColor();

  const [segmentValue, setSegmentValue] = useState<'option1' | 'option2' | 'option3'>('option1');

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={[styles.backLink, { color: accentColor }]}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Playground</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Preset Switcher */}
      <View style={styles.presetBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScroll}
        >
          {PRESET_LIST.map((p) => (
            <PressableScale
              key={p.id}
              onPress={() => setPreset(p.id)}
              style={[
                styles.presetChip,
                preset === p.id && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text style={[
                styles.presetChipText,
                preset === p.id && styles.presetChipTextActive,
              ]}>
                {p.name}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Preset Info */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(200)}
          style={styles.section}
        >
          <SectionHeader title="Current Preset" />
          <Card padding="lg">
            <Text style={styles.presetInfoName}>{preset}</Text>
            <Text style={styles.presetInfoDetail}>
              Accent: <Text style={[styles.colorSwatch, { color: accentColor }]}>{accentColor}</Text>
            </Text>
            <Text style={styles.presetInfoDetail}>
              Radius LG: {tokens.radius.lg}px
            </Text>
            <Text style={styles.presetInfoDetail}>
              Spacing LG: {tokens.spacing.lg}px
            </Text>
          </Card>
        </Animated.View>

        <Spacer size="xl" />

        {/* Buttons */}
        <View style={styles.section}>
          <SectionHeader title="Buttons" />

          <View style={styles.componentRow}>
            <PrimaryButton label="Primary Active" onPress={() => {}} />
          </View>

          <Spacer size="md" />

          <View style={styles.componentRow}>
            <PrimaryButton label="Disabled" onPress={() => {}} disabled />
          </View>

          <Spacer size="md" />

          <View style={styles.componentRow}>
            <PrimaryButton label="Loading" onPress={() => {}} loading />
          </View>

          <Spacer size="md" />

          <View style={styles.buttonRow}>
            <PressableScale
              style={[styles.secondaryButton, { borderColor: accentColor }]}
              onPress={() => {}}
            >
              <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Secondary</Text>
            </PressableScale>
            <PressableScale
              style={[styles.ghostButton]}
              onPress={() => {}}
            >
              <Text style={styles.ghostButtonText}>Ghost</Text>
            </PressableScale>
          </View>
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Segmented Control */}
        <View style={styles.section}>
          <SectionHeader title="Segmented Control" />

          <AnimatedSegmentedControl
            options={[
              { id: 'option1', label: 'Option 1' },
              { id: 'option2', label: 'Option 2' },
              { id: 'option3', label: 'Option 3' },
            ]}
            value={segmentValue}
            onChange={setSegmentValue}
          />

          <Spacer size="md" />

          <Text style={styles.selectedValue}>Selected: {segmentValue}</Text>
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Cards */}
        <View style={styles.section}>
          <SectionHeader title="Cards" />

          <Card padding="lg">
            <Text style={styles.cardTitle}>Default Card</Text>
            <Text style={styles.cardBody}>
              This is the default card style with standard padding.
            </Text>
          </Card>

          <Spacer size="md" />

          <Card padding="lg" variant="elevated">
            <Text style={styles.cardTitle}>Elevated Card</Text>
            <Text style={styles.cardBody}>
              This card has elevation/shadow for depth.
            </Text>
          </Card>

          <Spacer size="md" />

          <Card padding="sm">
            <Text style={styles.cardTitle}>Compact Card</Text>
            <Text style={styles.cardBody}>Small padding variant.</Text>
          </Card>
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Skeletons */}
        <View style={styles.section}>
          <SectionHeader title="Skeleton Loaders" />

          <Card padding="lg">
            <Text style={styles.cardTitle}>Base Skeleton</Text>
            <Spacer size="sm" />
            <Skeleton width="80%" height={16} />
            <Spacer size="sm" />
            <Skeleton width="60%" height={12} />
            <Spacer size="sm" />
            <Skeleton width="40%" height={12} />
          </Card>

          <Spacer size="md" />

          <Text style={styles.subheader}>Skeleton Card</Text>
          <SkeletonCard />

          <Spacer size="md" />

          <Text style={styles.subheader}>Skeleton Text (3 lines)</Text>
          <SkeletonText lines={3} />
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Empty State */}
        <View style={styles.section}>
          <SectionHeader title="Empty State" />

          <EmptyState
            icon="📭"
            title="Nothing here yet"
            subtitle="This is what users see when there's no content"
            actionLabel="Take Action"
            onAction={() => {}}
          />
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Typography */}
        <View style={styles.section}>
          <SectionHeader title="Typography Scale" />

          <Card padding="lg">
            <Text style={[styles.typoSample, { fontSize: tokens.typography.xxxl }]}>
              XXXL ({tokens.typography.xxxl}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.xxl }]}>
              XXL ({tokens.typography.xxl}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.xl }]}>
              XL ({tokens.typography.xl}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.lg }]}>
              LG ({tokens.typography.lg}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.base }]}>
              Base ({tokens.typography.base}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.sm }]}>
              SM ({tokens.typography.sm}px)
            </Text>
            <Text style={[styles.typoSample, { fontSize: tokens.typography.xs }]}>
              XS ({tokens.typography.xs}px)
            </Text>
          </Card>
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Spacing Scale */}
        <View style={styles.section}>
          <SectionHeader title="Spacing Scale" />

          <Card padding="lg">
            {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const).map((size) => (
              <View key={size} style={styles.spacingRow}>
                <Text style={styles.spacingLabel}>{size}</Text>
                <View
                  style={[
                    styles.spacingBar,
                    { width: tokens.spacing[size], backgroundColor: accentColor },
                  ]}
                />
                <Text style={styles.spacingValue}>{tokens.spacing[size]}px</Text>
              </View>
            ))}
          </Card>
        </View>

        <Spacer size="xl" />
        <Divider />
        <Spacer size="xl" />

        {/* Color Palette */}
        <View style={styles.section}>
          <SectionHeader title="Color Palette" />

          <Card padding="lg">
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Accent</Text>
              <View style={[styles.colorBlock, { backgroundColor: accentColor }]} />
            </View>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Background</Text>
              <View style={[styles.colorBlock, { backgroundColor: colors.background }]} />
            </View>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Surface</Text>
              <View style={[styles.colorBlock, { backgroundColor: colors.surface }]} />
            </View>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Success</Text>
              <View style={[styles.colorBlock, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Warning</Text>
              <View style={[styles.colorBlock, { backgroundColor: colors.warning }]} />
            </View>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Error</Text>
              <View style={[styles.colorBlock, { backgroundColor: colors.error }]} />
            </View>
          </Card>
        </View>

        <Spacer size="xxxl" />
        <Spacer size="xxxl" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  presetBar: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  presetScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  presetChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  presetChipTextActive: {
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {},
  componentRow: {
    alignItems: 'stretch',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  ghostButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  selectedValue: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  subheader: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  presetInfoName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: 'monospace',
  },
  presetInfoDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  colorSwatch: {
    fontWeight: typography.weights.bold,
  },
  typoSample: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spacingLabel: {
    width: 50,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  spacingBar: {
    height: 12,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  spacingValue: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  colorLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  colorBlock: {
    width: 40,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
});
