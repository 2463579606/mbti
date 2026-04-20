/**
 * User Store
 * Manages user authentication state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi, type User, type LoginDto, type RegisterDto, type UpdateProfileDto } from '../api/user';

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const loading = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const currentUser = computed(() => user.value);

  /**
   * Initialize user from token
   */
  async function initialize() {
    if (token.value) {
      try {
        user.value = await userApi.getCurrentUser(token.value);
      } catch (error) {
        // Token is invalid, clear it
        token.value = null;
        user.value = null;
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Register new user
   */
  async function register(dto: RegisterDto) {
    loading.value = true;
    try {
      const response = await userApi.register(dto);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('auth_token', response.token);
      return response;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Login
   */
  async function login(dto: LoginDto) {
    loading.value = true;
    try {
      const response = await userApi.login(dto);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('auth_token', response.token);
      return response;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update profile
   */
  async function updateProfile(dto: UpdateProfileDto) {
    loading.value = true;
    try {
      const updatedUser = await userApi.updateProfile(dto);
      user.value = updatedUser;
      return updatedUser;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Change password
   */
  async function changePassword(oldPassword: string, newPassword: string) {
    loading.value = true;
    try {
      await userApi.changePassword({ oldPassword, newPassword });
    } finally {
      loading.value = false;
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await userApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Clear user state
   */
  function clear() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  return {
    // State
    user,
    token,
    loading,

    // Computed
    isAuthenticated,
    currentUser,

    // Actions
    initialize,
    register,
    login,
    updateProfile,
    changePassword,
    logout,
    clear,
  };
});
