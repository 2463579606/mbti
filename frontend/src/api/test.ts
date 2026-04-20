import { apiClient } from './client';

// Types
export interface Question {
  id: number;
  dimension: string;
  dimensionLabel: string;
  dimensionOrder: number;
  question: string;
  options: string[];
  optionLabels: string[];
}

export interface TestSession {
  sessionId: number;
  sessionToken: string;
  totalQuestions: number;
  expiresAt: string;
}

export interface CurrentQuestion {
  questionNumber: number;
  id: number;
  dimension: string;
  dimensionLabel: string;
  dimensionOrder: number;
  question: string;
  options: string[];
  optionLabels: string[];
  progress: {
    current: number;
    total: number;
    percentage: number;
    answered: number;
  };
}

export interface AnswerResponse {
  answered: boolean;
  questionId: number;
  selectedOption: number;
  score: number;
  nextQuestion: number;
  isComplete: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface TestProgress {
  currentQuestion: number;
  answeredCount: number;
  total: number;
  percentage: number;
  dimensionProgress: {
    [key: string]: {
      dimension: string;
      label: string;
      answered: number;
      total: number;
      isComplete: boolean;
    };
  };
}

export interface CompleteResponse {
  sessionId: number;
  reportId: number;
  mbtiType: string;
  shareToken: string;
  reportUrl: string;
}

// API Functions
export const testApi = {
  /**
   * Create a new test session
   */
  async createSession(userId?: number, anonymousId?: string): Promise<TestSession> {
    const response = await apiClient.post<{ success: boolean; data: TestSession }>(
      '/test/session',
      { userId, anonymousId }
    );

    if (response.data.sessionToken) {
      apiClient.setSessionToken(response.data.sessionToken);
    }

    return response.data;
  },

  /**
   * Get list of questions
   */
  async getQuestions(start = 0, count = 10): Promise<{ total: number; questions: Question[] }> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/test/questions?start=${start}&count=${count}`
    );
    return response.data;
  },

  /**
   * Get current question
   */
  async getCurrentQuestion(): Promise<CurrentQuestion> {
    const response = await apiClient.get<{ success: boolean; data: CurrentQuestion }>(
      '/test/question/current'
    );
    return response.data;
  },

  /**
   * Submit single answer
   */
  async submitAnswer(questionId: number, selectedOption: number): Promise<AnswerResponse> {
    const response = await apiClient.post<{ success: boolean; data: AnswerResponse }>(
      '/test/answer',
      { questionId, selectedOption }
    );
    return response.data;
  },

  /**
   * Submit multiple answers (for resume functionality)
   */
  async submitAnswers(answers: Array<{ questionId: number; option: number }>) {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/test/answers/batch',
      { answers }
    );
    return response.data;
  },

  /**
   * Get test progress
   */
  async getProgress(): Promise<TestProgress> {
    const response = await apiClient.get<{ success: boolean; data: TestProgress }>(
      '/test/progress'
    );
    return response.data;
  },

  /**
   * Complete test and generate report
   */
  async completeTest(): Promise<CompleteResponse> {
    const response = await apiClient.post<{ success: boolean; data: CompleteResponse }>(
      '/test/complete'
    );
    return response.data;
  },
};
