// ThemeContext - Design system with switchable presets
// Provides design tokens that drive the entire UI
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useHaptics } from '../hooks';
import { colors } from '../constants/theme';

// Design preset IDs
export type DesignPreset = 'soft-premium' | 'sharp-minimal' | 'neo-glass' | 'playful-bold';

// Design tokens that vary by preset
export interface DesignTokens {
  // Border radius scale
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  // Spacing scale
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  // Typography scale
  typography: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  // Card style
  card: {
    borderWidth: number;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffsetY: number;
    elevation: number;
    backdropBlur?: number; // For neo-glass
  };
  // Button style
  button: {
    height: number;
    paddingHorizontal: number;
    fontWeight: '500' | '600' | '700';
  };
  // Tab bar
  tabBar: {
    height: number;
    iconSize: number;
  };
}

// Preset configurations
export const DESIGN_PRESETS: Record<DesignPreset, {
  id: DesignPreset;
  name: string;
  description: string;
  tokens: DesignTokens;
}> = {
  'soft-premium': {
    id: 'soft-premium',
    name: 'Soft Premium',
    description: 'Rounded, airy, soft shadows',
    tokens: {
      radius: { sm: 12, md: 16, lg: 20, xl: 24, full: 9999 },
      spacing: { xs: 4, sm: 8, md: 14, lg: 18, xl: 24, xxl: 28, xxxl: 36 },
      typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 28, xxxl: 34 },
      card: { borderWidth: 0, shadowOpacity: 0.15, shadowRadius: 16, shadowOffsetY: 6, elevation: 4 },
      button: { height: 52, paddingHorizontal: 24, fontWeight: '600' },
      tabBar: { height: 88, iconSize: 24 },
    },
  },
  'sharp-minimal': {
    id: 'sharp-minimal',
    name: 'Sharp Minimal',
    description: 'Low radius, flat, editorial',
    tokens: {
      radius: { sm: 4, md: 6, lg: 8, xl: 10, full: 9999 },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
      typography: { xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 22, xxl: 26, xxxl: 32 },
      card: { borderWidth: 1, shadowOpacity: 0, shadowRadius: 0, shadowOffsetY: 0, elevation: 0 },
      button: { height: 44, paddingHorizontal: 20, fontWeight: '500' },
      tabBar: { height: 80, iconSize: 22 },
    },
  },
  'neo-glass': {
    id: 'neo-glass',
    name: 'Neo Glass',
    description: 'Translucent cards, subtle depth',
    tokens: {
      radius: { sm: 10, md: 14, lg: 18, xl: 22, full: 9999 },
      spacing: { xs: 4, sm: 10, md: 14, lg: 18, xl: 22, xxl: 26, xxxl: 34 },
      typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 28, xxxl: 34 },
      card: { borderWidth: 1, shadowOpacity: 0.1, shadowRadius: 20, shadowOffsetY: 4, elevation: 2, backdropBlur: 10 },
      button: { height: 50, paddingHorizontal: 22, fontWeight: '600' },
      tabBar: { height: 86, iconSize: 24 },
    },
  },
  'playful-bold': {
    id: 'playful-bold',
    name: 'Playful Bold',
    description: 'Bigger text, bolder spacing',
    tokens: {
      radius: { sm: 14, md: 18, lg: 22, xl: 28, full: 9999 },
      spacing: { xs: 6, sm: 10, md: 16, lg: 22, xl: 28, xxl: 34, xxxl: 42 },
      typography: { xs: 12, sm: 14, base: 16, md: 18, lg: 22, xl: 28, xxl: 34, xxxl: 40 },
      card: { borderWidth: 2, shadowOpacity: 0.2, shadowRadius: 12, shadowOffsetY: 4, elevation: 6 },
      button: { height: 56, paddingHorizontal: 28, fontWeight: '700' },
      tabBar: { height: 92, iconSize: 26 },
    },
  },
};

// Context value interface
interface ThemeContextValue {
  // Current preset
  preset: DesignPreset;
  presetConfig: typeof DESIGN_PRESETS[DesignPreset];
  tokens: DesignTokens;

  // Actions
  setPreset: (preset: DesignPreset) => void;

  // Preferences (from app settings)
  hapticsEnabled: boolean;
  reduceMotion: boolean;

  // Computed styles helpers
  getCardStyle: (variant?: 'default' | 'elevated' | 'glass') => object;
  getButtonStyle: () => object;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { trigger } = useHaptics();

  const preset = (settings.designPreset || 'soft-premium') as DesignPreset;
  const presetConfig = DESIGN_PRESETS[preset];
  const tokens = presetConfig.tokens;

  const setPreset = useCallback((newPreset: DesignPreset) => {
    trigger('medium');
    updateSettings({ designPreset: newPreset });
  }, [updateSettings, trigger]);

  const getCardStyle = useCallback((variant: 'default' | 'elevated' | 'glass' = 'default') => {
    const baseStyle = {
      backgroundColor: variant === 'glass' ? 'rgba(22, 22, 31, 0.7)' : colors.surface,
      borderRadius: tokens.radius.lg,
      borderWidth: tokens.card.borderWidth,
      borderColor: colors.surfaceBorder,
    };

    if (variant === 'elevated' || variant === 'glass') {
      return {
        ...baseStyle,
        backgroundColor: variant === 'glass' ? 'rgba(30, 30, 42, 0.6)' : colors.surfaceElevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: tokens.card.shadowOffsetY },
        shadowOpacity: tokens.card.shadowOpacity,
        shadowRadius: tokens.card.shadowRadius,
        elevation: tokens.card.elevation,
      };
    }

    return baseStyle;
  }, [tokens]);

  const getButtonStyle = useCallback(() => ({
    height: tokens.button.height,
    paddingHorizontal: tokens.button.paddingHorizontal,
    borderRadius: tokens.radius.md,
  }), [tokens]);

  const value = useMemo<ThemeContextValue>(() => ({
    preset,
    presetConfig,
    tokens,
    setPreset,
    hapticsEnabled: settings.hapticsEnabled,
    reduceMotion: settings.reduceMotion,
    getCardStyle,
    getButtonStyle,
  }), [preset, presetConfig, tokens, setPreset, settings.hapticsEnabled, settings.reduceMotion, getCardStyle, getButtonStyle]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to access theme
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Export preset list for UI
export const PRESET_LIST = Object.values(DESIGN_PRESETS);
