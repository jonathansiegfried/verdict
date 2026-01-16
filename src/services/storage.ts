// Storage service using AsyncStorage
// Handles persistence of analyses, settings, and insights
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResult, AnalysisSummary, AppSettings, WeeklyInsights, AnalysisTemplate, TemplateSummary } from '../types';

const KEYS = {
  ANALYSES: 'verdict_analyses',
  SETTINGS: 'verdict_settings',
  INSIGHTS: 'verdict_insights',
  DRAFT: 'verdict_draft',
  TEMPLATES: 'verdict_templates',
} as const;

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  reduceMotion: false,
  defaultCommentatorStyle: 'neutral',
  defaultEvidenceMode: 'light',
  isPro: false,
  analysesThisWeek: 0,
  weekStartTimestamp: getWeekStart(),
  designPreset: 'soft-premium',
};

function getWeekStart(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
}

// Settings operations
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;

    const settings = JSON.parse(raw) as AppSettings;

    // Check if we need to reset weekly count
    const currentWeekStart = getWeekStart();
    if (settings.weekStartTimestamp < currentWeekStart) {
      settings.analysesThisWeek = 0;
      settings.weekStartTimestamp = currentWeekStart;
      await saveSettings(settings);
    }

    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Analysis operations
export async function loadAnalyses(): Promise<AnalysisResult[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ANALYSES);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisResult[];
  } catch {
    return [];
  }
}

export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  const analyses = await loadAnalyses();
  analyses.unshift(analysis); // Add to beginning
  // Keep max 100 analyses
  const trimmed = analyses.slice(0, 100);
  await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(trimmed));
}

export async function deleteAnalysis(id: string): Promise<void> {
  const analyses = await loadAnalyses();
  const filtered = analyses.filter((a) => a.id !== id);
  await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(filtered));
}

export async function renameAnalysis(id: string, newTitle: string): Promise<void> {
  const analyses = await loadAnalyses();
  const updated = analyses.map((a) =>
    a.id === id ? { ...a, verdictHeadline: newTitle } : a
  );
  await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(updated));
}

export async function duplicateAnalysis(id: string): Promise<AnalysisResult | null> {
  const analyses = await loadAnalyses();
  const original = analyses.find((a) => a.id === id);
  if (!original) return null;

  const duplicate: AnalysisResult = {
    ...original,
    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    verdictHeadline: `${original.verdictHeadline} (Copy)`,
  };

  analyses.unshift(duplicate);
  const trimmed = analyses.slice(0, 100);
  await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(trimmed));
  return duplicate;
}

export async function getAnalysisById(id: string): Promise<AnalysisResult | null> {
  const analyses = await loadAnalyses();
  return analyses.find((a) => a.id === id) ?? null;
}

export async function saveTakeaway(id: string, takeaway: string): Promise<void> {
  const analyses = await loadAnalyses();
  const updated = analyses.map((a) =>
    a.id === id ? { ...a, takeaway } : a
  );
  await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(updated));
}

// Get summaries for history list
export async function getAnalysisSummaries(): Promise<AnalysisSummary[]> {
  const analyses = await loadAnalyses();
  return analyses.map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    verdictHeadline: a.verdictHeadline,
    participantLabels: a.input.sides.map((s) => s.label),
    commentatorStyle: a.input.commentatorStyle,
    tags: a.tags,
  }));
}

// Weekly insights operations
export async function calculateWeeklyInsights(): Promise<WeeklyInsights> {
  const analyses = await loadAnalyses();
  const weekStart = getWeekStart();

  const thisWeekAnalyses = analyses.filter((a) => a.createdAt >= weekStart);

  // Count tags
  const tagCounts: Record<string, number> = {};
  thisWeekAnalyses.forEach((a) => {
    a.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Count style usage
  const styleUsage: Record<string, number> = {
    neutral: 0,
    direct: 0,
    harsh: 0,
    savage: 0,
    coach: 0,
    lawyer: 0,
    mediator: 0,
  };

  thisWeekAnalyses.forEach((a) => {
    styleUsage[a.input.commentatorStyle]++;
  });

  const mostUsedStyle = (Object.entries(styleUsage)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral') as AppSettings['defaultCommentatorStyle'];

  return {
    weekStartTimestamp: weekStart,
    totalAnalyses: thisWeekAnalyses.length,
    topTags,
    mostUsedStyle,
    styleUsage: styleUsage as WeeklyInsights['styleUsage'],
  };
}

// Draft operations for autosave
export interface DraftData {
  sides: Array<{ id: string; label: string; content: string }>;
  commentatorStyle: string;
  evidenceMode: string;
  context: string;
  savedAt: number;
}

export async function saveDraft(draft: DraftData): Promise<void> {
  await AsyncStorage.setItem(KEYS.DRAFT, JSON.stringify(draft));
}

export async function loadDraft(): Promise<DraftData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DRAFT);
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftData;
    // Check if draft is older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - draft.savedAt > maxAge) {
      await clearDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.DRAFT);
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.ANALYSES, KEYS.SETTINGS, KEYS.INSIGHTS, KEYS.DRAFT]);
}

// Import/Export data types
export interface ExportData {
  exportedAt: string;
  appVersion: string;
  totalAnalyses: number;
  analyses: AnalysisResult[];
}

// Validate imported data structure
function isValidExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.exportedAt !== 'string') return false;
  if (typeof d.appVersion !== 'string') return false;
  if (typeof d.totalAnalyses !== 'number') return false;
  if (!Array.isArray(d.analyses)) return false;

  // Validate each analysis has required fields
  for (const analysis of d.analyses) {
    if (!analysis || typeof analysis !== 'object') return false;
    const a = analysis as Record<string, unknown>;
    if (typeof a.id !== 'string') return false;
    if (typeof a.createdAt !== 'number') return false;
    if (!a.input || typeof a.input !== 'object') return false;
  }

  return true;
}

// Import analyses from JSON data
export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
}

export async function importAnalyses(
  jsonString: string,
  mode: ImportMode = 'merge'
): Promise<ImportResult> {
  try {
    const data = JSON.parse(jsonString);

    if (!isValidExportData(data)) {
      return {
        success: false,
        message: 'Invalid file format. Please select a valid Verdict+ export file.',
        imported: 0,
        skipped: 0,
      };
    }

    if (data.analyses.length === 0) {
      return {
        success: false,
        message: 'The import file contains no analyses.',
        imported: 0,
        skipped: 0,
      };
    }

    if (mode === 'replace') {
      // Replace all existing analyses
      const trimmed = data.analyses.slice(0, 100);
      await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(trimmed));

      return {
        success: true,
        message: `Successfully imported ${trimmed.length} analyses.`,
        imported: trimmed.length,
        skipped: data.analyses.length - trimmed.length,
      };
    } else {
      // Merge with existing analyses
      const existing = await loadAnalyses();
      const existingIds = new Set(existing.map(a => a.id));

      let imported = 0;
      let skipped = 0;

      for (const analysis of data.analyses) {
        if (existingIds.has(analysis.id)) {
          skipped++;
        } else {
          existing.push(analysis);
          imported++;
        }
      }

      // Sort by createdAt descending and limit to 100
      existing.sort((a, b) => b.createdAt - a.createdAt);
      const trimmed = existing.slice(0, 100);

      await AsyncStorage.setItem(KEYS.ANALYSES, JSON.stringify(trimmed));

      return {
        success: true,
        message: `Imported ${imported} new analyses${skipped > 0 ? `, skipped ${skipped} duplicates` : ''}.`,
        imported,
        skipped,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof SyntaxError
        ? 'Invalid JSON file. Please select a valid export file.'
        : 'Failed to import data. Please try again.',
      imported: 0,
      skipped: 0,
    };
  }
}

// ========== TEMPLATE OPERATIONS ==========

// Load all templates
export async function loadTemplates(): Promise<AnalysisTemplate[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
    if (!raw) return getDefaultTemplates();
    return JSON.parse(raw) as AnalysisTemplate[];
  } catch {
    return getDefaultTemplates();
  }
}

// Save a new template
export async function saveTemplate(template: AnalysisTemplate): Promise<void> {
  const templates = await loadTemplates();
  templates.unshift(template);
  // Max 20 templates
  const trimmed = templates.slice(0, 20);
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(trimmed));
}

// Update an existing template
export async function updateTemplate(id: string, updates: Partial<AnalysisTemplate>): Promise<void> {
  const templates = await loadTemplates();
  const updated = templates.map((t) =>
    t.id === id ? { ...t, ...updates } : t
  );
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  const templates = await loadTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(filtered));
}

// Mark template as used (updates lastUsedAt and increments useCount)
export async function markTemplateUsed(id: string): Promise<void> {
  const templates = await loadTemplates();
  const updated = templates.map((t) =>
    t.id === id
      ? { ...t, lastUsedAt: Date.now(), useCount: t.useCount + 1 }
      : t
  );
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
}

// Get template summaries for list display
export async function getTemplateSummaries(): Promise<TemplateSummary[]> {
  const templates = await loadTemplates();
  return templates.map((t) => ({
    id: t.id,
    title: t.title,
    sideCount: t.sides.length,
    commentatorStyle: t.commentatorStyle,
    lastUsedAt: t.lastUsedAt,
    useCount: t.useCount,
  }));
}

// Get recently used templates (for Quick Start)
export async function getRecentTemplates(limit = 3): Promise<AnalysisTemplate[]> {
  const templates = await loadTemplates();
  // Sort by lastUsedAt descending, then by useCount
  return templates
    .filter((t) => t.useCount > 0)
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, limit);
}

// Get template by ID
export async function getTemplateById(id: string): Promise<AnalysisTemplate | null> {
  const templates = await loadTemplates();
  return templates.find((t) => t.id === id) ?? null;
}

// Default starter templates
function getDefaultTemplates(): AnalysisTemplate[] {
  const now = Date.now();
  return [
    {
      id: 'default_couple',
      title: 'Couple Disagreement',
      description: 'Resolve relationship conflicts fairly',
      sides: [
        { label: 'Partner A', placeholder: 'What is their perspective?' },
        { label: 'Partner B', placeholder: 'What is their perspective?' },
      ],
      commentatorStyle: 'mediator',
      evidenceMode: 'light',
      createdAt: now,
      lastUsedAt: 0,
      useCount: 0,
    },
    {
      id: 'default_work',
      title: 'Work Debate',
      description: 'Analyze professional disagreements',
      sides: [
        { label: 'Your View', placeholder: 'Your position...' },
        { label: 'Colleague', placeholder: 'Their position...' },
      ],
      commentatorStyle: 'lawyer',
      evidenceMode: 'strict',
      createdAt: now,
      lastUsedAt: 0,
      useCount: 0,
    },
    {
      id: 'default_family',
      title: 'Family Discussion',
      description: 'Navigate family dynamics',
      sides: [
        { label: 'Family Member 1', placeholder: 'Their view...' },
        { label: 'Family Member 2', placeholder: 'Their view...' },
      ],
      commentatorStyle: 'coach',
      evidenceMode: 'light',
      createdAt: now,
      lastUsedAt: 0,
      useCount: 0,
    },
  ];
}
