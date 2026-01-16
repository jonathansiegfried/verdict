// Data Migration Service for Verdict+
// Handles versioned data migrations between app versions

import type {
  AnalysisResult,
  AppSettings,
  AnalysisTemplate,
  VersionedData,
  MigrationResult,
} from '../types';
import {
  CURRENT_DATA_VERSION,
  MIN_SUPPORTED_VERSION,
} from '../types';

// ============================================================================
// TYPE DEFINITIONS FOR LEGACY VERSIONS
// ============================================================================

/**
 * V1 Analysis Result - original release
 * Did not have: takeaway, version tracking
 */
interface AnalysisResultV1 {
  id: string;
  createdAt: number;
  input: {
    sides: { id: string; label: string; content: string }[];
    commentatorStyle: string;
    evidenceMode: string;
    context?: string;
  };
  sideAnalyses: {
    sideId: string;
    label: string;
    summary: string;
    claims: string[];
    evidenceProvided: string[];
    emotionalStatements: string[];
    logicalStatements: string[];
    scores: {
      clarity: number;
      evidenceQuality: number;
      logicalConsistency: number;
      emotionalEscalation: number;
      fairness: number;
    };
    flaggedAssumptions?: string[];
  }[];
  verdictHeadline: string;
  verdictExplanation: string;
  winAnalysis?: {
    winnerId: string | null;
    winnerLabel: string | null;
    confidence: number;
    reasoning: string;
  };
  peaceAnalysis?: {
    commonGround: string[];
    suggestedCompromise: string;
    stepsForward: string[];
  };
  outcomeChangers: string[];
  patternsDetected: {
    name: string;
    description: string;
    occurrences: { sideId: string; quote?: string }[];
  }[];
  tags: string[];
  // NO takeaway field in V1
}

/**
 * V2 Analysis Result - added takeaway
 */
interface AnalysisResultV2 extends AnalysisResultV1 {
  takeaway?: string;
}

/**
 * V1 App Settings - original release
 */
interface AppSettingsV1 {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  defaultCommentatorStyle: string;
  defaultEvidenceMode: string;
  isPro: boolean;
  analysesThisWeek: number;
  weekStartTimestamp: number;
  // NO designPreset in V1
}

/**
 * V2 App Settings - added designPreset
 */
interface AppSettingsV2 extends AppSettingsV1 {
  designPreset: string;
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Detect the version of unversioned data based on its structure.
 */
export function detectDataVersion(data: unknown): number {
  if (!data || typeof data !== 'object') return 0;

  // Check if it's already versioned
  if ('version' in data && typeof (data as { version: unknown }).version === 'number') {
    return (data as { version: number }).version;
  }

  // For AnalysisResult: check for takeaway field (V2+)
  if ('id' in data && 'createdAt' in data && 'sideAnalyses' in data) {
    if ('takeaway' in data) {
      return 2; // V2 has takeaway
    }
    return 1; // V1 lacks takeaway
  }

  // For AppSettings: check for designPreset field (V2+)
  if ('hapticsEnabled' in data && 'reduceMotion' in data) {
    if ('designPreset' in data) {
      return 2;
    }
    return 1;
  }

  return 0; // Unknown structure
}

/**
 * Migrate a single AnalysisResult from V1 to V2.
 * Adds the takeaway field (undefined by default).
 */
function migrateAnalysisV1toV2(analysis: AnalysisResultV1): AnalysisResultV2 {
  return {
    ...analysis,
    takeaway: undefined, // New field
  };
}

/**
 * Migrate a single AnalysisResult from V2 to V3 (current).
 * V3 is structurally the same as V2, but ensures all fields are properly typed.
 */
function migrateAnalysisV2toV3(analysis: AnalysisResultV2): AnalysisResult {
  // Ensure IDs are in the correct format
  const id = analysis.id.startsWith('analysis_')
    ? analysis.id
    : `analysis_${analysis.id}`;

  return {
    ...analysis,
    id,
    input: {
      ...analysis.input,
      sides: analysis.input.sides.map((side) => ({
        ...side,
        id: side.id.startsWith('side_') ? side.id : `side_${side.id}`,
      })),
    },
    sideAnalyses: analysis.sideAnalyses.map((sa) => ({
      ...sa,
      sideId: sa.sideId.startsWith('side_') ? sa.sideId : `side_${sa.sideId}`,
    })),
  } as AnalysisResult;
}

/**
 * Migrate AppSettings from V1 to V2.
 * Adds the designPreset field.
 */
function migrateSettingsV1toV2(settings: AppSettingsV1): AppSettingsV2 {
  return {
    ...settings,
    designPreset: 'soft-premium', // Default preset
  };
}

/**
 * Migrate AppSettings from V2 to V3 (current).
 * Ensures proper typing.
 */
function migrateSettingsV2toV3(settings: AppSettingsV2): AppSettings {
  return settings as AppSettings;
}

// ============================================================================
// PUBLIC MIGRATION API
// ============================================================================

/**
 * Migrate an AnalysisResult to the current version.
 */
export function migrateAnalysis(
  data: unknown,
  fromVersion?: number
): MigrationResult<AnalysisResult> {
  const version = fromVersion ?? detectDataVersion(data);
  const warnings: string[] = [];

  if (version === 0) {
    return {
      success: false,
      fromVersion: 0,
      toVersion: CURRENT_DATA_VERSION,
      error: 'Unable to detect data version',
    };
  }

  if (version < MIN_SUPPORTED_VERSION) {
    return {
      success: false,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
      error: `Data version ${version} is below minimum supported version ${MIN_SUPPORTED_VERSION}`,
    };
  }

  if (version === CURRENT_DATA_VERSION) {
    return {
      success: true,
      data: data as AnalysisResult,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
    };
  }

  try {
    let current = data;

    // V1 -> V2
    if (version === 1) {
      current = migrateAnalysisV1toV2(current as AnalysisResultV1);
      warnings.push('Migrated from V1 to V2: added takeaway field');
    }

    // V2 -> V3
    if (version <= 2) {
      current = migrateAnalysisV2toV3(current as AnalysisResultV2);
      warnings.push('Migrated from V2 to V3: normalized IDs');
    }

    return {
      success: true,
      data: current as AnalysisResult,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
      error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Migrate an array of AnalysisResults to the current version.
 */
export function migrateAnalysesArray(
  analyses: unknown[]
): MigrationResult<AnalysisResult[]> {
  const results: AnalysisResult[] = [];
  const warnings: string[] = [];
  let fromVersion = CURRENT_DATA_VERSION;

  for (const analysis of analyses) {
    const result = migrateAnalysis(analysis);
    if (result.success && result.data) {
      results.push(result.data);
      if (result.fromVersion < fromVersion) {
        fromVersion = result.fromVersion;
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    } else {
      warnings.push(`Skipped invalid analysis: ${result.error}`);
    }
  }

  return {
    success: true,
    data: results,
    fromVersion,
    toVersion: CURRENT_DATA_VERSION,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Migrate AppSettings to the current version.
 */
export function migrateSettings(
  data: unknown,
  fromVersion?: number
): MigrationResult<AppSettings> {
  const version = fromVersion ?? detectDataVersion(data);
  const warnings: string[] = [];

  if (version === 0) {
    return {
      success: false,
      fromVersion: 0,
      toVersion: CURRENT_DATA_VERSION,
      error: 'Unable to detect settings version',
    };
  }

  if (version === CURRENT_DATA_VERSION) {
    return {
      success: true,
      data: data as AppSettings,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
    };
  }

  try {
    let current = data;

    // V1 -> V2
    if (version === 1) {
      current = migrateSettingsV1toV2(current as AppSettingsV1);
      warnings.push('Migrated settings from V1 to V2: added designPreset');
    }

    // V2 -> V3
    if (version <= 2) {
      current = migrateSettingsV2toV3(current as AppSettingsV2);
      warnings.push('Migrated settings from V2 to V3: ensured strict types');
    }

    return {
      success: true,
      data: current as AppSettings,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      fromVersion: version,
      toVersion: CURRENT_DATA_VERSION,
      error: `Settings migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Wrap data in a versioned envelope.
 */
export function wrapWithVersion<T>(data: T): VersionedData<T> {
  return {
    version: CURRENT_DATA_VERSION,
    data,
    migratedAt: Date.now(),
  };
}

/**
 * Unwrap versioned data, migrating if necessary.
 */
export function unwrapVersioned<T>(
  wrapped: VersionedData<T> | T,
  migrateFn: (data: unknown, version?: number) => MigrationResult<T>
): MigrationResult<T> {
  // Check if it's a versioned envelope
  if (
    wrapped &&
    typeof wrapped === 'object' &&
    'version' in wrapped &&
    'data' in wrapped
  ) {
    const envelope = wrapped as VersionedData<T>;
    return migrateFn(envelope.data, envelope.version);
  }

  // Not versioned, try to detect and migrate
  return migrateFn(wrapped);
}

/**
 * Check if data needs migration.
 */
export function needsMigration(data: unknown): boolean {
  const version = detectDataVersion(data);
  return version > 0 && version < CURRENT_DATA_VERSION;
}

/**
 * Get migration path description.
 */
export function getMigrationPath(fromVersion: number): string[] {
  const path: string[] = [];

  if (fromVersion < 2) {
    path.push('V1 → V2: Add takeaway field to analyses, add designPreset to settings');
  }

  if (fromVersion < 3) {
    path.push('V2 → V3: Normalize IDs, ensure strict typing');
  }

  return path;
}
