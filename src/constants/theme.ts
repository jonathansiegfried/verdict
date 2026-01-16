// Verdict+ Dark Premium Theme
// Design: Modern, minimal, premium iOS-first

export const colors = {
  // Base backgrounds
  background: '#0A0A0F',
  backgroundSecondary: '#121218',
  backgroundTertiary: '#1A1A24',

  // Surface colors for cards/elevated elements
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  surfaceBorder: '#2A2A3A',

  // Text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#606070',
  textMuted: '#45454F',

  // Accent colors
  accent: '#6366F1',        // Indigo primary
  accentLight: '#818CF8',
  accentDark: '#4F46E5',

  // Status colors
  success: '#22C55E',
  successMuted: '#166534',
  warning: '#F59E0B',
  warningMuted: '#92400E',
  error: '#EF4444',
  errorMuted: '#991B1B',
  info: '#3B82F6',

  // Gradient endpoints
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  sizes: {
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
  // Font weights (as strings for RN)
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 0,
  },
} as const;

export const animation = {
  // Spring configs
  spring: {
    default: { damping: 15, stiffness: 150 },
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 180 },
    stiff: { damping: 20, stiffness: 300 },
  },
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    reveal: 600,
  },
  // Easing (for timing-based animations)
  easing: {
    easeOut: [0.33, 1, 0.68, 1] as const,
    easeInOut: [0.65, 0, 0.35, 1] as const,
  },
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
