/**
 * AI Analysis API Client
 * Handles all AI-related API requests
 */

import { apiClient } from './client';
import {
  AIAnalysisRequest,
  AITaskCreationResponse,
  AITaskStatusResponse,
  AIAnalysisResultResponse,
  AIHistoryResponse,
  AIStatsResponse,
} from '../types/ai.types';

export const aiApi = {
  /**
   * Create AI analysis task
   * POST /api/v1/ai/analysis/:reportId
   */
  async createAnalysis(
    reportId: number,
    options?: AIAnalysisRequest
  ): Promise<AITaskCreationResponse> {
    const response = await apiClient.post<{ success: boolean; data: AITaskCreationResponse }>(
      `/ai/analysis/${reportId}`,
      options || {}
    );
    return response.data;
  },

  /**
   * Get analysis task status
   * GET /api/v1/ai/analysis/status/:taskId
   */
  async getAnalysisStatus(taskId: string): Promise<AITaskStatusResponse> {
    const response = await apiClient.get<{ success: boolean; data: AITaskStatusResponse }>(
      `/ai/analysis/status/${taskId}`
    );
    return response.data;
  },

  /**
   * Get AI analysis result
   * GET /api/v1/ai/result/:reportId
   */
  async getAnalysisResult(reportId: number): Promise<AIAnalysisResultResponse> {
    const response = await apiClient.get<{ success: boolean; data: AIAnalysisResultResponse }>(
      `/ai/result/${reportId}`
    );
    return response.data;
  },

  /**
   * Get user's analysis history
   * GET /api/v1/ai/history
   */
  async getHistory(page = 1, limit = 10): Promise<AIHistoryResponse> {
    const response = await apiClient.get<{ success: boolean; data: AIHistoryResponse }>(
      `/ai/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get AI usage statistics
   * GET /api/v1/ai/stats
   */
  async getStats(): Promise<AIStatsResponse> {
    const response = await apiClient.get<{ success: boolean; data: AIStatsResponse }>(
      '/ai/stats'
    );
    return response.data;
  },

  /**
   * Check AI service health
   * GET /api/v1/ai/health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get<{ success: boolean; data: { status: string; timestamp: string } }>(
      '/ai/health'
    );
    return response.data;
  },

  /**
   * Poll analysis status until completion or failure
   * @param taskId Task ID to poll
   * @param onUpdate Callback function called with each status update
   * @param interval Polling interval in milliseconds (default: 2000)
   * @param timeout Maximum polling time in milliseconds (default: 120000 = 2 minutes)
   */
  async pollAnalysisStatus(
    taskId: string,
    onUpdate: (status: AITaskStatusResponse) => void,
    interval = 2000,
    timeout = 120000
  ): Promise<AITaskStatusResponse> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const pollTimer = setInterval(async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            clearInterval(pollTimer);
            reject(new Error('Polling timeout'));
            return;
          }

          // Get status
          const status = await this.getAnalysisStatus(taskId);
          onUpdate(status);

          // Check if completed or failed
          if (status.status === 'completed') {
            clearInterval(pollTimer);
            resolve(status);
          } else if (status.status === 'failed') {
            clearInterval(pollTimer);
            reject(new Error(status.error || 'Analysis failed'));
          }
        } catch (error) {
          clearInterval(pollTimer);
          reject(error);
        }
      }, interval);
    });
  },
};
