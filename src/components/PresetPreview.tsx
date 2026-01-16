// PresetPreview - Visual preview component for design presets
// Shows how each preset looks with mini UI elements
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, PRESET_LIST, type DesignPreset, type DesignTokens } from '../context/ThemeContext';
import { colors, typography } from '../constants/theme';
import { PressableScale } from './PressableScale';

interface PresetPreviewProps {
  presetId: DesignPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function PresetPreview({
  presetId,
  isSelected,
  onSelect,
}: PresetPreviewProps) {
  const { tokens: currentTokens, reduceMotion } = useTheme();

  // Get tokens for the preset we're previewing (not current preset)
  const previewTokens = PRESET_LIST.find(p => p.id === presetId)!;
  const { palette, radius, card, button, typography: typog } = previewTokens;

  // Dynamic preview styles based on the preset being previewed
  const previewStyles = useMemo(() => ({
    container: {
      borderRadius: currentTokens.radius.lg,
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? palette.accent : colors.surfaceBorder,
      backgroundColor: isSelected ? colors.surfaceElevated : colors.surface,
      padding: currentTokens.spacing.md,
    },
    // Mini phone frame showing the preset's style
    phoneFrame: {
      backgroundColor: colors.background,
      borderRadius: radius.md,
      padding: 8,
      marginBottom: currentTokens.spacing.sm,
      borderWidth: card.borderWidth,
      borderColor: `${colors.surfaceBorder}80`,
    },
    // Mini card within the preview
    miniCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      padding: 6,
      marginBottom: 6,
      borderWidth: card.borderWidth,
      borderColor: colors.surfaceBorder,
      // Apply shadow if preset has shadows
      ...(card.shadowOpacity > 0 ? {
        shadowColor: '#000',
        shadowOpacity: card.shadowOpacity * 0.5,
        shadowRadius: card.shadowRadius * 0.3,
        shadowOffset: { width: 0, height: card.shadowOffsetY * 0.3 },
      } : {}),
    },
    // Mini button within the preview
    miniButton: {
      backgroundColor: palette.accent,
      borderRadius: radius.xs,
      height: 14,
      borderWidth: button.borderWidth * 0.5,
      borderColor: palette.accent,
      marginTop: 4,
    },
    // Color accent bar
    accentBar: {
      height: 4,
      backgroundColor: palette.accent,
      borderRadius: radius.xs,
      marginBottom: 4,
    },
    // Text placeholder lines
    textLine: {
      height: 3,
      backgroundColor: colors.textTertiary,
      borderRadius: 1,
      marginBottom: 2,
    },
    // Selected indicator
    selectedBadge: {
      position: 'absolute' as const,
      top: -4,
      right: -4,
      backgroundColor: palette.accent,
      borderRadius: radius.full,
      padding: 2,
    },
    // Label styles
    nameText: {
      fontSize: currentTokens.typography.sm,
      fontWeight: typography.weights.semibold,
      color: isSelected ? colors.textPrimary : colors.textSecondary,
      marginBottom: 2,
    },
    descText: {
      fontSize: currentTokens.typography.xs,
      color: colors.textTertiary,
    },
  }), [currentTokens, previewTokens, isSelected, palette, radius, card, button]);

  return (
    <PressableScale
      onPress={onSelect}
      scaleValue={0.97}
      style={[styles.touchable]}
      accessibilityLabel={`${previewTokens.name} preset. ${previewTokens.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
      accessibilityHint="Double tap to select this design preset"
    >
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(200)}
        style={previewStyles.container}
      >
        {/* Mini preview "screen" */}
        <View style={previewStyles.phoneFrame}>
          {/* Accent color bar at top */}
          <View style={previewStyles.accentBar} />

          {/* Mini card */}
          <View style={previewStyles.miniCard}>
            <View style={[previewStyles.textLine, { width: '70%' }]} />
            <View style={[previewStyles.textLine, { width: '50%' }]} />
          </View>

          {/* Mini button */}
          <View style={previewStyles.miniButton} />
        </View>

        {/* Selected checkmark */}
        {isSelected && (
          <View style={previewStyles.selectedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.textPrimary} />
          </View>
        )}

        {/* Preset name and description */}
        <Text style={previewStyles.nameText}>
          {previewTokens.name}
        </Text>
        <Text style={previewStyles.descText}>
          {previewTokens.description}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

// Grid layout component for displaying all presets
interface PresetGridProps {
  selectedPreset: DesignPreset;
  onSelectPreset: (preset: DesignPreset) => void;
}

export function PresetGrid({ selectedPreset, onSelectPreset }: PresetGridProps) {
  return (
    <View style={styles.grid}>
      {PRESET_LIST.map((preset) => (
        <View key={preset.id} style={styles.gridItem}>
          <PresetPreview
            presetId={preset.id}
            isSelected={selectedPreset === preset.id}
            onSelect={() => onSelectPreset(preset.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
});
