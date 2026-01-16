// Card - Reusable card component with optional press feedback
// Now uses theme tokens for dynamic styling based on design preset
import React, { useMemo } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { PressableScale } from '../PressableScale';
import { colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  onPress,
  onLongPress,
  style,
  variant = 'default',
  padding = 'md',
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { tokens, getCardStyle } = useTheme();

  const cardStyle = useMemo(() => {
    // Get base card style from theme
    const baseCardStyle = variant === 'outline'
      ? {
          backgroundColor: 'transparent',
          borderRadius: tokens.radius.lg,
          borderWidth: tokens.card.borderWidth || 1.5,
          borderColor: colors.surfaceBorder,
        }
      : getCardStyle(variant === 'glass' ? 'glass' : variant === 'elevated' ? 'elevated' : 'default');

    // Add padding based on tokens
    const paddingValue =
      padding === 'none' ? 0 :
      padding === 'sm' ? tokens.spacing.sm :
      padding === 'lg' ? tokens.spacing.lg :
      tokens.spacing.md;

    return [
      baseCardStyle,
      { padding: paddingValue },
      style,
    ];
  }, [tokens, variant, padding, style, getCardStyle]);

  if (onPress || onLongPress) {
    return (
      <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
        scaleValue={0.98}
        style={cardStyle}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
