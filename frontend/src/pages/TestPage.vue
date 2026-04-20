<template>
  <div class="test-page">
    <!-- Test Header -->
    <div class="test-header">
      <div class="test-header-inner">
        <button class="btn-back" @click="goBack">
          <span>←</span>
        </button>
        <div class="progress-info">
          <span class="progress-count">{{ testStore.currentQuestion + 1 }} / 60</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-pct">{{ progress }}%</span>
        </div>
      </div>
      <div class="dimension-badges">
        <span
          v-for="dim in ['EI', 'SN', 'TF', 'JP']"
          :key="dim"
          :class="['dim-badge', { active: currentDimension === dim }]"
        >
          {{ dimensionLabels[dim] }}
        </span>
      </div>
    </div>

    <!-- Question Container -->
    <div class="question-container" v-if="currentQuestion">
      <div class="question-card">
        <div class="question-category">
          <span class="tag tag-purple">{{ dimensionLabel }}</span>
        </div>
        <div class="question-num">{{ questionNumber }}</div>
        <div class="question-text">{{ currentQuestion.question }}</div>
        <div class="options-list">
          <button
            v-for="(opt, idx) in currentQuestion.options"
            :key="idx"
            :class="['option-btn', { selected: selectedOption === idx }]"
            @click="selectOption(idx)"
          >
            <div class="option-indicator">{{ opt.label || String.fromCharCode(65 + idx) }}</div>
            <div class="option-text">{{ opt.text }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="test-nav">
      <button class="btn btn-ghost" @click="previousQuestion" :disabled="currentQuestionIdx === 0">
        ← 上一题
      </button>
      <div class="dots-nav">
        <div
          v-for="i in visibleDots"
          :key="i"
          :class="['dot-nav', { filled: isAnswered(i), current: i === currentQuestionIdx }]"
          @click="jumpToQuestion(i)"
        ></div>
      </div>
      <button class="btn btn-primary" @click="nextQuestion" :disabled="selectedOption === null">
        {{ isLastQuestion ? '查看结果 🎉' : '下一题 →' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTestStore } from '../stores/test';
import { testApi } from '../api/test';

const router = useRouter();
const testStore = useTestStore();

const currentQuestion = ref<any>(null);
const selectedOption = ref<number | null>(null);
const allQuestions = ref<any[]>([]); // Cache all questions

// Computed
const progress = computed(() => testStore.progress);
const currentQuestionIdx = computed(() => testStore.currentQuestion);
const questionNumber = computed(() => String(currentQuestionIdx.value + 1).padStart(2, '0'));
const isLastQuestion = computed(() => currentQuestionIdx.value === 59);

const dimensionLabels: Record<string, string> = {
  EI: 'E / I',
  SN: 'S / N',
  TF: 'T / F',
  JP: 'J / P',
};

const currentDimension = computed(() => currentQuestion.value?.dimension || '');
const dimensionLabel = computed(() => {
  const labels: Record<string, string> = {
    EI: '外向 / 内向',
    SN: '实感 / 直觉',
    TF: '思考 / 情感',
    JP: '判断 / 感知',
  };
  return labels[currentDimension.value] || '';
});

// Dot navigation
const visibleDots = computed(() => {
  const total = 60;
  const visible = 15;
  const start = Math.max(0, Math.min(currentQuestionIdx.value - 7, total - visible));
  const dots = [];
  for (let i = start; i < start + visible; i++) {
    dots.push(i);
  }
  return dots;
});

// Methods
async function loadAllQuestions() {
  try {
    const result = await testApi.getQuestions(0, 60);
    allQuestions.value = result.questions;
    console.log('Loaded all questions:', result.questions.length);
  } catch (error) {
    console.error('Failed to load questions:', error);
  }
}

function loadQuestion() {
  // Load question from cache by index
  const questionIdx = currentQuestionIdx.value;
  const questionData = allQuestions.value[questionIdx];

  if (questionData) {
    currentQuestion.value = {
      ...questionData,
      questionNumber: questionIdx + 1,
      progress: {
        current: questionIdx + 1,
        total: 60,
        percentage: Math.round((testStore.answeredCount / 60) * 100),
        answered: testStore.answeredCount,
      },
    };
    selectedOption.value = testStore.getAnswer(questionIdx) || null;
  } else {
    console.error('Question not found at index:', questionIdx);
  }
}

async function selectOption(idx: number) {
  const previousAnswer = testStore.getAnswer(currentQuestionIdx.value);
  const isChangingAnswer = previousAnswer !== undefined && previousAnswer !== idx;

  // Update selected option immediately for better UX
  selectedOption.value = idx;

  // Check if this question is already answered
  if (previousAnswer !== undefined) {
    if (isChangingAnswer) {
      console.log('Changing answer from', previousAnswer, 'to', idx);
      // Update local state immediately for better UX
      testStore.setAnswer(currentQuestionIdx.value, idx);

      // Try to submit to backend, but handle duplicate answer error gracefully
      try {
        await testApi.submitAnswer(currentQuestionIdx.value, idx);
      } catch (error: any) {
        // If backend rejects duplicate answer, that's fine - we already updated local state
        if (error.message?.includes('duplicate') || error.message?.includes('already')) {
          console.log('Backend does not support answer changes, local state updated');
        } else {
          console.error('Failed to submit answer change:', error);
        }
      }
    } else {
      console.log('Same answer selected, skipping submission');
    }

    // For already answered questions, still allow navigation and test completion
    if (!isLastQuestion.value) {
      setTimeout(() => {
        nextQuestion();
      }, 450);
    } else {
      // For last question, allow completion even if already answered
      setTimeout(() => {
        completeTest();
      }, 450);
    }
    return;
  }

  // New answer - submit to backend
  try {
    await testApi.submitAnswer(currentQuestionIdx.value, idx);
    testStore.setAnswer(currentQuestionIdx.value, idx);

    // Auto advance (except last question)
    if (!isLastQuestion.value) {
      setTimeout(() => {
        nextQuestion();
      }, 450);
    }
  } catch (error) {
    console.error('Failed to submit answer:', error);
  }
}

function nextQuestion() {
  if (selectedOption.value === null) return;

  if (isLastQuestion.value) {
    completeTest();
  } else {
    testStore.nextQuestion();
    // Don't call setCurrentQuestion here, nextQuestion() already handles it
    loadQuestion();
  }
}

function previousQuestion() {
  if (currentQuestionIdx.value > 0) {
    testStore.previousQuestion();
    // Don't call setCurrentQuestion here, previousQuestion() already handles it
    loadQuestion();
  }
}

function jumpToQuestion(idx: number) {
  testStore.setCurrentQuestion(idx);
  loadQuestion();
}

function isAnswered(idx: number): boolean {
  return testStore.getAnswer(idx) !== undefined;
}

async function completeTest() {
  try {
    const result = await testApi.completeTest();
    console.log('Test completed, result:', result);
    testStore.setResult(result);
    router.push('/loading');
  } catch (error) {
    console.error('Failed to complete test:', error);
  }
}

function goBack() {
  if (confirm('确定要退出测试吗？进度将会保存。')) {
    router.push('/');
  }
}

onMounted(async () => {
  // Always create a fresh session when entering the test page
  // This prevents using old session tokens from completed tests
  try {
    // Reset any old session data first
    testStore.reset();

    const sessionData = await testApi.createSession();
    testStore.setSessionToken(sessionData.sessionToken);
    console.log('New session created:', sessionData.sessionToken);
  } catch (error) {
    console.error('Failed to create session:', error);
    return;
  }

  // Load all questions first
  if (allQuestions.value.length === 0) {
    await loadAllQuestions();
  }

  loadQuestion();
});
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 2rem;
}

/* Test Header */
.test-header {
  position: sticky;
  top: 0;
  background: rgba(13, 13, 26, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem 1.5rem;
  z-index: 10;
  border-bottom: 1px solid var(--color-border);
}

.test-header-inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-primary-light);
  cursor: pointer;
  transition: var(--transition);
}

.btn-back:hover {
  background: rgba(124, 111, 247, 0.1);
  border-color: var(--color-primary);
}

.progress-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-count {
  font-size: 0.9rem;
  color: var(--color-primary-light);
  white-space: nowrap;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-pct {
  font-size: 0.9rem;
  color: #6868a0;
  min-width: 3rem;
  text-align: right;
}

/* Dimension Badges */
.dimension-badges {
  max-width: 720px;
  margin: 1rem auto 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dim-badge {
  padding: 0.35rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: #6868a0;
  transition: var(--transition);
}

.dim-badge.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Question Container */
.question-container {
  max-width: 720px;
  margin: 2rem auto 0;
  padding: 0 1.5rem;
}

.question-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  animation: slideUp 0.35s ease both;
}

.question-category {
  margin-bottom: 1rem;
}

.tag {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-purple {
  background: rgba(124, 111, 247, 0.2);
  color: var(--color-primary-light);
}

.question-num {
  font-size: 3rem;
  font-weight: 600;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #e0e0e0;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.option-btn:hover {
  border-color: var(--color-border-hover);
  background: rgba(255, 255, 255, 0.05);
}

.option-btn.selected {
  border-color: var(--color-primary);
  background: rgba(124, 111, 247, 0.1);
}

.option-indicator {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  font-weight: 600;
  color: var(--color-primary-light);
  flex-shrink: 0;
}

.option-btn.selected .option-indicator {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.option-text {
  flex: 1;
  font-size: 1rem;
  color: #b8b8d4;
}

.option-btn.selected .option-text {
  color: white;
}

/* Navigation */
.test-nav {
  max-width: 720px;
  margin: 2rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #b8b8d4;
  border: 1px solid var(--color-border);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: white;
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

/* Dot Navigation */
.dots-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  overflow: hidden;
}

.dot-nav {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: var(--transition);
}

.dot-nav.filled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dot-nav.current {
  transform: scale(1.4);
  background: var(--color-primary-light);
  border-color: var(--color-primary-light);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
