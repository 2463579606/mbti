<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <div class="logo">
          <h1>MBTI Admin</h1>
          <span class="badge">管理后台</span>
        </div>
        <nav class="admin-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['nav-tab', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </nav>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleClearCache">
            <span>🔄</span>
            <span>清除缓存</span>
          </button>
          <button class="btn-logout" @click="handleLogout">
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <DashboardOverview />
      </div>

      <!-- Questions Tab -->
      <div v-if="activeTab === 'questions'" class="tab-content">
        <QuestionManager />
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <UserManagement />
      </div>

      <!-- Sessions Tab -->
      <div v-if="activeTab === 'sessions'" class="tab-content">
        <SessionMonitor />
      </div>

      <!-- System Tab -->
      <div v-if="activeTab === 'system'" class="tab-content">
        <SystemHealth />
      </div>
    </main>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { adminApi } from '../../api/admin';
import DashboardOverview from './DashboardOverview.vue';
import QuestionManager from './QuestionManager.vue';
import UserManagement from './UserManagement.vue';
import SessionMonitor from './SessionMonitor.vue';
import SystemHealth from './SystemHealth.vue';

const router = useRouter();
const userStore = useUserStore();

// Active tab
const activeTab = ref('dashboard');

// Tabs configuration
const tabs = [
  { key: 'dashboard', label: '仪表盘', icon: '📊' },
  { key: 'questions', label: '题库管理', icon: '❓' },
  { key: 'users', label: '用户管理', icon: '👥' },
  { key: 'sessions', label: '会话监控', icon: '📡' },
  { key: 'system', label: '系统状态', icon: '⚙️' },
];

// Toast notification
const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

// Show toast
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

// Clear cache
async function handleClearCache() {
  try {
    await adminApi.clearCache();
    showToast('缓存清除成功');
  } catch (error: any) {
    showToast(error.response?.data?.message || '清除缓存失败', 'error');
  }
}

// Logout
async function handleLogout() {
  await userStore.logout();
  router.push('/auth');
}

// Verify admin access
onMounted(() => {
  if (userStore.user?.email !== 'admin@mbti.com') {
    router.push('/');
  }
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  color: #e4e4e7;
}

/* Header */
.admin-header {
  background: rgba(30, 30, 46, 0.95);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.logo .badge {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Navigation */
.admin-nav {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #a1a1aa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.nav-tab:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: #e4e4e7;
}

.nav-tab.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
  border-color: rgba(139, 92, 246, 0.5);
  color: #ffffff;
  font-weight: 600;
}

.tab-icon {
  font-size: 1.1rem;
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary,
.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-logout {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Main Content */
.admin-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast Notification */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.toast.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-wrap: wrap;
  }

  .admin-nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .nav-tab {
    flex-shrink: 0;
  }
}

@media (max-width: 640px) {
  .admin-header {
    padding: 1rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .nav-tab {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .header-actions {
    flex-direction: column;
  }
}
</style>
