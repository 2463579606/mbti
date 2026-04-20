/**
 * Admin API
 * Handles admin dashboard operations
 */

import { apiClient } from './client';

export interface GlobalStatistics {
  summary: {
    totalTests: number;
    uniqueUsers: number;
    completionRate: number;
    avgDuration: number;
  };
  typeDistribution: Array<{
    code: string;
    count: number;
    percentage: number;
  }>;
  dimensionStats: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
}

export interface DailyStatistics {
  date: string;
  testCount: number;
  completeCount: number;
  uniqueUsers: number;
  avgDuration: number;
  typeDistribution: Record<string, number>;
}

export interface QuestionStatistics {
  total: number;
  active: number;
  inactive: number;
  byDimension: Record<string, number>;
}

export interface AdminQuestion {
  id: number;
  dimension: string;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  scoreA: number;
  scoreB: number;
  isActive: boolean;
  statistics?: {
    totalAnswers: number;
    optionAProbability: number;
    optionBProbability: number;
  };
}

export interface UpdateQuestionDto {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  scoreA?: number;
  scoreB?: number;
  isActive?: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
  totalTests: number;
  lastTestAt: string | null;
  status: string;
  createdAt: string;
}

export interface TestSession {
  sessionId: string;
  userId?: number;
  status: string;
  currentQuestion: number;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: string;
}

/**
 * Admin API
 */
export const adminApi = {
  /**
   * Get global statistics
   */
  async getGlobalStatistics(range: '1d' | '7d' | '30d' | 'all' = 'all'): Promise<GlobalStatistics> {
    const { data } = await apiClient.get<GlobalStatistics>('/admin/statistics', {
      params: { range },
    });
    return data;
  },

  /**
   * Get daily statistics
   */
  async getDailyStatistics(date?: string): Promise<DailyStatistics> {
    const { data } = await apiClient.get<DailyStatistics>('/admin/statistics/daily', {
      params: { date },
    });
    return data;
  },

  /**
   * Get all questions (admin)
   */
  async getAllQuestions(): Promise<QuestionStatistics & { questions: AdminQuestion[] }> {
    const { data } = await apiClient.get<any>('/admin/questions');
    return data;
  },

  /**
   * Get question by ID (admin)
   */
  async getQuestionById(id: number): Promise<AdminQuestion> {
    const { data } = await apiClient.get<AdminQuestion>(`/admin/questions/${id}`);
    return data;
  },

  /**
   * Update question (admin)
   */
  async updateQuestion(id: number, dto: UpdateQuestionDto): Promise<AdminQuestion> {
    const { data } = await apiClient.put<AdminQuestion>(`/admin/questions/${id}`, dto);
    return data;
  },

  /**
   * Get all users (admin)
   */
  async getAllUsers(page = 1, limit = 20, status?: string): Promise<{
    total: number;
    page: number;
    limit: number;
    users: AdminUser[];
  }> {
    const { data } = await apiClient.get('/admin/users', {
      params: { page, limit, status },
    });
    return data;
  },

  /**
   * Update user status (admin)
   */
  async updateUserStatus(id: number, status: string): Promise<void> {
    await apiClient.put(`/admin/users/${id}/status`, { status });
  },

  /**
   * Get recent test sessions (admin)
   */
  async getRecentSessions(limit = 50): Promise<{
    total: number;
    sessions: TestSession[];
  }> {
    const { data } = await apiClient.get('/admin/sessions', {
      params: { limit },
    });
    return data;
  },

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await apiClient.post('/admin/cache/clear');
  },

  /**
   * Get system health
   */
  async getHealth(): Promise<SystemHealth> {
    const { data } = await apiClient.get<SystemHealth>('/admin/health');
    return data;
  },
};
