/**
 * Test Answer Entity
 */

export class TestAnswer {
  id: number;
  sessionId: number;
  userId: number | null;

  // Question info
  questionId: number;
  dimension: string;

  // Answer info
  selectedOption: number; // 0 or 1
  score: number; // 0 or 2

  // Timestamp
  answeredAt: Date;

  constructor(props?: Partial<TestAnswer>) {
    if (props) {
      this.id = props.id || 0;
      this.sessionId = props.sessionId;
      this.userId = props.userId || null;
      this.questionId = props.questionId;
      this.dimension = props.dimension;
      this.selectedOption = props.selectedOption;
      this.score = props.score;
      this.answeredAt = props.answeredAt || new Date();
    }
  }
}

export type CreateAnswerDto = {
  sessionId: number;
  userId?: number;
  questionId: number;
  dimension: string;
  selectedOption: number;
  score: number;
};

/**
 * Question Entity
 */

export class Question {
  id: number;
  questionId: number; // 0-59
  dimension: string; // EI, SN, TF, JP
  dimensionOrder: number; // 1-15

  // Content
  questionText: string;
  optionA: string;
  optionB: string;
  scoreA: number;
  scoreB: number;

  // Status
  isActive: boolean;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(props?: Partial<Question>) {
    if (props) {
      this.id = props.id || 0;
      this.questionId = props.questionId;
      this.dimension = props.dimension;
      this.dimensionOrder = props.dimensionOrder;
      this.questionText = props.questionText;
      this.optionA = props.optionA;
      this.optionB = props.optionB;
      this.scoreA = props.scoreA;
      this.scoreB = props.scoreB;
      this.isActive = props.isActive !== undefined ? props.isActive : true;
      this.version = props.version || 1;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }

  // Helper to get options as array
  getOptions(): string[] {
    return [this.optionA, this.optionB];
  }

  // Helper to get scores as array
  getScores(): number[] {
    return [this.scoreA, this.scoreB];
  }

  // Helper to get score for selected option
  getScoreForOption(option: number): number {
    return option === 0 ? this.scoreA : this.scoreB;
  }
}

export type UpdateQuestionDto = {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  scoreA?: number;
  scoreB?: number;
  isActive?: boolean;
};

/**
 * MBTI Type Entity
 */

export interface MBTIType {
  code: string; // 4-letter code: INFJ, INTP, etc.
  name: string; // Chinese name: 提倡者
  emoji: string; // Icon emoji
  groupName: string; // 分组: 分析家/外交家/哨兵/探险家

  // Descriptions
  headline: string; // One-line description
  tagline: string; // Detailed description

  // Arrays (stored as JSONB)
  strengths: string[];
  weaknesses: string[];
  bestMatch: string[];
  challengingMatch: string[];
  careers: string[];
  famousPeople: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type MBTITypeCode =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

/**
 * Test Report Entity
 */

export class TestReport {
  id: number;
  sessionId: number;
  userId: number | null;

  // Results
  mbtiType: string;

  // Dimension scores (percentages)
  eiScore: number; // 0-100, E tendency
  snScore: number; // 0-100, S tendency
  tfScore: number; // 0-100, T tendency
  jpScore: number; // 0-100, J tendency

  // Detailed data (JSON)
  dimensionDetails: Record<string, any>;
  personalityAnalysis: Record<string, any> | null;

  // Sharing
  shareToken: string | null;
  shareCount: number;

  // Timestamp
  createdAt: Date;

  constructor(props?: Partial<TestReport>) {
    if (props) {
      this.id = props.id || 0;
      this.sessionId = props.sessionId;
      this.userId = props.userId || null;
      this.mbtiType = props.mbtiType;
      this.eiScore = props.eiScore;
      this.snScore = props.snScore;
      this.tfScore = props.tfScore;
      this.jpScore = props.jpScore;
      this.dimensionDetails = props.dimensionDetails || {};
      this.personalityAnalysis = props.personalityAnalysis || null;
      this.shareToken = props.shareToken || null;
      this.shareCount = props.shareCount || 0;
      this.createdAt = props.createdAt || new Date();
    }
  }
}

export type DimensionScore = {
  key: string; // EI, SN, TF, JP
  left: string; // "外向 (E)"
  right: string; // "内向 (I)"
  percentage: number; // 0-100
  leftPercentage: number; // 0-100
  rightPercentage: number; // 0-100
  description: string; // "外向倾向 80%"
};

export type ReportDetail = {
  reportId: number;
  sessionId: number;
  mbtiType: MBTIType;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
  compatibility: {
    best: MBTIType[];
    challenging: MBTIType[];
  };
  careers: string[];
  famousPeople: string[];
  testInfo: {
    startedAt: Date;
    completedAt: Date;
    durationSeconds: number;
    durationFormatted: string;
  };
  share: {
    token: string;
    url: string;
  };
}
