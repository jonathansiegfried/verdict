// AI Service - Mock Provider with swappable architecture
// Designed to be replaced with real API (OpenAI, Claude, etc.) later
import type {
  AnalysisInput,
  AnalysisResult,
  SideAnalysis,
  PatternDetected,
} from '../types';
import type { CommentatorStyle, EvidenceMode } from '../constants/theme';

// Provider interface - implement this for real APIs
export interface AIProvider {
  analyze(input: AnalysisInput): Promise<AnalysisResult>;
}

// Prompt builder - constructs prompts for different providers
export class PromptBuilder {
  private commentatorStyle: CommentatorStyle;
  private evidenceMode: EvidenceMode;
  private outcomeMode: 'win' | 'peace' | 'both';

  constructor(
    commentatorStyle: CommentatorStyle,
    evidenceMode: EvidenceMode,
    outcomeMode: 'win' | 'peace' | 'both' = 'both'
  ) {
    this.commentatorStyle = commentatorStyle;
    this.evidenceMode = evidenceMode;
    this.outcomeMode = outcomeMode;
  }

  getSystemPrompt(): string {
    const toneInstructions = this.getToneInstructions();
    const evidenceInstructions = this.getEvidenceInstructions();

    return `You are an argument analyst. ${toneInstructions}

${evidenceInstructions}

Analyze the provided argument/discussion and:
1. Summarize each side's position
2. Identify claims, evidence, emotional vs logical statements
3. Score each side on: clarity, evidence quality, logical consistency, emotional escalation, fairness
4. Provide a verdict with reasoning
5. Suggest what would change the outcome
6. Identify communication patterns or logical fallacies

Keep analysis balanced and constructive. Avoid medical/psychological diagnoses.`;
  }

  private getToneInstructions(): string {
    const tones: Record<CommentatorStyle, string> = {
      neutral: 'Be balanced and impartial in your analysis.',
      direct: 'Be straightforward and no-nonsense. State facts plainly without softening.',
      harsh: 'Be brutally honest and critical. Point out flaws directly.',
      savage: 'Be witty and cutting in your observations, but keep it clever rather than mean.',
      coach: 'Be supportive but firm. Frame feedback constructively while being honest.',
      lawyer: 'Be precise and analytical. Focus on logical structure and evidence.',
      mediator: 'Focus on finding common ground and paths to resolution.',
    };
    return tones[this.commentatorStyle];
  }

  private getEvidenceInstructions(): string {
    if (this.evidenceMode === 'strict') {
      return 'STRICT MODE: Flag every unverified claim and assumption. Note when evidence is missing or weak. Be rigorous about what counts as evidence.';
    }
    return 'LIGHT MODE: Accept reasonable assumptions. Focus on major evidentiary gaps only.';
  }

  buildAnalysisPrompt(input: AnalysisInput): string {
    const sidesText = input.sides
      .map((s, i) => `[${s.label}]: ${s.content}`)
      .join('\n\n');

    let prompt = `Analyze this argument:\n\n${sidesText}`;

    if (input.context) {
      prompt += `\n\nContext: ${input.context}`;
    }

    return prompt;
  }
}

// Generate unique ID
function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Mock data generators
function generateMockSideAnalysis(
  sideId: string,
  label: string,
  content: string,
  isStrictMode: boolean,
  styleModifier: number
): SideAnalysis {
  // Extract some mock claims from content
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const claims = sentences.slice(0, Math.min(3, sentences.length)).map((s) => s.trim());

  // Generate scores with some variance
  const baseScore = 5 + Math.random() * 4;
  const variance = () => Math.max(0, Math.min(10, baseScore + (Math.random() - 0.5) * 3));

  const analysis: SideAnalysis = {
    sideId,
    label,
    summary: `${label} argues ${claims[0]?.toLowerCase() || 'their position'}.`,
    claims: claims.length > 0 ? claims : ['Position stated without specific claims'],
    evidenceProvided: [
      content.length > 100 ? 'Provides detailed context' : 'Limited supporting details',
    ],
    emotionalStatements: content.includes('!')
      ? ['Uses emphatic language']
      : [],
    logicalStatements: claims.length > 1
      ? ['Presents multiple points']
      : [],
    scores: {
      clarity: Math.round(variance() * 10) / 10,
      evidenceQuality: Math.round((variance() - 1) * 10) / 10,
      logicalConsistency: Math.round(variance() * 10) / 10,
      emotionalEscalation: Math.round((content.includes('!') ? 6 + Math.random() * 3 : 3 + Math.random() * 3) * 10) / 10,
      fairness: Math.round(variance() * 10) / 10,
    },
  };

  if (isStrictMode) {
    analysis.flaggedAssumptions = [
      'Assumes reader understands full context',
      'No cited sources provided',
    ];
  }

  return analysis;
}

function generateMockPatterns(sides: SideAnalysis[]): PatternDetected[] {
  const patterns: PatternDetected[] = [];

  // Check for potential patterns
  const hasEmotional = sides.some((s) => s.scores.emotionalEscalation > 6);
  if (hasEmotional) {
    patterns.push({
      name: 'Emotional Escalation',
      description: 'Strong emotional language that may overshadow logical points',
      occurrences: sides
        .filter((s) => s.scores.emotionalEscalation > 6)
        .map((s) => ({ sideId: s.sideId })),
    });
  }

  const hasLowEvidence = sides.some((s) => s.scores.evidenceQuality < 5);
  if (hasLowEvidence) {
    patterns.push({
      name: 'Appeal Without Evidence',
      description: 'Claims made without supporting evidence or examples',
      occurrences: sides
        .filter((s) => s.scores.evidenceQuality < 5)
        .map((s) => ({ sideId: s.sideId })),
    });
  }

  return patterns;
}

function getCommentatorTonedText(
  style: CommentatorStyle,
  baseText: string
): string {
  const prefixes: Record<CommentatorStyle, string> = {
    neutral: '',
    direct: 'Bottom line: ',
    harsh: 'Let\'s be real here: ',
    savage: 'Oh, this is interesting: ',
    coach: 'Here\'s what I see: ',
    lawyer: 'Upon examination: ',
    mediator: 'Looking at both perspectives: ',
  };
  return prefixes[style] + baseText;
}

// Mock AI Provider
export class MockAIProvider implements AIProvider {
  private simulatedDelay: number;

  constructor(simulatedDelay = 2000) {
    this.simulatedDelay = simulatedDelay;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, this.simulatedDelay));

    const isStrictMode = input.evidenceMode === 'strict';
    const styleModifier = ['harsh', 'savage'].includes(input.commentatorStyle) ? -0.5 : 0;

    // Generate side analyses
    const sideAnalyses = input.sides.map((side) =>
      generateMockSideAnalysis(
        side.id,
        side.label,
        side.content,
        isStrictMode,
        styleModifier
      )
    );

    // Calculate overall scores
    const avgScores = sideAnalyses.reduce(
      (acc, s) => ({
        clarity: acc.clarity + s.scores.clarity,
        evidence: acc.evidence + s.scores.evidenceQuality,
        logic: acc.logic + s.scores.logicalConsistency,
      }),
      { clarity: 0, evidence: 0, logic: 0 }
    );

    // Determine winner (highest combined score)
    const sideScores = sideAnalyses.map((s) => ({
      sideId: s.sideId,
      label: s.label,
      total:
        s.scores.clarity +
        s.scores.evidenceQuality +
        s.scores.logicalConsistency +
        s.scores.fairness -
        s.scores.emotionalEscalation * 0.5,
    }));

    sideScores.sort((a, b) => b.total - a.total);
    const winner = sideScores[0];
    const scoreDiff = sideScores.length > 1 ? sideScores[0].total - sideScores[1].total : 0;
    const isClear = scoreDiff > 3;

    // Generate verdict
    const verdictBase = isClear
      ? `${winner.label} presents a stronger case overall.`
      : `This is a close call with valid points on both sides.`;

    const verdictHeadline = getCommentatorTonedText(input.commentatorStyle, verdictBase);

    const patterns = generateMockPatterns(sideAnalyses);

    // Generate tags
    const tags: string[] = [];
    if (patterns.some((p) => p.name === 'Emotional Escalation')) {
      tags.push('emotional');
    }
    if (input.sides.length > 2) {
      tags.push('multi-party');
    }
    if (isStrictMode) {
      tags.push('strict-mode');
    }
    tags.push(input.commentatorStyle);

    const result: AnalysisResult = {
      id: generateId(),
      createdAt: Date.now(),
      input,
      sideAnalyses,
      verdictHeadline,
      verdictExplanation: `Based on analysis of clarity, evidence quality, logical consistency, and communication style, ${verdictBase.toLowerCase()} Each side has room for improvement in presenting their case more effectively.`,
      winAnalysis: {
        winnerId: isClear ? winner.sideId : null,
        winnerLabel: isClear ? winner.label : null,
        confidence: isClear ? Math.round(60 + scoreDiff * 5) : Math.round(45 + Math.random() * 10),
        reasoning: isClear
          ? `${winner.label} scored higher in clarity and evidence presentation.`
          : 'Both sides present roughly equivalent arguments with different strengths.',
      },
      peaceAnalysis: {
        commonGround: [
          'Both parties care about the outcome',
          'There is willingness to discuss',
        ],
        suggestedCompromise:
          'Consider focusing on shared goals rather than individual positions.',
        stepsForward: [
          'Acknowledge each other\'s valid points',
          'Focus on facts over emotions',
          'Seek to understand before being understood',
        ],
      },
      outcomeChangers: [
        'Providing specific evidence would strengthen any position',
        'Reducing emotional language would improve persuasiveness',
        'Addressing the other side\'s main concerns directly',
      ],
      patternsDetected: patterns,
      tags,
    };

    return result;
  }
}

// Export default provider instance
export const aiProvider = new MockAIProvider();

// Analysis function using the default provider
export async function analyzeArgument(input: AnalysisInput): Promise<AnalysisResult> {
  return aiProvider.analyze(input);
}
