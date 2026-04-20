<template>
  <div class="system-health">
    <div class="health-header">
      <h2>系统状态</h2>
      <button class="btn-refresh" @click="loadHealth">
        <span>🔄</span>
        <span>刷新</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="health-content">
      <!-- Overall Status -->
      <div class="status-card" :class="`status-${health.status}`">
        <div class="status-icon">
          {{ getStatusIcon(health.status) }}
        </div>
        <div class="status-info">
          <div class="status-title">系统状态</div>
          <div class="status-value">{{ getStatusLabel(health.status) }}</div>
        </div>
      </div>

      <!-- System Info -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">⏱️</div>
          <div class="info-content">
            <div class="info-label">运行时间</div>
            <div class="info-value">{{ formatUptime(health.uptime) }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">📦</div>
          <div class="info-content">
            <div class="info-label">版本</div>
            <div class="info-value">{{ health.version }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">🕐</div>
          <div class="info-content">
            <div class="info-label">检查时间</div>
            <div class="info-value">{{ formatTimestamp(health.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- Memory Usage -->
      <div class="memory-card">
        <h3>内存使用</h3>
        <div class="memory-grid">
          <div class="memory-item">
            <div class="memory-label">堆内存使用</div>
            <div class="memory-bar">
              <div
                class="memory-fill"
                :style="{
                  width: `${(health.memory.heapUsed / health.memory.heapTotal) * 100}%`,
                }"
              ></div>
            </div>
            <div class="memory-value">
              {{ formatBytes(health.memory.heapUsed) }} /
              {{ formatBytes(health.memory.heapTotal) }}
            </div>
          </div>

          <div class="memory-item">
            <div class="memory-label">RSS 内存</div>
            <div class="memory-bar">
              <div
                class="memory-fill"
                :style="{
                  width: `${(health.memory.rss / (health.memory.heapTotal * 2)) * 100}%`,
                }"
              ></div>
            </div>
            <div class="memory-value">
              {{ formatBytes(health.memory.rss) }}
            </div>
          </div>

          <div class="memory-item">
            <div class="memory-label">外部内存</div>
            <div class="memory-bar">
              <div
                class="memory-fill"
                :style="{
                  width: `${(health.memory.external / health.memory.heapTotal) * 100}%`,
                }"
              ></div>
            </div>
            <div class="memory-value">
              {{ formatBytes(health.memory.external) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Database & Redis Status -->
      <div class="connection-grid">
        <div class="connection-card">
          <div class="connection-header">
            <div class="connection-icon">🗄️</div>
            <div class="connection-title">数据库</div>
          </div>
          <div
            class="connection-status"
            :class="health.database === 'connected' ? 'connected' : 'disconnected'"
          >
            {{ health.database === 'connected' ? '已连接' : '未连接' }}
          </div>
        </div>

        <div class="connection-card">
          <div class="connection-header">
            <div class="connection-icon">⚡</div>
            <div class="connection-title">Redis 缓存</div>
          </div>
          <div
            class="connection-status"
            :class="health.redis === 'connected' ? 'connected' : 'disconnected'"
          >
            {{ health.redis === 'connected' ? '已连接' : '未连接' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi, type SystemHealth } from '../../api/admin';

const loading = ref(true);
const health = ref<SystemHealth>({
  status: 'unknown',
  uptime: 0,
  memory: {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  },
  database: 'disconnected',
  redis: 'disconnected',
  timestamp: '',
  version: 'unknown',
});

async function loadHealth() {
  loading.value = true;
  try {
    const data = await adminApi.getHealth();
    health.value = data;
  } catch (error) {
    console.error('Failed to load health data:', error);
    health.value.status = 'unhealthy';
  } finally {
    loading.value = false;
  }
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌',
    unknown: '❓',
  };
  return icons[status] || '❓';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    healthy: '健康',
    degraded: '降级',
    unhealthy: '异常',
    unknown: '未知',
  };
  return labels[status] || '未知';
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${mins}分`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}天${hours}小时`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

onMounted(() => {
  loadHealth();
  // Auto-refresh every 30 seconds
  const interval = setInterval(loadHealth, 30000);
  onBeforeUnmount(() => clearInterval(interval));
});
</script>

<style scoped>
.system-health {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.health-header h2 {
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

/* Status Card */
.status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-card.status-healthy {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.status-card.status-degraded {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.1);
}

.status-card.status-unhealthy,
.status-card.status-unknown {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.status-icon {
  font-size: 3rem;
  line-height: 1;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 0.875rem;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e4e4e7;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.info-icon {
  font-size: 2rem;
  line-height: 1;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.875rem;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e4e4e7;
}

/* Memory Card */
.memory-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.memory-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 1.5rem;
}

.memory-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.memory-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memory-label {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.memory-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.memory-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
  transition: width 0.3s ease;
}

.memory-value {
  font-size: 0.95rem;
  color: #e4e4e7;
  text-align: right;
}

/* Connection Grid */
.connection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.connection-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.connection-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.connection-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.connection-icon {
  font-size: 1.5rem;
}

.connection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
}

.connection-status {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.connection-status.connected {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.connection-status.disconnected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Responsive */
@media (max-width: 640px) {
  .health-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .info-grid,
  .connection-grid {
    grid-template-columns: 1fr;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
