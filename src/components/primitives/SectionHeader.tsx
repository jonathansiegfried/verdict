// SectionHeader - Reusable section title with optional action
// Provides consistent header styling across screens

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, typography } from '../../constants/theme';

interface SectionHeaderProps {
  // Title text
  title: string;
  // Optional subtitle/description
  subtitle?: string;
  // Right-side action link
  action?: {
    label: string;
    onPress: () => void;
  };
  // Size variant
  size?: 'sm' | 'md' | 'lg';
  // Bottom margin
  marginBottom?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  size = 'md',
  marginBottom = true,
}: SectionHeaderProps) {
  const { tokens } = useTheme();

  // Font sizes based on size prop
  const titleSize = {
    sm: tokens.typography.base,
    md: tokens.typography.lg,
    lg: tokens.typography.xl,
  }[size];

  const subtitleSize = {
    sm: tokens.typography.xs,
    md: tokens.typography.sm,
    lg: tokens.typography.base,
  }[size];

  const actionSize = {
    sm: tokens.typography.xs,
    md: tokens.typography.sm,
    lg: tokens.typography.base,
  }[size];

  return (
    <View style={[
      styles.container,
      marginBottom && { marginBottom: tokens.spacing.md },
    ]}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { fontSize: titleSize },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { fontSize: subtitleSize, marginTop: tokens.spacing.xs },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <Pressable
          onPress={action.onPress}
          hitSlop={12}
          style={styles.actionTouchable}
        >
          <Text style={[styles.actionText, { fontSize: actionSize }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  actionTouchable: {
    paddingVertical: 2,
  },
  actionText: {
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
});
