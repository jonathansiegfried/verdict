// Safe Utility Functions
// Defensive helpers to prevent crashes from malformed data

/**
 * Safely access nested object properties without throwing.
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  defaultValue: T
): T {
  try {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      if (typeof result !== 'object') {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }

    return (result as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely parse JSON without throwing.
 */
export function safeJsonParse<T>(
  json: string,
  defaultValue: T
): T {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely stringify JSON without throwing.
 */
export function safeJsonStringify(
  data: unknown,
  fallback: string = '{}'
): string {
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}

/**
 * Safely execute an async function with error handling.
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn('safeAsync caught error:', error);
    return defaultValue;
  }
}

/**
 * Safely map an array, filtering out errors.
 */
export function safeMap<T, R>(
  arr: T[],
  fn: (item: T, index: number) => R
): R[] {
  if (!Array.isArray(arr)) return [];

  const results: R[] = [];
  for (let i = 0; i < arr.length; i++) {
    try {
      results.push(fn(arr[i], i));
    } catch {
      // Skip items that cause errors
      continue;
    }
  }
  return results;
}

/**
 * Safely filter an array, filtering out errors.
 */
export function safeFilter<T>(
  arr: T[],
  fn: (item: T, index: number) => boolean
): T[] {
  if (!Array.isArray(arr)) return [];

  const results: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    try {
      if (fn(arr[i], i)) {
        results.push(arr[i]);
      }
    } catch {
      // Skip items that cause errors
      continue;
    }
  }
  return results;
}

/**
 * Ensure a value is within bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Safely get array length.
 */
export function safeLength(arr: unknown): number {
  if (Array.isArray(arr)) return arr.length;
  if (typeof arr === 'string') return arr.length;
  return 0;
}

/**
 * Safely access array element.
 */
export function safeArrayAccess<T>(
  arr: T[] | undefined | null,
  index: number,
  defaultValue: T
): T {
  if (!Array.isArray(arr)) return defaultValue;
  if (index < 0 || index >= arr.length) return defaultValue;
  return arr[index] ?? defaultValue;
}

/**
 * Truncate string to max length.
 */
export function truncate(
  str: unknown,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Validate an analysis result has required fields.
 */
export function isValidAnalysisResult(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  // Check required top-level fields
  if (typeof d.id !== 'string') return false;
  if (typeof d.createdAt !== 'number') return false;
  if (!d.input || typeof d.input !== 'object') return false;
  if (!Array.isArray(d.sideAnalyses)) return false;
  if (typeof d.verdictHeadline !== 'string') return false;
  if (typeof d.verdictExplanation !== 'string') return false;
  if (!Array.isArray(d.outcomeChangers)) return false;
  if (!Array.isArray(d.patternsDetected)) return false;
  if (!Array.isArray(d.tags)) return false;

  // Check input structure
  const input = d.input as Record<string, unknown>;
  if (!Array.isArray(input.sides)) return false;
  if (typeof input.commentatorStyle !== 'string') return false;
  if (typeof input.evidenceMode !== 'string') return false;

  return true;
}

/**
 * Validate an analysis template has required fields.
 */
export function isValidTemplate(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.id !== 'string') return false;
  if (typeof d.title !== 'string') return false;
  if (!Array.isArray(d.sides)) return false;
  if (typeof d.commentatorStyle !== 'string') return false;
  if (typeof d.evidenceMode !== 'string') return false;
  if (typeof d.createdAt !== 'number') return false;

  return true;
}

/**
 * Format a timestamp safely.
 */
export function safeFormatDate(
  timestamp: unknown,
  fallback: string = 'Unknown date'
): string {
  try {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      return fallback;
    }
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return fallback;
  }
}

/**
 * Format time safely.
 */
export function safeFormatTime(
  timestamp: unknown,
  fallback: string = 'Unknown time'
): string {
  try {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      return fallback;
    }
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return fallback;
  }
}
