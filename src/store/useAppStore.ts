// Zustand store for Verdict+ app state
import { create } from 'zustand';
import type {
  AnalysisInput,
  AnalysisResult,
  AnalysisSummary,
  AppSettings,
  Side,
  WeeklyInsights,
  AnalysisTemplate,
  TemplateSummary,
} from '../types';
import type { CommentatorStyle, EvidenceMode } from '../constants/theme';
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  loadAnalyses,
  saveAnalysis,
  deleteAnalysis as deleteAnalysisFromStorage,
  renameAnalysis as renameAnalysisInStorage,
  duplicateAnalysis as duplicateAnalysisInStorage,
  getAnalysisSummaries,
  calculateWeeklyInsights,
  saveDraft,
  loadDraft,
  clearDraft,
  type DraftData,
  // Templates
  loadTemplates,
  saveTemplate as saveTemplateToStorage,
  updateTemplate as updateTemplateInStorage,
  deleteTemplate as deleteTemplateFromStorage,
  markTemplateUsed,
  getTemplateSummaries,
  getRecentTemplates,
} from '../services/storage';
import { analyzeArgument } from '../services/ai';
import { FREE_TIER_LIMITS, PRO_TIER_LIMITS } from '../types';

interface AppState {
  // Settings
  settings: AppSettings;
  settingsLoaded: boolean;

  // Current analysis input
  currentSides: Side[];
  currentCommentatorStyle: CommentatorStyle;
  currentEvidenceMode: EvidenceMode;
  currentContext: string;

  // Analysis state
  isAnalyzing: boolean;
  currentAnalysis: AnalysisResult | null;
  analysisError: string | null;

  // History
  analysisSummaries: AnalysisSummary[];
  selectedAnalysis: AnalysisResult | null;

  // Insights
  weeklyInsights: WeeklyInsights | null;

  // Templates
  templates: AnalysisTemplate[];
  templateSummaries: TemplateSummary[];
  recentTemplates: AnalysisTemplate[];

  // Actions - Settings
  loadAppSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  togglePro: () => Promise<void>;

  // Actions - Input
  setSides: (sides: Side[]) => void;
  addSide: () => void;
  updateSide: (id: string, updates: Partial<Side>) => void;
  removeSide: (id: string) => void;
  setCommentatorStyle: (style: CommentatorStyle) => void;
  setEvidenceMode: (mode: EvidenceMode) => void;
  setContext: (context: string) => void;
  resetInput: () => void;

  // Actions - Drafts
  saveCurrentDraft: () => Promise<void>;
  loadSavedDraft: () => Promise<DraftData | null>;
  clearSavedDraft: () => Promise<void>;
  restoreDraft: (draft: DraftData) => void;

  // Actions - Analysis
  canStartAnalysis: () => boolean;
  getRemainingAnalyses: () => number;
  startAnalysis: () => Promise<AnalysisResult>;
  clearCurrentAnalysis: () => void;

  // Actions - History
  loadHistory: () => Promise<void>;
  selectAnalysis: (analysis: AnalysisResult | null) => void;
  deleteAnalysis: (id: string) => Promise<void>;
  renameAnalysis: (id: string, newTitle: string) => Promise<void>;
  duplicateAnalysis: (id: string) => Promise<void>;

  // Actions - Insights
  loadInsights: () => Promise<void>;

  // Actions - Templates
  loadAllTemplates: () => Promise<void>;
  createTemplate: (template: Omit<AnalysisTemplate, 'id' | 'createdAt' | 'lastUsedAt' | 'useCount'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<AnalysisTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (id: string) => Promise<void>;
  applyTemplate: (template: AnalysisTemplate) => void;
}

function generateSideId(): string {
  return `side_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function createDefaultSides(): Side[] {
  return [
    { id: generateSideId(), label: 'Side A', content: '' },
    { id: generateSideId(), label: 'Side B', content: '' },
  ];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,

  currentSides: createDefaultSides(),
  currentCommentatorStyle: 'neutral',
  currentEvidenceMode: 'light',
  currentContext: '',

  isAnalyzing: false,
  currentAnalysis: null,
  analysisError: null,

  analysisSummaries: [],
  selectedAnalysis: null,

  weeklyInsights: null,

  templates: [],
  templateSummaries: [],
  recentTemplates: [],

  // Settings actions
  loadAppSettings: async () => {
    const settings = await loadSettings();
    set({
      settings,
      settingsLoaded: true,
      currentCommentatorStyle: settings.defaultCommentatorStyle,
      currentEvidenceMode: settings.defaultEvidenceMode,
    });
  },

  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
    set({ settings: newSettings });
  },

  togglePro: async () => {
    const { settings } = get();
    await get().updateSettings({ isPro: !settings.isPro });
  },

  // Input actions
  setSides: (sides) => set({ currentSides: sides }),

  addSide: () => {
    const { currentSides, settings } = get();
    const maxSides = settings.isPro ? PRO_TIER_LIMITS.maxSides : FREE_TIER_LIMITS.maxSides;

    if (currentSides.length >= maxSides) return;

    const newSide: Side = {
      id: generateSideId(),
      label: `Side ${String.fromCharCode(65 + currentSides.length)}`,
      content: '',
    };
    set({ currentSides: [...currentSides, newSide] });
  },

  updateSide: (id, updates) => {
    const { currentSides } = get();
    set({
      currentSides: currentSides.map((side) =>
        side.id === id ? { ...side, ...updates } : side
      ),
    });
  },

  removeSide: (id) => {
    const { currentSides } = get();
    if (currentSides.length <= 2) return;
    set({ currentSides: currentSides.filter((side) => side.id !== id) });
  },

  setCommentatorStyle: (style) => set({ currentCommentatorStyle: style }),
  setEvidenceMode: (mode) => set({ currentEvidenceMode: mode }),
  setContext: (context) => set({ currentContext: context }),

  resetInput: () => {
    const { settings } = get();
    set({
      currentSides: createDefaultSides(),
      currentCommentatorStyle: settings.defaultCommentatorStyle,
      currentEvidenceMode: settings.defaultEvidenceMode,
      currentContext: '',
      currentAnalysis: null,
      analysisError: null,
    });
    // Clear any saved draft when resetting
    clearDraft().catch(() => {});
  },

  // Draft actions
  saveCurrentDraft: async () => {
    const { currentSides, currentCommentatorStyle, currentEvidenceMode, currentContext } = get();
    // Only save if there's content
    const hasContent = currentSides.some(s => s.content.trim().length > 0);
    if (!hasContent) return;

    await saveDraft({
      sides: currentSides,
      commentatorStyle: currentCommentatorStyle,
      evidenceMode: currentEvidenceMode,
      context: currentContext,
      savedAt: Date.now(),
    });
  },

  loadSavedDraft: async () => {
    return await loadDraft();
  },

  clearSavedDraft: async () => {
    await clearDraft();
  },

  restoreDraft: (draft) => {
    set({
      currentSides: draft.sides as Side[],
      currentCommentatorStyle: draft.commentatorStyle as CommentatorStyle,
      currentEvidenceMode: draft.evidenceMode as EvidenceMode,
      currentContext: draft.context,
    });
  },

  // Analysis actions
  canStartAnalysis: () => {
    const { settings, currentSides } = get();
    const hasContent = currentSides.every((side) => side.content.trim().length > 0);

    if (!hasContent) return false;

    if (settings.isPro) return true;

    return settings.analysesThisWeek < FREE_TIER_LIMITS.analysesPerWeek;
  },

  getRemainingAnalyses: () => {
    const { settings } = get();
    if (settings.isPro) return Infinity;
    return Math.max(0, FREE_TIER_LIMITS.analysesPerWeek - settings.analysesThisWeek);
  },

  startAnalysis: async () => {
    const {
      currentSides,
      currentCommentatorStyle,
      currentEvidenceMode,
      currentContext,
      settings,
    } = get();

    set({ isAnalyzing: true, analysisError: null });

    try {
      const input: AnalysisInput = {
        sides: currentSides,
        commentatorStyle: currentCommentatorStyle,
        evidenceMode: currentEvidenceMode,
        context: currentContext || undefined,
      };

      const result = await analyzeArgument(input);

      // Save to storage
      await saveAnalysis(result);

      // Update weekly count
      await get().updateSettings({
        analysesThisWeek: settings.analysesThisWeek + 1,
      });

      set({
        isAnalyzing: false,
        currentAnalysis: result,
      });

      // Refresh history
      await get().loadHistory();

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      set({
        isAnalyzing: false,
        analysisError: message,
      });
      throw error;
    }
  },

  clearCurrentAnalysis: () => set({ currentAnalysis: null, analysisError: null }),

  // History actions
  loadHistory: async () => {
    const summaries = await getAnalysisSummaries();
    set({ analysisSummaries: summaries });
  },

  selectAnalysis: (analysis) => set({ selectedAnalysis: analysis }),

  deleteAnalysis: async (id) => {
    await deleteAnalysisFromStorage(id);
    await get().loadHistory();
    const { selectedAnalysis } = get();
    if (selectedAnalysis?.id === id) {
      set({ selectedAnalysis: null });
    }
  },

  renameAnalysis: async (id, newTitle) => {
    await renameAnalysisInStorage(id, newTitle);
    await get().loadHistory();
  },

  duplicateAnalysis: async (id) => {
    await duplicateAnalysisInStorage(id);
    await get().loadHistory();
  },

  // Insights actions
  loadInsights: async () => {
    const insights = await calculateWeeklyInsights();
    set({ weeklyInsights: insights });
  },

  // Template actions
  loadAllTemplates: async () => {
    const templates = await loadTemplates();
    const summaries = await getTemplateSummaries();
    const recent = await getRecentTemplates(3);
    set({ templates, templateSummaries: summaries, recentTemplates: recent });
  },

  createTemplate: async (templateData) => {
    const template: AnalysisTemplate = {
      ...templateData,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
      lastUsedAt: 0,
      useCount: 0,
    };
    await saveTemplateToStorage(template);
    await get().loadAllTemplates();
  },

  updateTemplate: async (id, updates) => {
    await updateTemplateInStorage(id, updates);
    await get().loadAllTemplates();
  },

  deleteTemplate: async (id) => {
    await deleteTemplateFromStorage(id);
    await get().loadAllTemplates();
  },

  useTemplate: async (id) => {
    await markTemplateUsed(id);
    await get().loadAllTemplates();
  },

  applyTemplate: (template) => {
    const sides: Side[] = template.sides.map((s, i) => ({
      id: generateSideId(),
      label: s.label,
      content: '',
    }));

    set({
      currentSides: sides,
      currentCommentatorStyle: template.commentatorStyle,
      currentEvidenceMode: template.evidenceMode,
      currentContext: '',
    });
  },
}));
