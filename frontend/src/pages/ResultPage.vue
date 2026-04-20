<template>
  <div class="result-page" v-if="report">
    <!-- Result Header -->
    <nav class="nav">
      <div class="nav-logo" @click="goHome">✦</div>
      <button class="btn-restart" @click="restartTest">重新测试</button>
    </nav>

    <!-- Result Hero -->
    <div class="result-hero">
      <div class="result-type-badge">
        <div class="result-type-emoji">{{ report.mbtiType.emoji }}</div>
        <div class="result-type-code">{{ report.mbtiType.code }}</div>
        <div class="result-type-name">{{ report.mbtiType.name }}</div>
      </div>
      <h1 class="result-headline">{{ report.mbtiType.headline }}</h1>
      <p class="result-tagline">{{ report.mbtiType.tagline }}</p>
    </div>

    <!-- Dimension Bars -->
    <section class="dimensions-section">
      <div class="section-title">
        <div class="section-title-icon">📊</div>
        <h2>维度分析</h2>
      </div>
      <div class="dimension-bars">
        <div v-for="dim in report.dimensions" :key="dim.key" class="dim-row">
          <div class="dim-labels">
            <span class="dim-left">{{ dim.left }}</span>
            <span class="dim-desc">{{ dim.description }}</span>
            <span class="dim-right">{{ dim.right }}</span>
          </div>
          <div class="dim-bar-track">
            <div
              class="dim-bar-fill"
              :style="{ width: dim.percentage + '%' }"
              :data-target="dim.percentage + '%'"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Details Grid -->
    <section class="detail-section">
      <div class="detail-grid">
        <div class="detail-card">
          <h3><span>💪</span> 性格优势</h3>
          <ul>
            <li v-for="s in report.strengths" :key="s">{{ s }}</li>
          </ul>
        </div>
        <div class="detail-card">
          <h3><span>⚡</span> 成长挑战</h3>
          <ul>
            <li v-for="w in report.weaknesses" :key="w">{{ w }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Compatibility -->
    <section class="compatibility-section">
      <div class="section-title">
        <div class="section-title-icon">💫</div>
        <h2>性格兼容</h2>
      </div>
      <div class="compat-grid">
        <div class="compat-card best">
          <h4>💚 最佳搭档</h4>
          <div class="compat-types">
            <span v-for="t in report.compatibility.best" :key="t.code" class="compat-type">
              {{ t.code }}
            </span>
          </div>
        </div>
        <div class="compat-card challenging">
          <h4>💗 相互成长</h4>
          <div class="compat-types">
            <span v-for="t in report.compatibility.challenging" :key="t.code" class="compat-type">
              {{ t.code }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Famous People -->
    <section class="famous-section">
      <div class="section-title">
        <div class="section-title-icon">🌟</div>
        <h2>著名人物</h2>
      </div>
      <div class="famous-list">
        <span v-for="f in report.famousPeople" :key="f" class="famous-tag">
          👤 {{ f }}
        </span>
      </div>
    </section>

    <!-- Careers -->
    <section class="career-section">
      <div class="section-title">
        <div class="section-title-icon">💼</div>
        <h2>职业建议</h2>
      </div>
      <div class="career-grid">
        <div v-for="c in report.careers" :key="c" class="career-item">
          💼 {{ c }}
        </div>
      </div>
    </section>

    <!-- Actions -->
    <div class="result-actions">
      <button class="btn btn-primary" @click="restartTest">
        重新测试
      </button>
      <button class="btn btn-outline" @click="shareResult">
        分享结果
      </button>
      <button class="btn btn-ai" @click="goToAIAnalysis">
        🤖 AI深度分析
      </button>
    </div>
  </div>

  <div v-else class="result-page loading">
    <div class="loading-spinner"></div>
    <p>加载结果中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTestStore } from '../stores/test';
import { reportApi } from '../api/report';
import type { TestReport } from '../api/report';

const router = useRouter();
const testStore = useTestStore();

const report = ref<TestReport | null>(null);

onMounted(async () => {
  try {
    // Get report ID from test store
    const reportId = testStore.result?.reportId;
    if (!reportId) {
      console.error('No report ID found in test store');
      setTimeout(() => router.push('/'), 2000);
      return;
    }
    console.log('Loading report:', reportId);
    report.value = await reportApi.getReport(reportId);
  } catch (error) {
    console.error('Failed to load report:', error);
    // Navigate back to home if error
    setTimeout(() => router.push('/'), 2000);
  }
});

function restartTest() {
  testStore.reset();
  router.push('/');
}

function goHome() {
  router.push('/');
}

function shareResult() {
  if (report.value?.share.url) {
    const url = window.location.origin + report.value.share.url;
    const text = `我的MBTI性格类型是 ${report.value.mbtiType.code} ${report.value.mbtiType.name}！来测测你的性格类型吧 🌟`;
    const shareText = `${text}\n${url}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'MBTI 性格测试',
          text: text,
          url: url,
        })
        .catch(console.error);
    } else if (navigator.clipboard) {
      // Modern clipboard API
      navigator.clipboard
        .writeText(shareText)
        .then(() => alert('分享链接已复制到剪贴板！'))
        .catch(() => fallbackCopyToClipboard(shareText));
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyToClipboard(shareText);
    }
  }
}

function fallbackCopyToClipboard(text: string) {
  // Create a temporary textarea to copy text
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('分享链接已复制到剪贴板！');
    } else {
      alert('复制失败，请手动复制：\n' + text);
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert('复制失败，请手动复制：\n' + text);
  }

  document.body.removeChild(textarea);
}

function goToAIAnalysis() {
  router.push('/ai-analysis');
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 4rem;
}

.result-page.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(124, 111, 247, 0.3);
  border-top-color: #7c6ff7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
  transition: var(--transition);
}

.nav-logo:hover {
  transform: scale(1.1);
}

.btn-restart {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: #b8b8d4;
  cursor: pointer;
  transition: var(--transition);
}

.btn-restart:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

/* Result Hero */
.result-hero {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--gradient-hero);
}

.result-type-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.result-type-emoji {
  font-size: 4rem;
}

.result-type-code {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.result-type-name {
  font-size: 1.25rem;
  color: var(--color-primary-light);
}

.result-headline {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: white;
}

.result-tagline {
  font-size: 1.1rem;
  color: #b8b8d4;
  max-width: 600px;
  margin: 0 auto;
}

/* Sections */
section {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-title-icon {
  font-size: 1.5rem;
}

.section-title h2 {
  font-size: 1.5rem;
  color: white;
}

/* Dimension Bars */
.dimension-bars {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.dim-row {
  margin-bottom: 1.5rem;
}

.dim-row:last-child {
  margin-bottom: 0;
}

.dim-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.dim-left,
.dim-right {
  color: var(--color-primary-light);
  font-weight: 600;
}

.dim-desc {
  color: #6868a0;
}

.dim-bar-track {
  height: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  width: 0;
  transition: width 1s ease;
}

/* Detail Cards */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.detail-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.detail-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-card ul {
  list-style: none;
}

.detail-card li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #b8b8d4;
}

.detail-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

/* Compatibility */
.compat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.compat-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.compat-card h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: white;
}

.compat-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.compat-type {
  padding: 0.35rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary-light);
}

.compat-card.best .compat-type {
  border-color: var(--color-accent-teal);
  color: var(--color-accent-teal);
}

.compat-card.challenging .compat-type {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

/* Famous People */
.famous-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.famous-tag {
  padding: 0.5rem 1rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: #b8b8d4;
}

/* Careers */
.career-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.career-item {
  padding: 0.75rem 1rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.9rem;
  color: #b8b8d4;
  transition: var(--transition);
}

.career-item:hover {
  border-color: var(--color-primary);
  color: white;
}

/* Actions */
.result-actions {
  max-width: 600px;
  margin: 3rem auto 0;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-btn);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(124, 111, 247, 0.6);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background: rgba(124, 111, 247, 0.1);
}

.btn-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-ai::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-ai:hover::before {
  left: 100%;
}

.btn-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
