<template>
  <div class="dashboard-overview">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">总测试次数</div>
          <div class="stat-value">{{ formatNumber(stats.totalTests) }}</div>
          <div class="stat-change positive">
            <span>↑</span>
            <span>{{ stats.todayTests }}</span>
            <span>今日新增</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
          <div class="stat-change positive">
            <span>↑</span>
            <span>{{ stats.todayUsers }}</span>
            <span>今日新增</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">平均完成时间</div>
          <div class="stat-value">{{ formatDuration(stats.avgDuration) }}</div>
          <div class="stat-change neutral">
            <span>📈</span>
            <span>完成率 {{ (stats.completionRate * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-label">最常见类型</div>
          <div class="stat-value">{{ stats.mostCommonType }}</div>
          <div class="stat-change neutral">
            <span>📊</span>
            <span>占比 {{ stats.mostCommonTypePercentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <!-- Type Distribution -->
      <div class="chart-card">
        <h3>类型分布</h3>
        <div class="type-grid">
          <div
            v-for="item in stats.typeDistribution"
            :key="item.code"
            class="type-item"
            :style="{ backgroundColor: getPercentageColor(item.percentage) }"
          >
            <div class="type-code">{{ item.code }}</div>
            <div class="type-info">
              <div class="type-count">{{ formatNumber(item.count) }}</div>
              <div class="type-percentage">{{ item.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Trend -->
      <div class="chart-card">
        <h3>最近7天趋势</h3>
        <div class="daily-chart">
          <div
            v-for="day in dailyTrend"
            :key="day.date"
            class="day-bar"
          >
            <div class="bar-container">
              <div
                class="bar"
                :style="{ height: `${(day.tests / maxDailyTests) * 100}%` }"
              ></div>
            </div>
            <div class="day-label">{{ formatDate(day.date) }}</div>
            <div class="day-value">{{ day.tests }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h3>最近活动</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ formatTime(activity.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '../../api/admin';

const stats = ref({
  totalTests: 0,
  totalUsers: 0,
  todayTests: 0,
  todayUsers: 0,
  avgDuration: 0,
  completionRate: 0,
  mostCommonType: '-',
  mostCommonTypePercentage: 0,
  typeDistribution: [] as Array<{
    code: string;
    count: number;
    percentage: number;
  }>,
});

const dailyTrend = ref<Array<{ date: string; tests: number }>>([]);
const maxDailyTests = ref(1);

const recentActivities = ref<Array<{
  id: number;
  icon: string;
  title: string;
  time: Date;
}>>([]);

// Load dashboard data
async function loadDashboardData() {
  try {
    const globalStats = await adminApi.getGlobalStatistics();

    stats.value = {
      totalTests: globalStats.summary.totalTests,
      totalUsers: globalStats.summary.uniqueUsers,
      todayTests: 0, // Will be populated from daily stats
      todayUsers: 0,
      avgDuration: globalStats.summary.avgDuration,
      completionRate: globalStats.summary.completionRate,
      mostCommonType:
        globalStats.typeDistribution.sort((a, b) => b.count - a.count)[0]?.code || '-',
      mostCommonTypePercentage:
        globalStats.typeDistribution.sort((a, b) => b.count - a.count)[0]?.percentage || 0,
      typeDistribution: globalStats.typeDistribution,
    };

    // Load daily trend
    const today = new Date().toISOString().split('T')[0];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = await adminApi.getDailyStatistics(dateStr);
      dailyTrend.value.push({
        date: dateStr,
        tests: dayStats.testCount,
      });
      if (dateStr === today) {
        stats.value.todayTests = dayStats.testCount;
        stats.value.todayUsers = dayStats.uniqueUsers;
      }
    }

    maxDailyTests.value = Math.max(...dailyTrend.value.map((d) => d.tests), 1);

    // Generate some mock recent activities
    recentActivities.value = [
      { id: 1, icon: '✅', title: '用户 user@example.com 完成了测试', time: new Date() },
      { id: 2, icon: '👤', title: '新用户注册', time: new Date(Date.now() - 300000) },
      { id: 3, icon: '📊', title: '系统统计已更新', time: new Date(Date.now() - 600000) },
      { id: 4, icon: '❓', title: '管理员更新了问题 #15', time: new Date(Date.now() - 900000) },
    ];
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

// Format helpers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(time: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

function getPercentageColor(percentage: number): string {
  if (percentage >= 10) return 'rgba(139, 92, 246, 0.3)';
  if (percentage >= 5) return 'rgba(59, 130, 246, 0.3)';
  return 'rgba(107, 114, 128, 0.3)';
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.stat-change.positive {
  color: #22c55e;
}

.stat-change.neutral {
  color: #60a5fa;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #e4e4e7;
}

/* Type Distribution */
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.type-item {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
}

.type-item:hover {
  transform: scale(1.05);
}

.type-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-count {
  font-size: 0.875rem;
  color: #e4e4e7;
}

.type-percentage {
  font-size: 0.75rem;
  color: #a1a1aa;
}

/* Daily Chart */
.daily-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 200px;
  padding-top: 2rem;
}

.day-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 0.25rem 0.25rem 0 0;
  transition: all 0.3s ease;
  min-height: 4px;
}

.bar:hover {
  opacity: 0.8;
}

.day-label,
.day-value {
  font-size: 0.75rem;
  color: #a1a1aa;
  text-align: center;
}

/* Activity Section */
.activity-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.activity-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #e4e4e7;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.activity-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.95rem;
  color: #e4e4e7;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #a1a1aa;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .type-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .daily-chart {
    height: 150px;
  }
}
</style>
