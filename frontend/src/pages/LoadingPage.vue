<template>
  <div class="loading-page">
    <div class="loading-ring-wrap">
      <div class="loading-ring"></div>
      <div class="loading-ring-inner"></div>
      <div class="loading-emoji">🧠</div>
    </div>

    <div class="loading-texts">
      <div class="loading-title">正在分析你的性格...</div>
      <div class="loading-subtitle">请稍候，我们正在处理你的答案</div>
    </div>

    <div class="loading-steps">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        :class="['loading-step', { done: step.done }]"
      >
        <div class="loading-step-icon">{{ step.icon }}</div>
        <div class="loading-step-text">{{ step.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const steps = ref([
  { icon: '📊', text: '收集答案', done: false },
  { icon: '🔍', text: '分析模式', done: false },
  { icon: '✨', text: '生成洞察', done: false },
]);

onMounted(() => {
  // Animate steps
  const delays = [700, 1400, 2100];

  steps.value.forEach((step, idx) => {
    setTimeout(() => {
      step.done = true;
    }, delays[idx]);
  });

  // Navigate to result page after animation
  setTimeout(() => {
    router.push('/result');
  }, 3000);
});
</script>

<style scoped>
.loading-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 3rem;
}

.loading-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.loading-ring-inner {
  position: absolute;
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  border: 3px solid transparent;
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  animation: spin 2s linear infinite reverse;
}

.loading-emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-texts {
  text-align: center;
  margin-bottom: 3rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-subtitle {
  font-size: 1rem;
  color: #b8b8d4;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.loading-step.done {
  background: rgba(124, 111, 247, 0.1);
  border-color: var(--color-primary);
}

.loading-step-icon {
  font-size: 1.5rem;
  transition: var(--transition);
}

.loading-step.done .loading-step-icon {
  transform: scale(1.2);
}

.loading-step-text {
  font-size: 0.9rem;
  color: #b8b8d4;
}

.loading-step.done .loading-step-text {
  color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
