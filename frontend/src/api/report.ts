import { apiClient } from './client';

// Types
export interface MBTIType {
  code: string;
  name: string;
  emoji: string;
  group: string;
  headline: string;
  tagline: string;
}

export interface DimensionScore {
  key: string;
  left: string;
  right: string;
  percentage: number;
  leftPercentage: number;
  rightPercentage: number;
  description: string;
}

export interface TestReport {
  reportId: number;
  sessionId: number;
  mbtiType: MBTIType;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
  compatibility: {
    best: Array<{ code: string; name: string; emoji: string }>;
    challenging: Array<{ code: string; name: string; emoji: string }>;
  };
  careers: string[];
  famousPeople: string[];
  testInfo: {
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    durationFormatted: string;
  };
  share: {
    token: string;
    url: string;
  };
}

export interface SharedReport {
  mbtiType: MBTIType;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
  compatibility: {
    best: Array<{ code: string; name: string; emoji: string }>;
    challenging: Array<{ code: string; name: string; emoji: string }>;
  };
  careers: string[];
  famousPeople: string[];
}

// API Functions
export const reportApi = {
  /**
   * Get test report by ID
   */
  async getReport(reportId: number): Promise<TestReport> {
    const response = await apiClient.get<{ success: boolean; data: TestReport }>(
      `/report/${reportId}`
    );
    return response.data;
  },

  /**
   * Get shared report by token (public, no auth required)
   */
  async getSharedReport(shareToken: string): Promise<SharedReport> {
    const response = await apiClient.get<{ success: boolean; data: SharedReport }>(
      `/report/share/${shareToken}`
    );
    return response.data;
  },
};
