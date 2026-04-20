/**
 * AI Configuration Types
 * Defines type structures for AI service configuration
 */

import { AIConfig } from '../../../config/ai.config';

/**
 * AI Provider types
 */
export type AIProvider = 'zhipu' | 'openai';

/**
 * AI Analysis types
 */
export enum AnalysisType {
  COMPREHENSIVE = 'comprehensive',    // Full personality analysis
  CAREER = 'career',                  // Career-focused analysis
  RELATIONSHIP = 'relationship',      // Relationship-focused analysis
  GROWTH = 'growth',                  // Growth planning analysis
}

/**
 * AI Task Status
 */
export enum AITaskStatus {
  PENDING = 'pending',        // Created, waiting to process
  PROCESSING = 'processing',  // AI is generating content
  COMPLETED = 'completed',    // Successfully completed
  FAILED = 'failed',          // Failed with error
}

/**
 * AI Analysis Request Options
 */
export interface AnalysisRequestOptions {
  analysisType?: AnalysisType;
  userContext?: UserContext;
  forceRegenerate?: boolean;  // Force regeneration even if cached
}

/**
 * User Context for AI Analysis
 */
export interface UserContext {
  age?: number;
  occupation?: string;
  education?: string;
  goals?: string[];
  challenges?: string[];
  preferences?: Record<string, any>;
}

/**
 * AI Analysis Input Data
 */
export interface AnalysisInputData {
  mbtiType: string;           // 4-letter MBTI type (e.g., "INTJ")
  dimensionScores: {
    EI: number;               // Extroversion vs Introversion score
    SN: number;               // Sensing vs Intuition score
    TF: number;               // Thinking vs Feeling score
    JP: number;               // Judging vs Perceiving score
  };
  percentages: {
    EI: number;               // Percentage for each dimension
    SN: number;
    TF: number;
    JP: number;
  };
  answerSummary: string;      // Summary of answer patterns
  answerCount: number;        // Total answers (should be 60)
  completedAt: string;        // ISO timestamp
  userContext?: any;          // Optional user context data
}

/**
 * AI Analysis Content Structure
 */
export interface AnalysisContent {
  overview: {
    title: string;
    summary: string;
    keyPoints: string[];
  };
  strengths: {
    items: Array<{
      name: string;
      description: string;
      examples?: string[];
    }>;
    application: string[];
  };
  weaknesses: {
    items: Array<{
      name: string;
      description: string;
    }>;
    improvementStrategies: string[];
  };
  career: {
    bestMatches: Array<{
      role: string;
      reason: string;
      score: number;
    }>;
    developmentPaths: string[];
    recommendations: string[];
  };
  relationships: {
    style: string;
    strengthsInRelationships: string[];
    challenges: string[];
    advice: string[];
  };
  growth: {
    shortTerm: string[];
    longTerm: string[];
    habits: Array<{
      name: string;
      frequency: string;
      description: string;
    }>;
  };
  actionPlan: {
    immediate: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      timeline: string;
    }>;
    ongoing: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      timeline: string;
    }>;
  };
}

/**
 * AI Analysis Result
 */
export interface AIAnalysisResult {
  taskId: string;
  reportId: number;
  analysisType: AnalysisType;
  status: AITaskStatus;
  progress?: number;          // 0-100, only when processing
  content?: AnalysisContent;
  error?: string;
  metadata: {
    model: string;
    modelVersion?: string;
    generatedAt?: string;
    tokensUsed?: number;
    costInCents?: number;
    processingTime?: number;  // milliseconds
  };
}

/**
 * AI Task Creation Response
 */
export interface AITaskCreationResponse {
  taskId: string;
  reportId: number;
  status: AITaskStatus;
  estimatedTime: number;      // seconds
  createdAt: string;
}

/**
 * AI Task Status Response
 */
export interface AITaskStatusResponse {
  taskId: string;
  status: AITaskStatus;
  progress?: number;
  stage?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

/**
 * AI Message (OpenAI format)
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI Chat Request Options
 */
export interface AIChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  timeout?: number;
}

/**
 * AI Chat Response
 */
export interface AIChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter';
}

/**
 * AI Error Types
 */
export enum AIErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * AI Error
 */
export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * AI Prompt Template
 */
export interface AIPromptTemplate {
  systemRole: string;
  context: string;
  task: string;
  inputData: any;
  outputFormat: string;
  constraints: string[];
}

/**
 * AI Cache Key
 */
export interface AICacheKey {
  mbtiType: string;
  analysisType: AnalysisType;
  dimensionScores: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
}

/**
 * AI Usage Statistics
 */
export interface AIUsageStats {
  date: string;               // YYYY-MM-DD
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  totalTokens: number;
  estimatedCost: number;      // in CNY (cents)
  averageResponseTime: number; // milliseconds
}
