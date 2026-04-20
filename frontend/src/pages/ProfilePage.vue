<template>
  <div class="profile-page">
    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-logo" @click="goHome">✦</div>
      <div class="nav-links">
        <button class="btn btn-ghost" @click="goHome">返回首页</button>
        <button class="btn btn-outline" @click="logout">退出登录</button>
      </div>
    </nav>

    <!-- User Info Section -->
    <section class="user-info-section">
      <div class="user-card">
        <div class="user-avatar">
          {{ user.nickname ? user.nickname.charAt(0).toUpperCase() : '?' }}
        </div>
        <div class="user-details">
          <h2>{{ user.nickname || '未设置昵称' }}</h2>
          <p>{{ user.email }}</p>
          <div class="user-stats">
            <div class="stat">
              <span class="stat-value">{{ user.totalTests || 0 }}</span>
              <span class="stat-label">测试次数</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ user.lastTestAt ? formatDate(user.lastTestAt) : '未测试' }}</span>
              <span class="stat-label">最后测试</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'"
      >
        📋 测试历史
      </button>
      <button
        :class="['tab', { active: activeTab === 'stats' }]"
        @click="activeTab = 'stats'"
      >
        📊 统计分析
      </button>
      <button
        :class="['tab', { active: activeTab === 'settings' }]"
        @click="activeTab = 'settings'"
      >
        ⚙️ 设置
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Test History -->
      <div v-if="activeTab === 'history'" class="history-content">
        <div v-if="testHistory.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>还没有测试记录</p>
          <button class="btn btn-primary" @click="startTest">
            开始第一次测试
          </button>
        </div>

        <div v-else class="history-list">
          <div
            v-for="test in testHistory"
            :key="test.sessionId"
            class="history-card"
            @click="viewReport(test.reportId)"
          >
            <div class="history-type">
              <div class="history-emoji">{{ test.mbtiType.emoji }}</div>
              <div class="history-code">{{ test.mbtiType.code }}</div>
              <div class="history-name">{{ test.mbtiType.name }}</div>
            </div>
            <div class="history-meta">
              <div class="history-date">{{ formatDate(test.completedAt) }}</div>
              <div class="history-duration">{{ formatDuration(test.durationSeconds) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div v-else-if="activeTab === 'stats'" class="stats-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-icon">📊</div>
            <div class="stat-card-value">{{ stats.totalTests || 0 }}</div>
            <div class="stat-card-label">总测试次数</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon">🎯</div>
            <div class="stat-card-value">{{ stats.mostCommonType?.code || '-' }}</div>
            <div class="stat-card-label">最常见类型</div>
          </div>
        </div>

        <div class="type-distribution">
          <h3>类型分布</h3>
          <div class="type-bars">
            <div
              v-for="item in stats.typeDistribution"
              :key="item.code"
              class="type-bar-item"
            >
              <div class="type-bar-label">{{ item.code }} - {{ item.name }}</div>
              <div class="type-bar-track">
                <div
                  class="type-bar-fill"
                  :style="{ width: item.percentage + '%' }"
                ></div>
              </div>
              <div class="type-bar-value">{{ item.count }}次 ({{ item.percentage }}%)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div v-else-if="activeTab === 'settings'" class="settings-content">
        <div class="settings-section">
          <h3>个人资料</h3>
          <form @submit.prevent="updateProfile" class="settings-form">
            <div class="form-group">
              <label>昵称</label>
              <input v-model="settings.nickname" type="text" placeholder="输入昵称" />
            </div>

            <div class="form-group">
              <label>头像URL</label>
              <input v-model="settings.avatar" type="url" placeholder="https://..." />
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存更改' }}
            </button>
          </form>
        </div>

        <div class="settings-section">
          <h3>修改密码</h3>
          <form @submit.prevent="changePassword" class="settings-form">
            <div class="form-group">
              <label>当前密码</label>
              <input v-model="passwordForm.oldPassword" type="password" required />
            </div>

            <div class="form-group">
              <label>新密码</label>
              <input v-model="passwordForm.newPassword" type="password" minlength="8" required />
            </div>

            <div class="form-group">
              <label>确认新密码</label>
              <input v-model="passwordForm.confirmPassword" type="password" minlength="8" required />
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '修改中...' : '修改密码' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '../api/user';
import type { UserHistory, UserStatistics } from '../api/user';

const router = useRouter();

const activeTab = ref('history');
const loading = ref(false);

const user = ref({
  id: 0,
  email: '',
  nickname: '',
  avatar: '',
  totalTests: 0,
  lastTestAt: null,
});

const testHistory = ref<UserHistory>([]);

const stats = ref<UserStatistics>({
  totalTests: 0,
  mostCommonType: null,
  typeDistribution: [],
});

const settings = reactive({
  nickname: '',
  avatar: '',
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(async () => {
  await loadUserData();
});

async function loadUserData() {
  try {
    // TODO: Call API to get user data
    console.log('Load user data');
  } catch (error) {
    console.error('Failed to load user:', error);
  }
}

function startTest() {
  router.push('/test');
}

function viewReport(reportId: number) {
  router.push(`/result?reportId=${reportId}`);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${remainingSeconds}秒`;
}

async function updateProfile() {
  loading.value = true;
  try {
    // TODO: Call API
    console.log('Update profile:', settings);
    setTimeout(() => {
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('Failed to update profile:', error);
    loading.value = false;
  }
}

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('密码不一致');
    return;
  }

  loading.value = true;
  try {
    // TODO: Call API
    console.log('Change password');
    setTimeout(() => {
      loading.value = false;
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    }, 500);
  } catch (error) {
    console.error('Failed to change password:', error);
    loading.value = false;
  }
}

function goHome() {
  router.push('/');
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    // TODO: Clear token
    router.push('/');
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 2rem;
}

/* Nav */
.nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.nav-logo {
  font-size: 1.5rem;
  color: var(--color-primary);
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

/* User Info Section */
.user-info-section {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.user-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.user-details h2 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  color: white;
}

.user-details p {
  color: #b8b8d4;
  margin-bottom: 1rem;
}

.user-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: #6868a0;
}

/* Tabs */
.tabs {
  max-width: 900px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6868a0;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
}

.tab:hover {
  color: #b8b8d4;
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Tab Content */
.tab-content {
  max-width: 900px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
}

/* History */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  color: #b8b8d4;
  margin-bottom: 2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
}

.history-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.history-type {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-emoji {
  font-size: 2rem;
}

.history-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.history-name {
  font-size: 1rem;
  color: white;
}

.history-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: #6868a0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
}

.stat-card-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.stat-card-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.stat-card-label {
  font-size: 0.9rem;
  color: #b8b8d4;
}

.type-distribution {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.type-distribution h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: white;
}

.type-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-bar-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-bar-label {
  font-size: 0.85rem;
  color: #b8b8d4;
}

.type-bar-track {
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.type-bar-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 1s ease;
}

.type-bar-value {
  font-size: 0.8rem;
  color: #6868a0;
  text-align: right;
}

/* Settings */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.settings-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: white;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #b8b8d4;
}

.form-group input {
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.95rem;
  transition: var(--transition);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(124, 111, 247, 0.2);
}
</style>
