// Design Token Type Contracts
// These types enforce consistency across the entire design system
//
// USAGE:
// - Import these types when building new components
// - Use DesignTokens interface when accessing theme tokens
// - Use specific token types (RadiusToken, SpacingToken, etc.) for props

// =============================================================================
// SPACING TOKENS
// =============================================================================

// Spacing keys that exist in all presets
export type SpacingKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

// Extended spacing keys (only in base theme, not presets)
export type ExtendedSpacingKey = SpacingKey | '4xl' | '5xl';

export interface SpacingScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

// Extended spacing scale (for base theme.ts)
export interface ExtendedSpacingScale extends SpacingScale {
  '4xl': number;
  '5xl': number;
}

// For component props that accept spacing
export type SpacingToken = SpacingKey | number;

// =============================================================================
// RADIUS TOKENS
// =============================================================================

export type RadiusKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export interface RadiusScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl'?: number;
  full: number;
}

// For component props that accept radius
export type RadiusToken = RadiusKey | number;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export type FontSizeKey = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'display' | 'hero';

export type FontWeightKey = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';

export type LineHeightKey = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

export type LetterSpacingKey = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';

export interface TypographyScale {
  sizes: Record<FontSizeKey, number>;
  weights: Record<FontWeightKey, string>;
  lineHeights: Record<LineHeightKey, number>;
  letterSpacing: Record<LetterSpacingKey, number>;
}

// For component props
export type FontSizeToken = FontSizeKey | number;
export type FontWeightToken = FontWeightKey | string;

// =============================================================================
// COLOR TOKENS
// =============================================================================

export type ColorKey =
  // Backgrounds
  | 'background'
  | 'backgroundSecondary'
  | 'backgroundTertiary'
  // Surfaces
  | 'surface'
  | 'surfaceElevated'
  | 'surfaceBorder'
  // Text
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textMuted'
  // Accent
  | 'accent'
  | 'accentLight'
  | 'accentDark'
  | 'accentMuted'
  // Status
  | 'success'
  | 'successMuted'
  | 'successBg'
  | 'warning'
  | 'warningMuted'
  | 'warningBg'
  | 'error'
  | 'errorMuted'
  | 'errorBg'
  | 'info'
  | 'infoBg'
  // Gradient
  | 'gradientStart'
  | 'gradientMid'
  | 'gradientEnd'
  // Overlay
  | 'overlay'
  | 'overlayLight'
  | 'overlayDark'
  // Effects
  | 'glowPrimary'
  | 'glowSuccess'
  | 'shimmer';

// Preset-specific palette (overrides base colors)
export interface PresetPalette {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentMuted: string;
  gradient: readonly [string, string];
  glow: string;
}

// =============================================================================
// SHADOW TOKENS
// =============================================================================

export type ShadowKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'glow' | 'glowLg' | 'inner';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export type ShadowScale = Record<ShadowKey, ShadowStyle>;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export interface SpringConfig {
  damping: number;
  stiffness: number;
}

export type SpringPreset = 'default' | 'gentle' | 'bouncy' | 'stiff' | 'snappy' | 'slow';

export type DurationKey = 'instant' | 'fastest' | 'fast' | 'normal' | 'slow' | 'slower' | 'reveal' | 'anticipation';

export type StaggerKey = 'fast' | 'normal' | 'slow';

export interface AnimationTokens {
  spring: Record<SpringPreset, SpringConfig>;
  duration: Record<DurationKey, number>;
  stagger: Record<StaggerKey, number>;
  easing: Record<string, readonly number[]>;
  scale: {
    pressed: number;
    pressedSubtle: number;
    hover: number;
    active: number;
  };
}

// =============================================================================
// LAYOUT TOKENS
// =============================================================================

export interface LayoutTokens {
  screenPadding: number;
  screenPaddingLarge: number;
  headerHeight: number;
  tabBarHeight: number;
  bottomSheetHandle: number;
  buttonHeight: {
    sm: number;
    md: number;
    lg: number;
  };
  inputHeight: {
    sm: number;
    md: number;
    lg: number;
  };
  maxContentWidth: number;
  maxCardWidth: number;
  zIndex: {
    base: number;
    dropdown: number;
    sticky: number;
    modal: number;
    toast: number;
    tooltip: number;
  };
}

// =============================================================================
// DESIGN PRESET TOKENS (Full preset configuration)
// =============================================================================

export type DesignPresetId = 'soft-premium' | 'sharp-minimal' | 'neo-glass' | 'playful-bold';

export interface CardTokens {
  borderWidth: number;
  borderStyle: 'solid' | 'none';
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
  elevation: number;
  backdropBlur?: number;
  backgroundOpacity: number;
}

export interface ButtonTokens {
  height: {
    sm: number;
    md: number;
    lg: number;
  };
  paddingHorizontal: number;
  fontWeight: '500' | '600' | '700' | '800';
  borderWidth: number;
  uppercase: boolean;
}

export interface InputTokens {
  height: number;
  borderWidth: number;
  focusBorderWidth: number;
}

export interface TabBarTokens {
  height: number;
  iconSize: number;
  labelSize: number;
  showLabel: boolean;
}

export interface MotionTokens {
  staggerDelay: number;
  springDamping: number;
  springStiffness: number;
}

// Complete design tokens for a preset
export interface DesignTokens {
  id: DesignPresetId;
  name: string;
  description: string;
  palette: PresetPalette;
  radius: RadiusScale;
  spacing: SpacingScale;
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
  card: CardTokens;
  button: ButtonTokens;
  input: InputTokens;
  tabBar: TabBarTokens;
  motion: MotionTokens;
}

// =============================================================================
// COMPONENT PROP HELPERS
// =============================================================================

// Generic size prop
export type SizeToken = 'sm' | 'md' | 'lg';

// Variant types for common components
export type CardVariant = 'default' | 'elevated' | 'glass';
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'gradient';
export type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent';

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Helper to get numeric value from token key or number
export type ResolvedValue<T extends string | number> = T extends string ? number : T;

// Helper for style objects
export type StyleObject = Record<string, unknown>;

// Theme-aware style function type
export type ThemedStyleFn<T = StyleObject> = (tokens: DesignTokens) => T;

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export for convenience - consumers can import from here
export type {
  DesignPresetId as DesignPreset,
};
