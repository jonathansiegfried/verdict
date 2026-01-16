// ThemeContext - Design system with switchable presets
// Provides design tokens that drive the entire UI
//
// ARCHITECTURE:
// - Each preset has DRAMATICALLY different visual characteristics
// - Presets include their own color palette (not just shape/spacing)
// - Tokens are consumed throughout the app for consistent theming

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useHaptics } from '../hooks';
import { colors, palettes, borderRadius, spacing, typography } from '../constants/theme';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Design preset IDs
export type DesignPreset = 'soft-premium' | 'sharp-minimal' | 'neo-glass' | 'playful-bold';

// Color palette for a preset
export interface PresetPalette {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentMuted: string;
  gradient: readonly [string, string];
  glow: string;
}

// Design tokens that vary by preset
export interface DesignTokens {
  // Preset identity
  id: DesignPreset;
  name: string;
  description: string;

  // Color palette for this preset
  palette: PresetPalette;

  // Border radius scale
  radius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    full: number;
  };

  // Spacing scale
  spacing: {
    none: number;
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
    display: number;
  };

  // Card styling
  card: {
    borderWidth: number;
    borderStyle: 'solid' | 'none';
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffsetY: number;
    elevation: number;
    backdropBlur?: number;
    backgroundOpacity: number;
  };

  // Button styling
  button: {
    height: {
      sm: number;
      md: number;
      lg: number;
    };
    paddingHorizontal: number;
    fontWeight: '500' | '600' | '700' | '800';
    borderWidth: number;
    uppercase: boolean;
  };

  // Input styling
  input: {
    height: number;
    borderWidth: number;
    focusBorderWidth: number;
  };

  // Tab bar styling
  tabBar: {
    height: number;
    iconSize: number;
    labelSize: number;
    showLabel: boolean;
  };

  // Animation preferences
  motion: {
    staggerDelay: number;
    springDamping: number;
    springStiffness: number;
  };
}

// =============================================================================
// PRESET CONFIGURATIONS - EXTREME DIFFERENTIATION
// =============================================================================

export const DESIGN_PRESETS: Record<DesignPreset, DesignTokens> = {
  // ---------------------------------------------------------------------------
  // SOFT PREMIUM: Elegant, rounded, gentle shadows, indigo palette
  // Think: Headspace, Calm - luxurious and calming
  // ---------------------------------------------------------------------------
  'soft-premium': {
    id: 'soft-premium',
    name: 'Soft Premium',
    description: 'Elegant & calming',
    palette: {
      accent: palettes.indigo.accent,
      accentLight: palettes.indigo.accentLight,
      accentDark: palettes.indigo.accentDark,
      accentMuted: 'rgba(99, 102, 241, 0.15)',
      gradient: palettes.indigo.gradient,
      glow: 'rgba(99, 102, 241, 0.4)',
    },
    radius: {
      none: 0,
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      '2xl': 28,
      full: 9999,
    },
    spacing: {
      none: 0,
      xs: 4,
      sm: 8,
      md: 14,
      lg: 18,
      xl: 24,
      xxl: 30,
      xxxl: 40,
    },
    typography: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 17,
      lg: 20,
      xl: 24,
      xxl: 28,
      xxxl: 34,
      display: 42,
    },
    card: {
      borderWidth: 0,
      borderStyle: 'none',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffsetY: 8,
      elevation: 6,
      backgroundOpacity: 1,
    },
    button: {
      height: { sm: 40, md: 50, lg: 56 },
      paddingHorizontal: 24,
      fontWeight: '600',
      borderWidth: 0,
      uppercase: false,
    },
    input: {
      height: 52,
      borderWidth: 0,
      focusBorderWidth: 2,
    },
    tabBar: {
      height: 88,
      iconSize: 24,
      labelSize: 10,
      showLabel: true,
    },
    motion: {
      staggerDelay: 50,
      springDamping: 15,
      springStiffness: 150,
    },
  },

  // ---------------------------------------------------------------------------
  // SHARP MINIMAL: Editorial, stark, no shadows, cyan palette
  // Think: Bloomberg, The Information - crisp and professional
  // ---------------------------------------------------------------------------
  'sharp-minimal': {
    id: 'sharp-minimal',
    name: 'Sharp Minimal',
    description: 'Crisp & editorial',
    palette: {
      accent: palettes.cyan.accent,
      accentLight: palettes.cyan.accentLight,
      accentDark: palettes.cyan.accentDark,
      accentMuted: 'rgba(6, 182, 212, 0.12)',
      gradient: palettes.cyan.gradient,
      glow: 'rgba(6, 182, 212, 0.3)',
    },
    radius: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
      '2xl': 12,
      full: 9999,
    },
    spacing: {
      none: 0,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    typography: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 26,
      xxxl: 32,
      display: 40,
    },
    card: {
      borderWidth: 1,
      borderStyle: 'solid',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetY: 0,
      elevation: 0,
      backgroundOpacity: 1,
    },
    button: {
      height: { sm: 36, md: 44, lg: 50 },
      paddingHorizontal: 20,
      fontWeight: '500',
      borderWidth: 1,
      uppercase: true,
    },
    input: {
      height: 44,
      borderWidth: 1,
      focusBorderWidth: 2,
    },
    tabBar: {
      height: 76,
      iconSize: 22,
      labelSize: 9,
      showLabel: false,
    },
    motion: {
      staggerDelay: 30,
      springDamping: 20,
      springStiffness: 300,
    },
  },

  // ---------------------------------------------------------------------------
  // NEO GLASS: Translucent, frosted, emerald palette
  // Think: iOS Control Center, macOS - modern depth
  // ---------------------------------------------------------------------------
  'neo-glass': {
    id: 'neo-glass',
    name: 'Neo Glass',
    description: 'Frosted & layered',
    palette: {
      accent: palettes.emerald.accent,
      accentLight: palettes.emerald.accentLight,
      accentDark: palettes.emerald.accentDark,
      accentMuted: 'rgba(16, 185, 129, 0.12)',
      gradient: palettes.emerald.gradient,
      glow: 'rgba(16, 185, 129, 0.35)',
    },
    radius: {
      none: 0,
      xs: 6,
      sm: 10,
      md: 14,
      lg: 18,
      xl: 22,
      '2xl': 26,
      full: 9999,
    },
    spacing: {
      none: 0,
      xs: 4,
      sm: 10,
      md: 14,
      lg: 18,
      xl: 22,
      xxl: 28,
      xxxl: 36,
    },
    typography: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 17,
      lg: 20,
      xl: 24,
      xxl: 28,
      xxxl: 34,
      display: 42,
    },
    card: {
      borderWidth: 1,
      borderStyle: 'solid',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffsetY: 4,
      elevation: 3,
      backdropBlur: 12,
      backgroundOpacity: 0.7,
    },
    button: {
      height: { sm: 38, md: 48, lg: 54 },
      paddingHorizontal: 22,
      fontWeight: '600',
      borderWidth: 1,
      uppercase: false,
    },
    input: {
      height: 48,
      borderWidth: 1,
      focusBorderWidth: 2,
    },
    tabBar: {
      height: 84,
      iconSize: 24,
      labelSize: 10,
      showLabel: true,
    },
    motion: {
      staggerDelay: 40,
      springDamping: 18,
      springStiffness: 180,
    },
  },

  // ---------------------------------------------------------------------------
  // PLAYFUL BOLD: Chunky, fun, rose palette
  // Think: Duolingo, Notion - energetic and approachable
  // ---------------------------------------------------------------------------
  'playful-bold': {
    id: 'playful-bold',
    name: 'Playful Bold',
    description: 'Fun & energetic',
    palette: {
      accent: palettes.rose.accent,
      accentLight: palettes.rose.accentLight,
      accentDark: palettes.rose.accentDark,
      accentMuted: 'rgba(244, 63, 94, 0.15)',
      gradient: palettes.rose.gradient,
      glow: 'rgba(244, 63, 94, 0.4)',
    },
    radius: {
      none: 0,
      xs: 10,
      sm: 14,
      md: 18,
      lg: 24,
      xl: 30,
      '2xl': 36,
      full: 9999,
    },
    spacing: {
      none: 0,
      xs: 6,
      sm: 12,
      md: 16,
      lg: 22,
      xl: 28,
      xxl: 36,
      xxxl: 48,
    },
    typography: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 19,
      lg: 24,
      xl: 30,
      xxl: 36,
      xxxl: 44,
      display: 54,
    },
    card: {
      borderWidth: 3,
      borderStyle: 'solid',
      shadowOpacity: 0.25,
      shadowRadius: 0,
      shadowOffsetY: 6,
      elevation: 8,
      backgroundOpacity: 1,
    },
    button: {
      height: { sm: 44, md: 54, lg: 62 },
      paddingHorizontal: 28,
      fontWeight: '700',
      borderWidth: 3,
      uppercase: false,
    },
    input: {
      height: 56,
      borderWidth: 3,
      focusBorderWidth: 3,
    },
    tabBar: {
      height: 94,
      iconSize: 28,
      labelSize: 11,
      showLabel: true,
    },
    motion: {
      staggerDelay: 60,
      springDamping: 12,
      springStiffness: 200,
    },
  },
};

// =============================================================================
// CONTEXT
// =============================================================================

interface ThemeContextValue {
  // Current preset and tokens
  preset: DesignPreset;
  tokens: DesignTokens;

  // Actions
  setPreset: (preset: DesignPreset) => void;

  // Preferences (from app settings)
  hapticsEnabled: boolean;
  reduceMotion: boolean;

  // Style generators (use these instead of building styles manually)
  getCardStyle: (variant?: 'default' | 'elevated' | 'glass') => object;
  getButtonStyle: (size?: 'sm' | 'md' | 'lg') => object;
  getInputStyle: () => object;

  // Color accessors (use preset palette or fall back to base)
  getAccentColor: () => string;
  getGradient: () => readonly [string, string];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { trigger } = useHaptics();

  const preset = (settings.designPreset || 'soft-premium') as DesignPreset;
  const tokens = DESIGN_PRESETS[preset];

  const setPreset = useCallback((newPreset: DesignPreset) => {
    if (newPreset !== preset) {
      trigger('medium');
      updateSettings({ designPreset: newPreset });
    }
  }, [preset, updateSettings, trigger]);

  // Generate card style based on current preset
  const getCardStyle = useCallback((variant: 'default' | 'elevated' | 'glass' = 'default') => {
    const { card, radius, palette } = tokens;

    // Base card style
    const baseStyle: Record<string, unknown> = {
      backgroundColor: variant === 'glass'
        ? `rgba(22, 22, 31, ${card.backgroundOpacity * 0.8})`
        : colors.surface,
      borderRadius: radius.lg,
      borderWidth: card.borderWidth,
      borderColor: variant === 'glass'
        ? `rgba(255, 255, 255, 0.08)`
        : colors.surfaceBorder,
    };

    // Add shadow/elevation for elevated and glass variants
    if ((variant === 'elevated' || variant === 'glass') && card.shadowOpacity > 0) {
      Object.assign(baseStyle, {
        backgroundColor: variant === 'glass'
          ? `rgba(30, 30, 42, ${card.backgroundOpacity * 0.7})`
          : colors.surfaceElevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: card.shadowOffsetY },
        shadowOpacity: card.shadowOpacity,
        shadowRadius: card.shadowRadius,
        elevation: card.elevation,
      });
    }

    return baseStyle;
  }, [tokens]);

  // Generate button style based on current preset
  const getButtonStyle = useCallback((size: 'sm' | 'md' | 'lg' = 'md') => {
    const { button, radius, palette } = tokens;

    return {
      height: button.height[size],
      paddingHorizontal: button.paddingHorizontal,
      borderRadius: radius.md,
      borderWidth: button.borderWidth,
      borderColor: palette.accent,
    };
  }, [tokens]);

  // Generate input style based on current preset
  const getInputStyle = useCallback(() => {
    const { input, radius } = tokens;

    return {
      height: input.height,
      borderRadius: radius.md,
      borderWidth: input.borderWidth,
      borderColor: colors.surfaceBorder,
      backgroundColor: colors.surface,
    };
  }, [tokens]);

  // Color accessors
  const getAccentColor = useCallback(() => tokens.palette.accent, [tokens]);
  const getGradient = useCallback(() => tokens.palette.gradient, [tokens]);

  const value = useMemo<ThemeContextValue>(() => ({
    preset,
    tokens,
    setPreset,
    hapticsEnabled: settings.hapticsEnabled,
    reduceMotion: settings.reduceMotion,
    getCardStyle,
    getButtonStyle,
    getInputStyle,
    getAccentColor,
    getGradient,
  }), [
    preset,
    tokens,
    setPreset,
    settings.hapticsEnabled,
    settings.reduceMotion,
    getCardStyle,
    getButtonStyle,
    getInputStyle,
    getAccentColor,
    getGradient,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export preset list for UI (settings screen, etc.)
export const PRESET_LIST = Object.values(DESIGN_PRESETS);

// Re-export for backwards compatibility (some components may use the old interface)
export type PresetConfig = DesignTokens;
