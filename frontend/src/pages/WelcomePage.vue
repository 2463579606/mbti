<template>
  <div class="welcome-page">
    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-logo" @click="scrollToTop">✦</div>
      <div class="nav-links">
        <button v-if="!userStore.isAuthenticated" class="btn btn-text" @click="goToAuth">
          登录 / 注册
        </button>
        <template v-else>
          <button class="btn btn-text" @click="goToProfile">
            {{ userStore.user?.nickname || userStore.user?.email }}
          </button>
          <button class="btn btn-text" @click="handleLogout">退出</button>
        </template>
        <button class="btn btn-start" @click="startTest">开始测试</button>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-badge">
        <span class="tag tag-purple">✦ 16种性格类型 · 科学测评</span>
      </div>

      <h1 class="hero-title">
        探索你的
        <span class="gradient-text">内在性格密码</span>
      </h1>

      <p class="hero-subtitle">
        通过科学的MBTI测评，深入了解你的性格优势、职业方向和人际关系模式
      </p>

      <div class="hero-cta">
        <button class="btn btn-primary" @click="startTest">
          开始测试 →
        </button>
        <button class="btn btn-outline" @click="scrollToFeatures">
          了解更多
        </button>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-num">16</div>
          <div class="stat-label">性格类型</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">60</div>
          <div class="stat-label">测试题目</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">10<span style="font-size: 1.2rem">min</span></div>
          <div class="stat-label">测试时长</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">95%</div>
          <div class="stat-label">准确率</div>
        </div>
      </div>
    </div>

    <!-- Types Preview -->
    <div class="types-preview" id="types-preview">
      <p class="section-label">— 16 种人格类型 —</p>
      <div class="types-grid">
        <div
          v-for="type in mbtiTypes"
          :key="type.code"
          class="type-card"
          @click="showTypeInfo(type)"
        >
          <div class="type-card-code">{{ type.code }}</div>
          <div class="type-card-name">{{ type.name }}</div>
          <div class="type-card-emoji">{{ type.emoji }}</div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section" id="features">
      <p class="section-label">— 为什么选择我们 —</p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon icon-purple">🧠</div>
          <div class="feature-title">科学的理论基础</div>
          <div class="feature-desc">
            基于迈尔斯-布里格斯类型指标（MBTI），结合荣格分析心理学，提供准确可靠的性格洞察。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-pink">✨</div>
          <div class="feature-title">深度个性化分析</div>
          <div class="feature-desc">
            不只是类型标签，更有详细的性格维度分析、优劣势解读、职业建议和人际关系洞察。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon icon-teal">🎯</div>
          <div class="feature-title">精准的维度测量</div>
          <div class="feature-desc">
            四个核心维度独立评分，用百分比呈现你在每个维度上的倾向强度，更立体地理解自己。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useTestStore } from '../stores/test';

const router = useRouter();
const userStore = useUserStore();
const testStore = useTestStore();

const mbtiTypes = [
  { code: 'INTJ', name: '建筑师', emoji: '🏛️', group: '分析家' },
  { code: 'INTP', name: '逻辑学家', emoji: '🔬', group: '分析家' },
  { code: 'ENTJ', name: '指挥官', emoji: '⚡', group: '分析家' },
  { code: 'ENTP', name: '辩论家', emoji: '💡', group: '分析家' },
  { code: 'INFJ', name: '提倡者', emoji: '🌿', group: '外交家' },
  { code: 'INFP', name: '调停者', emoji: '🦋', group: '外交家' },
  { code: 'ENFJ', name: '主人公', emoji: '🌟', group: '外交家' },
  { code: 'ENFP', name: '竞选者', emoji: '🎨', group: '外交家' },
  { code: 'ISTJ', name: '检查员', emoji: '📋', group: '哨兵' },
  { code: 'ISFJ', name: '守护者', emoji: '🛡️', group: '哨兵' },
  { code: 'ESTJ', name: '总经理', emoji: '📊', group: '哨兵' },
  { code: 'ESFJ', name: '执政官', emoji: '🤝', group: '哨兵' },
  { code: 'ISTP', name: '鉴赏家', emoji: '🔧', group: '探险家' },
  { code: 'ISFP', name: '探险家', emoji: '🎭', group: '探险家' },
  { code: 'ESTP', name: '企业家', emoji: '🚀', group: '探险家' },
  { code: 'ESFP', name: '表演者', emoji: '🎉', group: '探险家' },
];

function startTest() {
  // Clear any old test data before starting a new test
  testStore.reset();
  router.push('/test');
}

function scrollToFeatures() {
  const features = document.getElementById('features');
  features?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTypeInfo(type: any) {
  // Could show a modal with type info
  console.log('Show type info:', type);
}

function goToAuth() {
  router.push('/auth');
}

function goToProfile() {
  router.push('/profile');
}

async function handleLogout() {
  await userStore.logout();
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: var(--gradient-hero);
  color: white;
  overflow-x: hidden;
}

/* Nav */
.nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: 1200px;
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

.btn-start {
  padding: 0.5rem 1.25rem;
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  color: var(--color-primary-light);
  cursor: pointer;
  transition: var(--transition);
}

.btn-start:hover {
  background: rgba(124, 111, 247, 0.1);
}

.btn-text {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.btn-text:hover {
  color: rgba(255, 255, 255, 1);
}

/* Hero */
.hero {
  text-align: center;
  padding: 4rem 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}

.hero-badge {
  margin-bottom: 1.5rem;
}

.tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-purple {
  background: rgba(124, 111, 247, 0.2);
  color: var(--color-primary-light);
  border: 1px solid rgba(124, 111, 247, 0.3);
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #b8b8d4;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border: none;
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

/* Stats */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.85rem;
  color: #6868a0;
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

/* Types Preview */
.types-preview {
  padding: 3rem 2rem;
}

.section-label {
  text-align: center;
  color: var(--color-primary);
  font-size: 1rem;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.type-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.type-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.type-card-code {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.type-card-name {
  font-size: 0.85rem;
  color: #b8b8d4;
  margin-bottom: 0.5rem;
}

.type-card-emoji {
  font-size: 1.5rem;
}

/* Features */
.features-section {
  padding: 3rem 2rem 4rem;
  background: rgba(13, 13, 26, 0.5);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: white;
}

.feature-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #b8b8d4;
}

.icon-purple {
  filter: drop-shadow(0 0 10px rgba(124, 111, 247, 0.5));
}

.icon-pink {
  filter: drop-shadow(0 0 10px rgba(240, 107, 158, 0.5));
}

.icon-teal {
  filter: drop-shadow(0 0 10px rgba(67, 217, 184, 0.5));
}
</style>
