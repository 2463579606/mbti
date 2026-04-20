/**
 * AI Analysis Types
 * Type definitions for AI analysis functionality
 */

export interface AIAnalysisRequest {
  analysisType?: 'comprehensive' | 'career' | 'relationship' | 'growth';
  userContext?: {
    age?: number;
    occupation?: string;
    education?: string;
    goals?: string[];
    challenges?: string[];
  };
  forceRegenerate?: boolean;
}

export interface AITaskCreationResponse {
  taskId: string;
  reportId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime: number; // seconds
  createdAt: string;
}

export interface AITaskStatusResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  stage?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface AIAnalysisResult {
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

export interface AIAnalysisResultResponse {
  reportId: number;
  analysisId: number;
  analysisType: string;
  content: AIAnalysisResult;
  metadata: {
    model: string;
    modelVersion?: string;
    generatedAt?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
  };
}

export interface AIHistoryResponse {
  total: number;
  analyses: Array<{
    analysisId: number;
    reportId: number;
    type: string;
    status: string;
    createdAt: string;
    completedAt?: string;
  }>;
}

export interface AIStatsResponse {
  totalAnalyses: number;
  completedAnalyses: number;
  totalTokensUsed: number;
  estimatedCost: number; // 0 for coding plan users
}
