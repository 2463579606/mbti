<template>
  <div class="session-monitor">
    <div class="monitor-header">
      <h2>会话监控</h2>
      <button class="btn-refresh" @click="loadSessions">
        <span>🔄</span>
        <span>刷新</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="sessions-content">
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">总会话数</span>
          <span class="stat-value">{{ totalSessions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中</span>
          <span class="stat-value in-progress">{{ inProgressCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value completed">{{ completedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已放弃</span>
          <span class="stat-value abandoned">{{ abandonedCount }}</span>
        </div>
      </div>

      <!-- Sessions List -->
      <div class="sessions-list">
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="session-card"
          :class="`status-${session.status}`"
        >
          <div class="session-header">
            <div class="session-meta">
              <span class="session-id">{{ session.sessionId.slice(0, 12) }}...</span>
              <span :class="['status-badge', session.status]">
                {{ getStatusLabel(session.status) }}
              </span>
            </div>
            <div class="session-user">
              {{ session.userId ? getUserEmail(session.userId) : '匿名用户' }}
            </div>
          </div>

          <div class="session-body">
            <div class="session-info">
              <div class="info-item">
                <span class="info-label">当前问题</span>
                <span class="info-value"
                  >{{ session.currentQuestion }} / 60</span
                >
              </div>
              <div class="info-item">
                <span class="info-label">已回答</span>
                <span class="info-value">{{ session.currentQuestion }} 题</span>
              </div>
              <div class="info-item">
                <span class="info-label">开始时间</span>
                <span class="info-value">{{ formatTime(session.startedAt) }}</span>
              </div>
              <div v-if="session.completedAt" class="info-item">
                <span class="info-label">完成时间</span>
                <span class="info-value">{{ formatTime(session.completedAt) }}</span>
              </div>
              <div v-if="session.durationSeconds" class="info-item">
                <span class="info-label">用时</span>
                <span class="info-value">{{ formatDuration(session.durationSeconds) }}</span>
              </div>
            </div>

            <div class="session-progress">
              <div class="progress-label">完成进度</div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${(session.currentQuestion / 60) * 100}%` }"
                ></div>
              </div>
              <div class="progress-text">
                {{ ((session.currentQuestion / 60) * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { adminApi, type TestSession } from '../../api/admin';

const loading = ref(true);
const sessions = ref<TestSession[]>([]);
const totalSessions = ref(0);

const inProgressCount = computed(() => sessions.value.filter((s) => s.status === 'in_progress').length);
const completedCount = computed(() => sessions.value.filter((s) => s.status === 'completed').length);
const abandonedCount = computed(() => sessions.value.filter((s) => s.status === 'abandoned').length);

const userEmails = ref<Record<number, string>>({});

async function loadSessions() {
  loading.value = true;
  try {
    const data = await adminApi.getRecentSessions(50);
    sessions.value = data.sessions;
    totalSessions.value = data.total;

    // Load user emails for user sessions
    const userIds = data.sessions
      .map((s) => s.userId)
      .filter((id): id is number => id !== undefined);

    if (userIds.length > 0) {
      const usersData = await adminApi.getAllUsers(1, Math.max(...userIds));
      usersData.users.forEach((user) => {
        userEmails.value[user.id] = user.email;
      });
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
  } finally {
    loading.value = false;
  }
}

function getUserEmail(userId: number): string {
  return userEmails.value[userId] || `用户 #${userId}`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: '进行中',
    completed: '已完成',
    abandoned: '已放弃',
  };
  return labels[status] || status;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
}

onMounted(() => {
  loadSessions();
  // Auto-refresh every 30 seconds
  const interval = setInterval(loadSessions, 30000);
  onBeforeUnmount(() => clearInterval(interval));
});
</script>

<style scoped>
.session-monitor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.monitor-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #a1a1aa;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 150px;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.in-progress {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.completed {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value.abandoned {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sessions List */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.session-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.session-card.status-in_progress {
  border-left: 4px solid #f59e0b;
}

.session-card.status-completed {
  border-left: 4px solid #22c55e;
}

.session-card.status-abandoned {
  border-left: 4px solid #ef4444;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.session-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.session-id {
  font-family: monospace;
  font-weight: 600;
  color: #8b5cf6;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.in_progress {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-badge.completed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.abandoned {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.session-user {
  font-size: 0.9rem;
  color: #a1a1aa;
}

.session-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.info-value {
  font-size: 0.95rem;
  color: #e4e4e7;
  font-weight: 500;
}

.session-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #e4e4e7;
  text-align: right;
}

/* Responsive */
@media (max-width: 640px) {
  .monitor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .stats-row {
    flex-direction: column;
  }

  .stat-item {
    width: 100%;
  }

  .session-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .session-info {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
