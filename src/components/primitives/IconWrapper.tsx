// IconWrapper - Consistent container for icons
// Provides themed background, size, and spacing

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../constants/theme';
import type { SizeToken } from '../../types/design-tokens';

interface IconWrapperProps {
  // The icon (can be emoji, Ionicons, or custom component)
  children: React.ReactNode;
  // Size variant
  size?: SizeToken;
  // Background variant
  variant?: 'default' | 'accent' | 'muted' | 'transparent';
  // Custom background color
  backgroundColor?: string;
  // Shape
  shape?: 'circle' | 'rounded' | 'square';
  // Border (for outline style)
  bordered?: boolean;
}

// Size configurations
const SIZES = {
  sm: { container: 32, icon: 16, radius: 8 },
  md: { container: 40, icon: 20, radius: 10 },
  lg: { container: 48, icon: 24, radius: 12 },
} as const;

export function IconWrapper({
  children,
  size = 'md',
  variant = 'default',
  backgroundColor,
  shape = 'rounded',
  bordered = false,
}: IconWrapperProps) {
  const { tokens } = useTheme();

  const sizeConfig = SIZES[size];

  // Determine background color
  const getBgColor = () => {
    if (backgroundColor) return backgroundColor;

    switch (variant) {
      case 'accent':
        return tokens.palette.accentMuted;
      case 'muted':
        return colors.backgroundTertiary;
      case 'transparent':
        return 'transparent';
      default:
        return colors.surface;
    }
  };

  // Determine border radius based on shape
  const getBorderRadius = () => {
    switch (shape) {
      case 'circle':
        return sizeConfig.container / 2;
      case 'square':
        return tokens.radius.xs;
      default:
        return tokens.radius.md;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          backgroundColor: getBgColor(),
          borderRadius: getBorderRadius(),
          borderWidth: bordered ? 1 : 0,
          borderColor: colors.surfaceBorder,
        },
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={{ fontSize: sizeConfig.icon }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
