<template>
  <div class="ai-analysis-page">
    <!-- Loading State -->
    <div v-if="aiStore.isGenerating" class="generating-state">
      <div class="loading-container">
        <div class="ai-loader">
          <div class="ai-brain">
            <div class="brain-pulse"></div>
          </div>
          <div class="loading-text">
            <p class="loading-title">AI正在深度分析中...</p>
            <p class="loading-stage">{{ aiStore.stage }}</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: aiStore.progress + '%' }"></div>
            </div>
            <p class="loading-percent">{{ aiStore.progress }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="aiStore.hasError" class="error-state">
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">分析失败</h2>
        <p class="error-message">{{ aiStore.error }}</p>
        <button class="btn btn-primary" @click="retryAnalysis">
          重试
        </button>
        <button class="btn btn-ghost" @click="goBack">
          返回
        </button>
      </div>
    </div>

    <!-- Result State -->
    <div v-else-if="aiStore.hasAnalysis && aiStore.analysisResult" class="result-state">
      <AIAnalysisContent :content="aiStore.analysisResult.content" />
    </div>

    <!-- Initial State (no analysis requested) -->
    <div v-else class="initial-state">
      <div class="start-container">
        <h1 class="start-title">🤖 AI深度分析</h1>
        <p class="start-description">
          基于你的MBTI测试结果，AI将为你生成个性化的深度分析报告，包含性格洞察、职业建议、人际关系指导等。
        </p>
        <button class="btn btn-primary btn-large" @click="startAnalysis" :disabled="loading">
          {{ loading ? '创建中...' : '开始AI分析' }}
        </button>
        <div class="start-features">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <div class="feature-text">
              <h3>性格深度解读</h3>
              <p>超越类型标签，揭示深层心理机制</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💼</span>
            <div class="feature-text">
              <h3>职业发展建议</h3>
              <p>匹配最佳职业和发展路径</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <div class="feature-text">
              <h3>人际关系指导</h3>
              <p>优化沟通方式和关系质量</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <div class="feature-text">
              <h3>成长行动计划</h3>
              <p>具体可执行的个人发展建议</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAIStore } from '../stores/ai';
import { useTestStore } from '../stores/test';
import AIAnalysisContent from '../components/ai/AIAnalysisContent.vue';

const router = useRouter();
const aiStore = useAIStore();
const testStore = useTestStore();

const loading = ref(false);

async function startAnalysis() {
  if (!testStore.result?.reportId) {
    console.error('No report ID available');
    return;
  }

  loading.value = true;
  try {
    await aiStore.requestAnalysis(testStore.result.reportId);
  } catch (error) {
    console.error('Failed to start analysis:', error);
  } finally {
    loading.value = false;
  }
}

function retryAnalysis() {
  aiStore.clearError();
  if (testStore.result?.reportId) {
    startAnalysis();
  }
}

function goBack() {
  router.push('/result');
}

onMounted(() => {
  // Check if there's an in-progress task
  if (aiStore.taskId && aiStore.isGenerating) {
    // Resume polling
    aiStore.startPolling(aiStore.taskId);
  }
});
</script>

<style scoped>
.ai-analysis-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 2rem 1rem;
}

/* Loading State */
.generating-state {
  max-width: 600px;
  margin: 4rem auto;
}

.loading-container {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
}

.ai-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.ai-brain {
  position: relative;
  width: 100px;
  height: 100px;
}

.brain-pulse {
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  color: var(--color-text);
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-stage {
  color: var(--color-primary-light);
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.loading-percent {
  font-size: 0.9rem;
  color: #6868a0;
}

/* Error State */
.error-state {
  max-width: 500px;
  margin: 4rem auto;
}

.error-container {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.error-message {
  color: #6868a0;
  margin-bottom: 2rem;
}

/* Initial State */
.initial-state {
  max-width: 800px;
  margin: 2rem auto;
}

.start-container {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
}

.start-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.start-description {
  font-size: 1.1rem;
  color: var(--color-primary-light);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-large {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  margin-bottom: 3rem;
}

.start-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.feature-text p {
  font-size: 0.9rem;
  color: #6868a0;
  margin: 0;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: inline-block;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-btn);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(124, 111, 247, 0.6);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary-light);
  border: 1px solid var(--color-border);
  margin: 0 0.5rem;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}
</style>
