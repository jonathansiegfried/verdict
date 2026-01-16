# Verdict+ Data Migration Strategy

## Overview

This document describes the data versioning and migration system for Verdict+. The system ensures backward compatibility when data models change between app versions.

## Version History

| Version | Changes | Release |
|---------|---------|---------|
| V1 | Initial release, no version field | MVP |
| V2 | Added `takeaway` field to AnalysisResult, added `AnalysisTemplate` | Phase 5 |
| V3 | Added data version tracking, normalized IDs, strict typing | Phase 7 |

## Key Types

### VersionedData<T>

All stored data should be wrapped in a versioned envelope:

```typescript
interface VersionedData<T> {
  version: number;
  data: T;
  migratedAt?: number;  // Timestamp of last migration
}
```

### MigrationResult<T>

Result of a migration operation:

```typescript
interface MigrationResult<T> {
  success: boolean;
  data?: T;
  fromVersion: number;
  toVersion: number;
  warnings?: string[];
  error?: string;
}
```

## Migration Functions

### `detectDataVersion(data: unknown): number`

Detects the version of unversioned data based on its structure:
- Returns `0` if structure is unrecognized
- Returns `1` for V1 data (no takeaway field)
- Returns `2` for V2 data (has takeaway)
- Returns `3` for V3 data (fully versioned)

### `migrateAnalysis(data, fromVersion?): MigrationResult<AnalysisResult>`

Migrates a single AnalysisResult to the current version.

### `migrateAnalysesArray(analyses): MigrationResult<AnalysisResult[]>`

Migrates an array of AnalysisResults, handling partial failures gracefully.

### `migrateSettings(data, fromVersion?): MigrationResult<AppSettings>`

Migrates AppSettings to the current version.

## Storage Integration

### Automatic Migration

Migrations run automatically on data load:

```typescript
// In loadAnalyses()
if (detectDataVersion(firstItem) < CURRENT_DATA_VERSION) {
  const result = migrateAnalysesArray(parsed);
  if (result.success && result.data) {
    await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(result.data));
  }
}
```

### Session Tracking

Migration is tracked per session to avoid redundant work:

```typescript
let migrationCompleted = false;

// Only run migration once per app session
if (!migrationCompleted && needsMigration(data)) {
  // ... run migration
  migrationCompleted = true;
}
```

## Migration Paths

### V1 → V2

**AnalysisResult:**
- Added `takeaway?: string` field (defaults to `undefined`)

**AppSettings:**
- Added `designPreset: DesignPreset` field (defaults to `'soft-premium'`)

### V2 → V3

**AnalysisResult:**
- Normalized IDs to use consistent prefixes (`analysis_`, `side_`)
- Ensured all fields match strict TypeScript types

**AppSettings:**
- No structural changes, just type enforcement

## Adding New Migrations

When making breaking changes to data models:

1. **Increment `CURRENT_DATA_VERSION`** in `src/types/index.ts`:
   ```typescript
   export const CURRENT_DATA_VERSION = 4; // Was 3
   ```

2. **Add migration function** in `src/services/migrations.ts`:
   ```typescript
   function migrateAnalysisV3toV4(analysis: AnalysisResultV3): AnalysisResultV4 {
     return {
       ...analysis,
       newField: 'default value',
     };
   }
   ```

3. **Update migration chain** in `migrateAnalysis()`:
   ```typescript
   // V3 -> V4
   if (version <= 3) {
     current = migrateAnalysisV3toV4(current as AnalysisResultV3);
     warnings.push('Migrated from V3 to V4: added newField');
   }
   ```

4. **Update version history** in this document.

5. **Test thoroughly** with existing data from all previous versions.

## Best Practices

1. **Never remove fields** - only deprecate them
2. **Provide defaults** for new required fields
3. **Log migration warnings** for debugging
4. **Test migration paths** from all supported versions
5. **Keep MIN_SUPPORTED_VERSION** updated when dropping old version support

## Error Handling

### Invalid Data

If data cannot be parsed or migrated:
- Return empty array/default settings
- Log error for debugging
- Don't crash the app

### Partial Failures

When migrating arrays:
- Continue with valid items
- Track skipped items in warnings
- Return partial results

## Storage Keys

```typescript
const KEYS = {
  ANALYSES: 'verdict_analyses',
  SETTINGS: 'verdict_settings',
  INSIGHTS: 'verdict_insights',
  DRAFT: 'verdict_draft',
  TEMPLATES: 'verdict_templates',
  DATA_VERSION: 'verdict_data_version',
} as const;
```

## Debugging

### Get Current Version

```typescript
const version = await getStoredDataVersion();
console.log(`Data version: ${version}`);
```

### Force Migration

```typescript
const result = await forceMigration();
console.log(`Migrated ${result.analyses} analyses`);
```

### Clear All Data (Reset)

```typescript
await clearAllData();
// This also resets the version tracking
```
