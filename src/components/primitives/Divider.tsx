// Divider - Themed separator component
// Use for visual separation between sections

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../constants/theme';
import type { SpacingKey } from '../../types/design-tokens';

interface DividerProps {
  // Vertical margin around divider
  spacing?: SpacingKey | number;
  // Horizontal inset from edges
  inset?: SpacingKey | number;
  // Inset from start only (left in LTR)
  insetStart?: SpacingKey | number;
  // Inset from end only (right in LTR)
  insetEnd?: SpacingKey | number;
  // Color override (default: surfaceBorder)
  color?: string;
  // Thickness (default: 1)
  thickness?: number;
  // Vertical divider (default: horizontal)
  vertical?: boolean;
}

export function Divider({
  spacing = 'none',
  inset,
  insetStart,
  insetEnd,
  color,
  thickness = 1,
  vertical = false,
}: DividerProps) {
  const { tokens } = useTheme();

  // Resolve spacing values
  const resolveSpacing = (value: SpacingKey | number | undefined): number => {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    return tokens.spacing[value] ?? 0;
  };

  const marginValue = resolveSpacing(spacing);
  const insetValue = resolveSpacing(inset);
  const startInset = insetStart !== undefined ? resolveSpacing(insetStart) : insetValue;
  const endInset = insetEnd !== undefined ? resolveSpacing(insetEnd) : insetValue;

  const dividerColor = color ?? colors.surfaceBorder;

  if (vertical) {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: dividerColor,
            marginHorizontal: marginValue,
            marginTop: startInset,
            marginBottom: endInset,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: dividerColor,
          marginVertical: marginValue,
          marginLeft: startInset,
          marginRight: endInset,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    alignSelf: 'stretch',
  },
  vertical: {
    alignSelf: 'stretch',
  },
});
