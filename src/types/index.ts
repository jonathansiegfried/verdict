// Verdict+ Type Definitions
import type { CommentatorStyle, EvidenceMode, OutcomeType } from '../constants/theme';

// Re-export theme types for convenience
export type { CommentatorStyle, EvidenceMode, OutcomeType } from '../constants/theme';

// ============================================================================
// DATA VERSION MANAGEMENT
// ============================================================================

/**
 * Current data version. Increment when making breaking changes to data models.
 *
 * Version History:
 * - v1: Initial release (no version field)
 * - v2: Added takeaway field to AnalysisResult, added AnalysisTemplate
 * - v3: Added data version tracking, normalized IDs, strict typing
 */
export const CURRENT_DATA_VERSION = 3;

/**
 * Minimum supported version for migration.
 * Data below this version cannot be migrated and will be discarded.
 */
export const MIN_SUPPORTED_VERSION = 1;

/**
 * Versioned data envelope for storage.
 * All data should be wrapped in this structure.
 */
export interface VersionedData<T> {
  version: number;
  data: T;
  migratedAt?: number;  // Timestamp of last migration
}

/**
 * Result of a migration operation.
 */
export interface MigrationResult<T> {
  success: boolean;
  data?: T;
  fromVersion: number;
  toVersion: number;
  warnings?: string[];
  error?: string;
}

// Side/Participant in an argument
export interface Side {
  id: string;
  label: string;        // e.g., "Person A", "You", "Partner"
  content: string;      // The argument/position text
}

// Input for analysis
export interface AnalysisInput {
  sides: Side[];
  commentatorStyle: CommentatorStyle;
  evidenceMode: EvidenceMode;
  context?: string;     // Optional context about the situation
}

// Per-side analysis result
export interface SideAnalysis {
  sideId: string;
  label: string;
  summary: string;
  claims: string[];
  evidenceProvided: string[];
  emotionalStatements: string[];
  logicalStatements: string[];
  scores: {
    clarity: number;           // 0-10
    evidenceQuality: number;   // 0-10
    logicalConsistency: number; // 0-10
    emotionalEscalation: number; // 0-10 (lower is calmer)
    fairness: number;          // 0-10
  };
  flaggedAssumptions?: string[];  // Only in strict mode
}

// Pattern/fallacy detected
export interface PatternDetected {
  name: string;
  description: string;
  occurrences: { sideId: string; quote?: string }[];
}

// Full analysis result
export interface AnalysisResult {
  id: string;
  createdAt: number;
  input: AnalysisInput;

  // Per-side analysis
  sideAnalyses: SideAnalysis[];

  // Overall verdict
  verdictHeadline: string;
  verdictExplanation: string;

  // Win mode: who's more justified
  winAnalysis?: {
    winnerId: string | null;    // null if truly tied
    winnerLabel: string | null;
    confidence: number;         // 0-100
    reasoning: string;
  };

  // Peace mode: resolution path
  peaceAnalysis?: {
    commonGround: string[];
    suggestedCompromise: string;
    stepsForward: string[];
  };

  // What would change the outcome
  outcomeChangers: string[];

  // Patterns detected
  patternsDetected: PatternDetected[];

  // Tags for categorization/insights
  tags: string[];

  // User's personal takeaway/reflection (Reflection Loop)
  takeaway?: string;
}

// Stored analysis (subset for history list)
export interface AnalysisSummary {
  id: string;
  createdAt: number;
  verdictHeadline: string;
  participantLabels: string[];
  commentatorStyle: CommentatorStyle;
  tags: string[];
}

// Design preset type
export type DesignPreset = 'soft-premium' | 'sharp-minimal' | 'neo-glass' | 'playful-bold';

// App settings
export interface AppSettings {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  defaultCommentatorStyle: CommentatorStyle;
  defaultEvidenceMode: EvidenceMode;
  isPro: boolean;                     // Mock pro status
  analysesThisWeek: number;
  weekStartTimestamp: number;
  designPreset: DesignPreset;         // UI design style
}

// Weekly insights
export interface WeeklyInsights {
  weekStartTimestamp: number;
  totalAnalyses: number;
  topTags: { tag: string; count: number }[];
  mostUsedStyle: CommentatorStyle;
  styleUsage: Record<CommentatorStyle, number>;
}

// Loader step for staged loading
export interface LoaderStep {
  id: string;
  label: string;
  completedLabel?: string;
}

// Default loader steps
export const ANALYSIS_STEPS: LoaderStep[] = [
  { id: 'extract', label: 'Extracting claims...', completedLabel: 'Claims extracted' },
  { id: 'evidence', label: 'Checking evidence...', completedLabel: 'Evidence reviewed' },
  { id: 'scoring', label: 'Scoring clarity...', completedLabel: 'Scores calculated' },
  { id: 'verdict', label: 'Generating verdict...', completedLabel: 'Verdict ready' },
];

// Free tier limits
export const FREE_TIER_LIMITS = {
  analysesPerWeek: 5,
  maxSides: 3,
} as const;

export const PRO_TIER_LIMITS = {
  analysesPerWeek: Infinity,
  maxSides: 5,
} as const;

// Template for quick-starting analyses
export interface AnalysisTemplate {
  id: string;
  title: string;                      // e.g., "Couple Disagreement"
  description?: string;               // Optional description
  sides: {
    label: string;                    // Default label for this side
    placeholder?: string;             // Placeholder text for input
  }[];
  commentatorStyle: CommentatorStyle;
  evidenceMode: EvidenceMode;
  createdAt: number;
  lastUsedAt: number;
  useCount: number;                   // Track popularity
}

// Template summary for list display
export interface TemplateSummary {
  id: string;
  title: string;
  sideCount: number;
  commentatorStyle: CommentatorStyle;
  lastUsedAt: number;
  useCount: number;
}

// Re-export design token types for convenience
export * from './design-tokens';
