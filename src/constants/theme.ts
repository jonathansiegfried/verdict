// Verdict+ Design System
// Design: Modern, minimal, premium iOS-first
//
// ARCHITECTURE:
// 1. Base colors - used directly in components
// 2. Semantic tokens - used through ThemeContext presets
// 3. Spacing/Typography/Animation - consistent values app-wide

// =============================================================================
// BASE COLOR PALETTE
// =============================================================================

export const colors = {
  // Base backgrounds (darkest to lightest)
  background: '#0A0A0F',
  backgroundSecondary: '#121218',
  backgroundTertiary: '#1A1A24',

  // Surface colors for cards/elevated elements
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  surfaceBorder: '#2A2A3A',

  // Text hierarchy (brightest to dimmest)
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#606070',
  textMuted: '#45454F',

  // Accent colors (Indigo/Violet)
  accent: '#6366F1',
  accentLight: '#818CF8',
  accentDark: '#4F46E5',
  accentMuted: 'rgba(99, 102, 241, 0.15)',

  // Status colors
  success: '#22C55E',
  successMuted: '#166534',
  successBg: 'rgba(34, 197, 94, 0.1)',
  warning: '#F59E0B',
  warningMuted: '#92400E',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorMuted: '#991B1B',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.1)',

  // Gradient endpoints
  gradientStart: '#6366F1',
  gradientMid: '#7C3AED',
  gradientEnd: '#8B5CF6',

  // Overlay/Scrim
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',

  // Special effect colors
  glowPrimary: 'rgba(99, 102, 241, 0.4)',
  glowSuccess: 'rgba(34, 197, 94, 0.4)',
  shimmer: 'rgba(255, 255, 255, 0.05)',
} as const;

// =============================================================================
// COLOR PALETTES FOR DESIGN PRESETS
// Each preset can have its own accent color scheme
// =============================================================================

export const palettes = {
  // Default indigo palette (used by soft-premium)
  indigo: {
    accent: '#6366F1',
    accentLight: '#818CF8',
    accentDark: '#4F46E5',
    gradient: ['#6366F1', '#8B5CF6'] as const,
  },
  // Emerald palette (alternative)
  emerald: {
    accent: '#10B981',
    accentLight: '#34D399',
    accentDark: '#059669',
    gradient: ['#10B981', '#06B6D4'] as const,
  },
  // Rose palette (warm alternative)
  rose: {
    accent: '#F43F5E',
    accentLight: '#FB7185',
    accentDark: '#E11D48',
    gradient: ['#F43F5E', '#EC4899'] as const,
  },
  // Amber palette (warm gold)
  amber: {
    accent: '#F59E0B',
    accentLight: '#FBBF24',
    accentDark: '#D97706',
    gradient: ['#F59E0B', '#EF4444'] as const,
  },
  // Cyan palette (cool tech)
  cyan: {
    accent: '#06B6D4',
    accentLight: '#22D3EE',
    accentDark: '#0891B2',
    gradient: ['#06B6D4', '#3B82F6'] as const,
  },
} as const;

// =============================================================================
// SPACING SCALE
// Based on 4px grid system
// =============================================================================

export const spacing = {
  none: 0,
  xs: 4,      // Tight gaps
  sm: 8,      // Small gaps
  md: 12,     // Default gaps
  lg: 16,     // Comfortable gaps
  xl: 20,     // Section gaps
  xxl: 24,    // Large section gaps
  xxxl: 32,   // Hero/major section gaps
  '4xl': 40,  // Extra large
  '5xl': 48,  // Maximum spacing
} as const;

// =============================================================================
// BORDER RADIUS SCALE
// Used for different component types
// =============================================================================

export const borderRadius = {
  none: 0,
  xs: 4,      // Subtle rounding (tags, small chips)
  sm: 8,      // Small elements (buttons, small cards)
  md: 12,     // Medium elements (cards, inputs)
  lg: 16,     // Large elements (modals, sheets)
  xl: 20,     // Extra large (hero cards)
  '2xl': 24,  // Very rounded
  '3xl': 28,  // Almost pill
  full: 9999, // Full pill/circle
} as const;

// =============================================================================
// TYPOGRAPHY SCALE
// iOS-first type system with semantic naming
// =============================================================================

export const typography = {
  // Font sizes - semantic scale
  sizes: {
    // Micro text (labels, captions)
    xs: 11,
    sm: 13,
    // Body text
    base: 15,
    md: 17,
    // Subheadings
    lg: 20,
    xl: 24,
    // Headings
    xxl: 28,
    xxxl: 34,
    // Display/Hero
    display: 42,
    hero: 52,
  },

  // Font weights (as strings for RN)
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Line heights (multipliers)
  lineHeights: {
    none: 1,
    tight: 1.1,      // Display text
    snug: 1.25,      // Headings
    normal: 1.4,     // Body text
    relaxed: 1.6,    // Long-form
    loose: 1.8,      // Extra breathing room
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,       // All caps labels
  },
} as const;

// =============================================================================
// SHADOWS
// Elevation system for depth hierarchy
// =============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  // Glow effects (colored shadows)
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 0,
  },
  glowLg: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 0,
  },
  // Inset appearance (use with borders)
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
} as const;

// =============================================================================
// ANIMATION
// Motion system for consistent feel
// =============================================================================

export const animation = {
  // Spring physics configs (for react-native-reanimated)
  spring: {
    default: { damping: 15, stiffness: 150 },
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 180 },
    stiff: { damping: 20, stiffness: 300 },
    snappy: { damping: 12, stiffness: 400 },
    slow: { damping: 25, stiffness: 80 },
  },

  // Timing durations (ms)
  duration: {
    instant: 50,
    fastest: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
    reveal: 800,      // For dramatic reveals
    anticipation: 600, // Pre-reveal pause
  },

  // Stagger delays for list items (ms)
  stagger: {
    fast: 30,
    normal: 50,
    slow: 100,
  },

  // Easing curves (bezier values for timing-based animations)
  easing: {
    linear: [0, 0, 1, 1] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeOut: [0, 0, 0.58, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const,
    // Custom dramatic curves
    anticipate: [0.36, 0, 0.66, -0.56] as const,
    overshoot: [0.34, 1.56, 0.64, 1] as const,
  },

  // Scale values for press feedback
  scale: {
    pressed: 0.96,
    pressedSubtle: 0.98,
    hover: 1.02,
    active: 0.95,
  },
} as const;

// =============================================================================
// LAYOUT CONSTANTS
// Fixed values that should be consistent
// =============================================================================

export const layout = {
  // Screen padding
  screenPadding: spacing.lg,
  screenPaddingLarge: spacing.xl,

  // Safe area approximations (when not using SafeAreaContext)
  headerHeight: 56,
  tabBarHeight: 84,
  bottomSheetHandle: 4,

  // Common component heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },

  // Max widths for readability
  maxContentWidth: 600,
  maxCardWidth: 400,

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 30,
    toast: 40,
    tooltip: 50,
  },
} as const;

// =============================================================================
// CONSTANTS (Magic numbers extracted)
// =============================================================================

export const limits = {
  maxAnalyses: 100,
  maxTemplates: 20,
  draftExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
  autosaveDelayMs: 2000,
  debounceMs: 300,
} as const;

// Commentator style configurations
export const commentatorStyles = [
  { id: 'neutral', label: 'Neutral', description: 'Balanced and impartial' },
  { id: 'direct', label: 'Direct', description: 'Straightforward, no-nonsense' },
  { id: 'harsh', label: 'Harsh', description: 'Brutally honest, critical' },
  { id: 'savage', label: 'Savage', description: 'Witty and cutting' },
  { id: 'coach', label: 'Coach', description: 'Supportive but firm' },
  { id: 'lawyer', label: 'Lawyer-ish', description: 'Precise and analytical' },
  { id: 'mediator', label: 'Mediator', description: 'Seeks common ground' },
] as const;

export type CommentatorStyle = typeof commentatorStyles[number]['id'];

export const evidenceModes = [
  { id: 'light', label: 'Light', description: 'Accept reasonable assumptions' },
  { id: 'strict', label: 'Strict', description: 'Flag all unverified claims' },
] as const;

export type EvidenceMode = typeof evidenceModes[number]['id'];

export const outcomeTypes = [
  { id: 'win', label: 'Win', description: 'Determine a clear winner' },
  { id: 'peace', label: 'Peace', description: 'Find resolution path' },
] as const;

export type OutcomeType = typeof outcomeTypes[number]['id'];
