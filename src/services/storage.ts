// Storage service using AsyncStorage
// Handles persistence of analyses, settings, and insights
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResult, AnalysisSummary, AppSettings, WeeklyInsights } from '../types';

const KEYS = {
  ANALYSES: 'verdict_analyses',
  SETTINGS: 'verdict_settings',
  INSIGHTS: 'verdict_insights',
  DRAFT: 'verdict_draft',
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
