<template>
  <div class="user-management">
    <div class="manager-header">
      <h2>用户管理</h2>
      <div class="filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="suspended">已暂停</option>
        </select>
        <button class="btn-refresh" @click="loadUsers">
          <span>🔄</span>
          <span>刷新</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="users-content">
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">总用户数</span>
          <span class="stat-value">{{ totalUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">活跃用户</span>
          <span class="stat-value">{{ activeUsers }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">暂停用户</span>
          <span class="stat-value">{{ suspendedUsers }}</span>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>邮箱</th>
              <th>昵称</th>
              <th>测试次数</th>
              <th>最后测试</th>
              <th>注册时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="user-id">{{ user.id }}</td>
              <td class="user-email">{{ user.email }}</td>
              <td class="user-nickname">
                {{ user.nickname || '-' }}
              </td>
              <td class="user-tests">{{ user.totalTests }}</td>
              <td class="user-last-test">
                {{ user.lastTestAt ? formatDate(user.lastTestAt) : '从未测试' }}
              </td>
              <td class="user-created">{{ formatDate(user.createdAt) }}</td>
              <td class="user-status">
                <span :class="['status-badge', user.status]">
                  {{ user.status === 'active' ? '活跃' : '已暂停' }}
                </span>
              </td>
              <td class="user-actions">
                <button
                  class="btn-action"
                  :class="{ suspend: user.status === 'active' }"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.status === 'active' ? '暂停' : '激活' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="pagination-info"
          >第 {{ currentPage }} / {{ totalPages }} 页</span
        >
        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { adminApi, type AdminUser } from '../../api/admin';

const loading = ref(true);
const users = ref<AdminUser[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const activeUsers = ref(0);
const suspendedUsers = ref(0);
const statusFilter = ref('');
const limit = 20;

const filteredUsers = computed(() => {
  return users.value;
});

async function loadUsers() {
  loading.value = true;
  try {
    const data = await adminApi.getAllUsers(currentPage.value, limit, statusFilter.value);
    users.value = data.users;
    totalPages.value = Math.ceil(data.total / limit);
    totalUsers.value = data.total;
    activeUsers.value = data.users.filter((u) => u.status === 'active').length;
    suspendedUsers.value = data.users.filter((u) => u.status === 'suspended').length;
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleUserStatus(user: AdminUser) {
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  const confirmed = confirm(
    `确定要${newStatus === 'active' ? '激活' : '暂停'}用户 ${user.email} 吗？`
  );

  if (!confirmed) return;

  try {
    await adminApi.updateUserStatus(user.id, newStatus);
    user.status = newStatus;
    await loadUsers();
  } catch (error) {
    console.error('Failed to update user status:', error);
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadUsers();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

watch(statusFilter, () => {
  currentPage.value = 1;
  loadUsers();
});

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.manager-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0;
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #e4e4e7;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
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

/* Table */
.table-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: rgba(139, 92, 246, 0.1);
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e4e4e7;
  white-space: nowrap;
}

.users-table tbody tr {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.users-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.users-table td {
  padding: 1rem;
  font-size: 0.9rem;
  color: #d4d4d8;
}

.user-id {
  font-weight: 600;
  color: #8b5cf6;
  width: 80px;
}

.user-email {
  font-family: monospace;
  color: #e4e4e7;
}

.user-nickname {
  color: #a1a1aa;
}

.user-tests {
  text-align: center;
  font-weight: 600;
  color: #e4e4e7;
}

.user-last-test,
.user-created {
  color: #a1a1aa;
  white-space: nowrap;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.suspended {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.user-actions {
  white-space: nowrap;
}

.btn-action {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.375rem;
  color: #60a5fa;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-action.suspend {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.btn-action.suspend:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #e4e4e7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #a1a1aa;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-container {
    overflow-x: scroll;
  }

  .users-table {
    min-width: 800px;
  }
}

@media (max-width: 640px) {
  .manager-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    width: 100%;
  }

  .filter-select,
  .btn-refresh {
    flex: 1;
  }

  .stats-row {
    flex-direction: column;
  }

  .stat-item {
    width: 100%;
  }
}
</style>
