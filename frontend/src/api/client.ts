import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Prioritize JWT auth token over session token
        const authToken = localStorage.getItem('auth_token');
        const sessionToken = localStorage.getItem('mbti_session_token');
        const token = authToken || sessionToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response) {
          const { status, data } = error.response;

          // Handle session expiration
          if (status === 401 || data.code === 10002) {
            localStorage.removeItem('mbti_session_token');
            localStorage.removeItem('mbti_test_session');
            window.location.href = '/';
          }

          // Handle rate limiting
          if (status === 429) {
            console.warn('Rate limit exceeded');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<any, AxiosResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<any, AxiosResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<any, AxiosResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<any, AxiosResponse<T>>(url, config);
    return response.data;
  }

  setSessionToken(token: string) {
    localStorage.setItem('mbti_session_token', token);
  }

  clearSessionToken() {
    localStorage.removeItem('mbti_session_token');
  }
}

export const apiClient = new ApiClient();
