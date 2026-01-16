// Spacer - Consistent spacing component
// Use instead of margin/padding for layout gaps

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { SpacingKey } from '../../types/design-tokens';

interface SpacerProps {
  // Size using theme spacing tokens
  size?: SpacingKey | number;
  // Direction (default: vertical)
  horizontal?: boolean;
  // Flex grow to fill space
  flex?: boolean;
}

export function Spacer({
  size = 'md',
  horizontal = false,
  flex = false,
}: SpacerProps) {
  const { tokens } = useTheme();

  // Resolve size from token or use raw number
  const resolvedSize = typeof size === 'number'
    ? size
    : tokens.spacing[size] ?? tokens.spacing.md;

  if (flex) {
    return <View style={styles.flex} />;
  }

  const style = horizontal
    ? { width: resolvedSize }
    : { height: resolvedSize };

  return <View style={style} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
