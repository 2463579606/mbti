/**
 * AI Analysis Store
 * Manages AI analysis state using Pinia
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  AITaskStatusResponse,
  AIAnalysisResultResponse,
  AIHistoryResponse,
} from '../types/ai.types';
import { aiApi } from '../api/ai';

export const useAIStore = defineStore('ai', () => {
  // State
  const taskId = ref<string | null>(null);
  const taskStatus = ref<AITaskStatusResponse | null>(null);
  const analysisResult = ref<AIAnalysisResultResponse | null>(null);
  const isGenerating = ref<boolean>(false);
  const error = ref<string | null>(null);
  const history = ref<AIHistoryResponse | null>(null);
  const stats = ref<any>(null);

  // Polling timer
  let pollTimer: NodeJS.Timeout | null = null;

  // Computed
  const status = computed(() => taskStatus.value?.status || 'idle');
  const progress = computed(() => taskStatus.value?.progress || 0);
  const stage = computed(() => taskStatus.value?.stage || '');
  const hasAnalysis = computed(() => !!analysisResult.value);
  const hasError = computed(() => !!error.value);

  // Actions
  async function requestAnalysis(reportId: number, options?: any) {
    try {
      // Reset state
      reset();

      // Create task
      const result = await aiApi.createAnalysis(reportId, options);
      taskId.value = result.taskId;
      isGenerating.value = true;

      console.log('✅ AI analysis task created:', result.taskId);

      // Start polling
      startPolling(result.taskId);

      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to create analysis';
      console.error('❌ Failed to create analysis:', err);
      throw err;
    }
  }

  async function refreshStatus() {
    if (!taskId.value) return;

    try {
      const status = await aiApi.getAnalysisStatus(taskId.value);
      taskStatus.value = status;

      if (status.status === 'completed') {
        // Stop polling and load result
        stopPolling();
        await loadAnalysisResult();
      } else if (status.status === 'failed') {
        stopPolling();
        error.value = status.error || 'Analysis failed';
        isGenerating.value = false;
      }
    } catch (err: any) {
      console.error('❌ Failed to refresh status:', err);
    }
  }

  async function loadAnalysisResult() {
    if (!taskId.value) return;

    try {
      // Load result using the report ID from task
      const task = taskStatus.value;
      if (!task) return;

      const result = await aiApi.getAnalysisResult(parseInt(task.taskId, 10));
      analysisResult.value = result;
      isGenerating.value = false;

      console.log('✅ AI analysis loaded:', result.analysisId);
    } catch (err: any) {
      error.value = err.message || 'Failed to load result';
      console.error('❌ Failed to load result:', err);
      throw err;
    }
  }

  function startPolling(taskIdToPoll: string) {
    if (pollTimer) {
      clearInterval(pollTimer);
    }

    pollTimer = setInterval(async () => {
      await refreshStatus();
    }, 2000); // Poll every 2 seconds
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
      console.log('⏸️  Polling stopped');
    }
  }

  async function loadHistory(page = 1, limit = 10) {
    try {
      const result = await aiApi.getHistory(page, limit);
      history.value = result;
    } catch (err: any) {
      console.error('❌ Failed to load history:', err);
    }
  }

  async function loadStats() {
    try {
      const result = await aiApi.getStats();
      stats.value = result;
    } catch (err: any) {
      console.error('❌ Failed to load stats:', err);
    }
  }

  function reset() {
    taskId.value = null;
    taskStatus.value = null;
    analysisResult.value = null;
    isGenerating.value = false;
    error.value = null;
    stopPolling();
  }

  function clearError() {
    error.value = null;
  }

  // Save to localStorage
  function saveToLocalStorage() {
    if (taskId.value) {
      localStorage.setItem('ai_task_id', taskId.value);
    }
    if (taskStatus.value) {
      localStorage.setItem('ai_task_status', JSON.stringify(taskStatus.value));
    }
  }

  // Load from localStorage
  function loadFromLocalStorage() {
    const savedTaskId = localStorage.getItem('ai_task_id');
    const savedStatus = localStorage.getItem('ai_task_status');

    if (savedTaskId) {
      taskId.value = savedTaskId;
    }

    if (savedStatus) {
      try {
        taskStatus.value = JSON.parse(savedStatus);
        // If task was processing, check current status
        if (taskStatus.value?.status === 'processing') {
          refreshStatus();
        }
      } catch (error) {
        console.error('Failed to load task status:', error);
      }
    }
  }

  // Initialize from localStorage
  loadFromLocalStorage();

  return {
    // State
    taskId,
    taskStatus,
    analysisResult,
    isGenerating,
    error,
    history,
    stats,

    // Computed
    status,
    progress,
    stage,
    hasAnalysis,
    hasError,

    // Actions
    requestAnalysis,
    refreshStatus,
    loadAnalysisResult,
    loadHistory,
    loadStats,
    reset,
    clearError,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
});
