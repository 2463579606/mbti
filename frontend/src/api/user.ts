/**
 * User API
 * Handles user authentication and profile operations
 */

import { apiClient } from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  nickname?: string;
  password: string;
}

export interface UpdateProfileDto {
  nickname?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface User {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
  totalTests: number;
  lastTestAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TestHistoryItem {
  sessionId: string;
  reportId: number;
  completedAt: string;
  durationSeconds: number;
  mbtiType: {
    code: string;
    name: string;
    emoji: string;
  };
}

export interface UserStatistics {
  totalTests: number;
  mostCommonType: {
    code: string;
    name: string;
  } | null;
  typeDistribution: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  avgDuration: number;
  lastTestAt: string | null;
}

/**
 * User API
 */
export const userApi = {
  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', dto);
    return data;
  },

  /**
   * Login
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', dto);
    return data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(token?: string): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data;
  },

  /**
   * Update profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<User> {
    const { data } = await apiClient.put<User>('/auth/profile', dto);
    return data;
  },

  /**
   * Change password
   */
  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await apiClient.post('/auth/change-password', dto);
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get test history
   */
  async getTestHistory(page = 1, limit = 10): Promise<{
    total: number;
    page: number;
    limit: number;
    tests: TestHistoryItem[];
  }> {
    const { data } = await apiClient.get('/user/tests', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    const { data } = await apiClient.get<UserStatistics>('/user/statistics');
    return data;
  },
};
