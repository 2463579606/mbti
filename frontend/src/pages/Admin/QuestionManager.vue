<template>
  <div class="question-manager">
    <div class="manager-header">
      <h2>题库管理</h2>
      <div class="filters">
        <select v-model="filterDimension" class="filter-select">
          <option value="">全部维度</option>
          <option value="EI">外向/内向 (E/I)</option>
          <option value="SN">感觉/直觉 (S/N)</option>
          <option value="TF">思考/情感 (T/F)</option>
          <option value="JP">判断/感知 (J/P)</option>
        </select>
        <button class="btn-refresh" @click="loadQuestions">
          <span>🔄</span>
          <span>刷新</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="questions-list">
      <div
        v-for="question in filteredQuestions"
        :key="question.id"
        class="question-card"
        :class="{ inactive: !question.isActive }"
      >
        <div class="question-header">
          <div class="question-meta">
            <span class="question-id">#{{ question.id }}</span>
            <span class="question-dimension">{{ question.dimension }}</span>
            <span v-if="!question.isActive" class="badge-inactive">未启用</span>
          </div>
          <div class="question-actions">
            <button
              class="btn-toggle"
              :class="{ active: question.isActive }"
              @click="toggleQuestionStatus(question)"
            >
              {{ question.isActive ? '✓ 启用' : '✗ 禁用' }}
            </button>
            <button class="btn-edit" @click="editQuestion(question)">
              <span>✏️</span>
              <span>编辑</span>
            </button>
          </div>
        </div>

        <div class="question-content">
          <div class="question-text">{{ question.questionText }}</div>
          <div class="question-options">
            <div class="option">
              <span class="option-label">A.</span>
              <span class="option-text">{{ question.optionA }}</span>
              <span class="option-score">({{ question.scoreA }}分)</span>
            </div>
            <div class="option">
              <span class="option-label">B.</span>
              <span class="option-text">{{ question.optionB }}</span>
              <span class="option-score">({{ question.scoreB }}分)</span>
            </div>
          </div>

          <div v-if="question.statistics" class="question-stats">
            <div class="stat-item">
              <span class="stat-label">回答次数</span>
              <span class="stat-value">{{ question.statistics.totalAnswers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">A选项概率</span>
              <span class="stat-value"
                >{{ (question.statistics.optionAProbability * 100).toFixed(1) }}%</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label">B选项概率</span>
              <span class="stat-value"
                >{{ (question.statistics.optionBProbability * 100).toFixed(1) }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h3>编辑问题</h3>
        <form @submit.prevent="saveQuestion">
          <div class="form-group">
            <label>问题文本</label>
            <textarea v-model="editForm.questionText" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label>选项 A</label>
            <input v-model="editForm.optionA" type="text" required />
          </div>

          <div class="form-group">
            <label>选项 A 分值</label>
            <input v-model.number="editForm.scoreA" type="number" min="0" max="2" required />
          </div>

          <div class="form-group">
            <label>选项 B</label>
            <input v-model="editForm.optionB" type="text" required />
          </div>

          <div class="form-group">
            <label>选项 B 分值</label>
            <input v-model.number="editForm.scoreB" type="number" min="0" max="2" required />
          </div>

          <div class="form-group">
            <label>
              <input v-model="editForm.isActive" type="checkbox" />
              启用此问题
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeEditModal">取消</button>
            <button type="submit" class="btn-save">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { adminApi, type AdminQuestion, type UpdateQuestionDto } from '../../api/admin';

const loading = ref(true);
const questions = ref<AdminQuestion[]>([]);
const filterDimension = ref('');
const showEditModal = ref(false);
const editingQuestion = ref<AdminQuestion | null>(null);

const editForm = ref<UpdateQuestionDto>({
  questionText: '',
  optionA: '',
  scoreA: 0,
  optionB: '',
  scoreB: 0,
  isActive: true,
});

const filteredQuestions = computed(() => {
  if (!filterDimension.value) return questions.value;
  return questions.value.filter((q) => q.dimension === filterDimension.value);
});

async function loadQuestions() {
  loading.value = true;
  try {
    const data = await adminApi.getAllQuestions();
    questions.value = data.questions;
  } catch (error) {
    console.error('Failed to load questions:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleQuestionStatus(question: AdminQuestion) {
  try {
    await adminApi.updateQuestion(question.id, {
      isActive: !question.isActive,
    });
    question.isActive = !question.isActive;
  } catch (error) {
    console.error('Failed to toggle question status:', error);
  }
}

function editQuestion(question: AdminQuestion) {
  editingQuestion.value = question;
  editForm.value = {
    questionText: question.questionText,
    optionA: question.optionA,
    scoreA: question.scoreA,
    optionB: question.optionB,
    scoreB: question.scoreB,
    isActive: question.isActive,
  };
  showEditModal.value = true;
}

async function saveQuestion() {
  if (!editingQuestion.value) return;

  try {
    await adminApi.updateQuestion(editingQuestion.value.id, editForm.value);
    await loadQuestions();
    closeEditModal();
  } catch (error) {
    console.error('Failed to save question:', error);
  }
}

function closeEditModal() {
  showEditModal.value = false;
  editingQuestion.value = null;
  editForm.value = {
    questionText: '',
    optionA: '',
    scoreA: 0,
    optionB: '',
    scoreB: 0,
    isActive: true,
  };
}

onMounted(() => {
  loadQuestions();
});
</script>

<style scoped>
.question-manager {
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

/* Questions List */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.question-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.question-card.inactive {
  opacity: 0.6;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.question-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.question-id {
  font-weight: 600;
  color: #8b5cf6;
}

.question-dimension {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-toggle,
.btn-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.btn-toggle {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.btn-toggle:not(.active) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-edit {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.btn-toggle:hover,
.btn-edit:hover {
  transform: translateY(-1px);
}

/* Question Content */
.question-text {
  font-size: 1rem;
  color: #e4e4e7;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
}

.option-label {
  font-weight: 600;
  color: #8b5cf6;
  min-width: 1.5rem;
}

.option-text {
  flex: 1;
  color: #e4e4e7;
}

.option-score {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.question-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #a1a1aa;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e4e4e7;
  margin-bottom: 0.5rem;
}

.form-group input[type='text'],
.form-group input[type='number'],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #e4e4e7;
  font-size: 0.95rem;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
}

.btn-cancel:hover {
  background: rgba(107, 114, 128, 0.3);
}

.btn-save {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
}

.btn-save:hover {
  opacity: 0.9;
}

/* Responsive */
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

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .question-actions {
    width: 100%;
    justify-content: stretch;
  }

  .btn-toggle,
  .btn-edit {
    flex: 1;
  }

  .question-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
