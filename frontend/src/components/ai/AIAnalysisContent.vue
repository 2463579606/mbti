<template>
  <div class="ai-analysis-content">
    <!-- Overview Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">✨</span>
        <h2 class="section-title">性格概览</h2>
      </div>
      <div class="overview-card">
        <h1 class="mbti-title">{{ content.overview.title }}</h1>
        <p class="mbti-summary">{{ content.overview.summary }}</p>
        <div class="key-points">
          <span v-for="(point, idx) in content.overview.keyPoints" :key="idx" class="key-point">
            {{ point }}
          </span>
        </div>
      </div>
    </section>

    <!-- Strengths Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">💪</span>
        <h2 class="section-title">性格优势</h2>
      </div>
      <div class="strengths-grid">
        <div
          v-for="(strength, idx) in content.strengths.items"
          :key="idx"
          class="strength-card"
        >
          <h3 class="strength-name">{{ strength.name }}</h3>
          <p class="strength-description">{{ strength.description }}</p>
          <ul v-if="strength.examples"">
            <li v-for="(example, i) in strength.examples" :key="i">{{ example }}</li>
          </ul>
        </div>
      </div>
      <div class="application-section">
        <h3>💼 应用场景</h3>
        <ul class="application-list">
          <li v-for="(app, idx) in content.strengths.application" :key="idx">
            {{ app }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Weaknesses Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">⚡</span>
        <h2 class="section-title">成长机会</h2>
      </div>
      <div class="weaknesses-grid">
        <div
          v-for="(weakness, idx) in content.weaknesses.items"
          :key="idx"
          class="weakness-card"
        >
          <h3 class="weakness-name">{{ weakness.name }}</h3>
          <p class="weakness-description">{{ weakness.description }}</p>
        </div>
      </div>
      <div class="strategies-section">
        <h3>🎯 改进策略</h3>
        <ul class="strategies-list">
          <li v-for="(strategy, idx) in content.weaknesses.improvementStrategies" :key="idx">
            {{ strategy }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Career Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">💼</span>
        <h2 class="section-title">职业发展</h2>
      </div>
      <div class="career-matches">
        <h3>🎯 最佳匹配职业</h3>
        <div class="career-list">
          <div
            v-for="(match, idx) in content.career.bestMatches"
            :key="idx"
            class="career-match-item"
          >
            <div class="career-info">
              <span class="career-role">{{ match.role }}</span>
              <span class="career-score">{{ match.score }}% 匹配</span>
            </div>
            <p class="career-reason">{{ match.reason }}</p>
          </div>
        </div>
      </div>
      <div class="career-paths">
        <h3>🚀 发展路径</h3>
        <ul class="paths-list">
          <li v-for="(path, idx) in content.career.developmentPaths" :key="idx">
            {{ path }}
          </li>
        </ul>
      </div>
      <div class="career-recommendations">
        <h3>💡 职业建议</h3>
        <ul class="recommendations-list">
          <li v-for="(rec, idx) in content.career.recommendations" :key="idx">
            {{ rec }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Relationships Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">👥</span>
        <h2 class="section-title">人际关系</h2>
      </div>
      <div class="relationships-content">
        <p class="relationship-style">{{ content.relationships.style }}</p>
        <div class="rel-grid">
          <div class="rel-card">
            <h4>💪 关系优势</h4>
            <ul>
              <li v-for="(strength, idx) in content.relationships.strengthsInRelationships" :key="idx">
                {{ strength }}
              </li>
            </ul>
          </div>
          <div class="rel-card">
            <h4>⚠️ 注意事项</h4>
            <ul>
              <li v-for="(challenge, idx) in content.relationships.challenges" :key="idx">
                {{ challenge }}
              </li>
            </ul>
          </div>
        </div>
        <div class="relationship-advice">
          <h4>💡 建议</h4>
          <ul>
            <li v-for="(advice, idx) in content.relationships.advice" :key="idx">
              {{ advice }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Growth Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">🎯</span>
        <h2 class="section-title">成长规划</h2>
      </div>
      <div class="growth-plans">
        <div class="growth-plan-card short-term">
          <h3>📅 短期目标</h3>
          <ul>
            <li v-for="(goal, idx) in content.growth.shortTerm" :key="idx">
              {{ goal }}
            </li>
          </ul>
        </div>
        <div class="growth-plan-card long-term">
          <h3>🎯 长期目标</h3>
          <ul>
            <li v-for="(goal, idx) in content.growth.longTerm" :key="idx">
              {{ goal }}
            </li>
          </ul>
        </div>
      </div>
      <div class="growth-habits">
        <h3>🔄 推荐习惯</h3>
        <div class="habits-list">
          <div
            v-for="(habit, idx) in content.growth.habits"
            :key="idx"
            class="habit-item"
          >
            <span class="habit-name">{{ habit.name }}</span>
            <span class="habit-frequency">({{ habit.frequency }})</span>
            <p class="habit-description">{{ habit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Plan Section -->
    <section class="content-section">
      <div class="section-header">
        <span class="section-icon">🚀</span>
        <h2 class="section-title">行动计划</h2>
      </div>
      <div class="action-plans">
        <div class="action-plan-card immediate">
          <h3>⚡ 立即行动</h3>
          <div class="action-list">
            <div
              v-for="(action, idx) in content.actionPlan.immediate"
              :key="idx"
              class="action-item"
              :class="`priority-${action.priority}`"
            >
              <span class="action-priority">[{{ action.priority }}]</span>
              <span class="action-text">{{ action.action }}</span>
              <span class="action-timeline">{{ action.timeline }}</span>
            </div>
          </div>
        </div>
        <div class="action-plan-card ongoing">
          <h3>📈 持续行动</h3>
          <div class="action-list">
            <div
              v-for="(action, idx) in content.actionPlan.ongoing"
              :key="idx"
              class="action-item"
              :class="`priority-${action.priority}`"
            >
              <span class="action-priority">[{{ action.priority }}]</span>
              <span class="action-text">{{ action.action }}</span>
              <span class="action-timeline">{{ action.timeline }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AIAnalysisResult } from '../../types/ai.types';

defineProps<{
  content: AIAnalysisResult;
}>();
</script>

<style scoped>
.ai-analysis-content {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 4rem;
}

.content-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.section-icon {
  font-size: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Overview */
.overview-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
}

.mbti-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mbti-summary {
  font-size: 1.1rem;
  color: var(--color-primary-light);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.key-points {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.key-point {
  padding: 0.5rem 1rem;
  background: rgba(124, 111, 247, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--color-primary-light);
}

/* Strengths */
.strengths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.strength-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.strength-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary-light);
  margin-bottom: 0.5rem;
}

.strength-description {
  font-size: 0.95rem;
  color: #b8b8d4;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.application-section {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.application-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.application-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.application-list li {
  padding: 0.5rem 0;
  color: #b8b8d4;
  position: relative;
  padding-left: 1.5rem;
}

.application-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

/* Weaknesses */
.weaknesses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.weakness-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.weakness-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e09f7a;
  margin-bottom: 0.5rem;
}

.weakness-description {
  font-size: 0.95rem;
  color: #b8b8d4;
  line-height: 1.6;
}

.strategies-section {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.strategies-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.strategies-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strategies-list li {
  padding: 0.5rem 0;
  color: #b8b8d4;
  position: relative;
  padding-left: 1.5rem;
}

.strategies-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

/* Career */
.career-matches,
.career-paths,
.career-recommendations {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.career-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.career-match-item {
  padding: 1rem;
  background: rgba(124, 111, 247, 0.05);
  border-radius: var(--radius-sm);
}

.career-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.career-role {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.career-score {
  padding: 0.25rem 0.75rem;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
}

.career-reason {
  font-size: 0.9rem;
  color: #b8b8d4;
}

/* Relationships */
.relationships-content {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.relationship-style {
  font-size: 1.1rem;
  color: var(--color-primary-light);
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
}

.rel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.rel-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.rel-card h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.rel-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rel-card li {
  padding: 0.25rem 0;
  color: #b8b8d4;
  font-size: 0.9rem;
}

.relationship-advice {
  background: rgba(124, 111, 247, 0.05);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.relationship-advice h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.relationship-advice ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.relationship-advice li {
  padding: 0.5rem 0;
  color: #b8b8d4;
  position: relative;
  padding-left: 1.5rem;
}

.relationship-advice li::before {
  content: '💡';
  position: absolute;
  left: 0;
}

/* Growth */
.growth-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.growth-plan-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.growth-plan-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.growth-plan-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.growth-plan-card li {
  padding: 0.5rem 0;
  color: #b8b8d4;
  position: relative;
  padding-left: 1.5rem;
}

.growth-plan-card.short-term li::before {
  content: '📅';
  position: absolute;
  left: 0;
}

.growth-plan-card.long-term li::before {
  content: '🎯';
  position: absolute;
  left: 0;
}

.growth-habits {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.growth-habits h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.habit-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.habit-name {
  font-weight: 600;
  color: var(--color-primary-light);
}

.habit-frequency {
  font-size: 0.85rem;
  color: #6868a0;
  font-style: italic;
}

.habit-description {
  color: #b8b8d4;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Action Plan */
.action-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.action-plan-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.action-plan-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  align-items: center;
}

.action-priority {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.priority-high {
  background: #e74c3c;
  color: white;
}

.priority-medium {
  background: #f39c12;
  color: white;
}

.priority-low {
  background: #3498db;
  color: white;
}

.action-text {
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text);
}

.action-timeline {
  font-size: 0.85rem;
  color: #6868a0;
  font-style: italic;
}
</style>
