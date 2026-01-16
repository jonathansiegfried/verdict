// Header - Shared header component for consistent navigation
// Provides: back button, title, optional right action
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../hooks';
import { colors, typography } from '../constants/theme';

interface HeaderProps {
  // Title displayed in center
  title: string;
  // Show back button (default: true)
  showBack?: boolean;
  // Custom back handler (default: router.back)
  onBack?: () => void;
  // Back button label (default: shows icon only)
  backLabel?: string;
  // Right side action
  rightAction?: {
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
    disabled?: boolean;
  };
  // Optional subtitle below title
  subtitle?: string;
  // Transparent background (for overlay headers)
  transparent?: boolean;
  // Large title style (for tab screens)
  large?: boolean;
}

export function Header({
  title,
  showBack = true,
  onBack,
  backLabel,
  rightAction,
  subtitle,
  transparent = false,
  large = false,
}: HeaderProps) {
  const router = useRouter();
  const { tokens, getAccentColor } = useTheme();
  const { trigger } = useHaptics();

  const accentColor = getAccentColor();

  const handleBack = () => {
    trigger('light');
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRightAction = () => {
    if (rightAction?.disabled) return;
    trigger('light');
    rightAction?.onPress();
  };

  // Dynamic styles based on header type
  const containerStyle = [
    styles.container,
    !transparent && styles.containerSolid,
    large && styles.containerLarge,
    { paddingHorizontal: tokens.spacing.lg },
  ];

  return (
    <View style={containerStyle}>
      {/* Left: Back button or spacer */}
      <View style={styles.leftSection}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={tokens.tabBar.iconSize + 2}
              color={accentColor}
            />
            {backLabel && (
              <Text style={[styles.backLabel, { color: accentColor, fontSize: tokens.typography.base }]}>
                {backLabel}
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      {/* Center: Title (and optional subtitle) */}
      <View style={styles.centerSection}>
        <Text
          style={[
            large ? styles.titleLarge : styles.title,
            { fontSize: large ? tokens.typography.xxl : tokens.typography.md },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { fontSize: tokens.typography.sm }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right: Action or spacer */}
      <View style={styles.rightSection}>
        {rightAction ? (
          <Pressable
            onPress={handleRightAction}
            hitSlop={12}
            style={[styles.rightButton, rightAction.disabled && styles.rightButtonDisabled]}
            accessibilityLabel={rightAction.label || 'Action'}
            accessibilityRole="button"
            disabled={rightAction.disabled}
          >
            {rightAction.icon && (
              <Ionicons
                name={rightAction.icon}
                size={tokens.tabBar.iconSize}
                color={rightAction.disabled ? colors.textTertiary : accentColor}
              />
            )}
            {rightAction.label && (
              <Text
                style={[
                  styles.rightLabel,
                  {
                    color: rightAction.disabled ? colors.textTertiary : accentColor,
                    fontSize: tokens.typography.base,
                  },
                ]}
              >
                {rightAction.label}
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 56,
  },
  containerSolid: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  containerLarge: {
    paddingVertical: 16,
    minHeight: 64,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backLabel: {
    fontWeight: typography.weights.medium,
  },
  title: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleLarge: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightButtonDisabled: {
    opacity: 0.5,
  },
  rightLabel: {
    fontWeight: typography.weights.medium,
  },
  spacer: {
    width: 60,
  },
});
