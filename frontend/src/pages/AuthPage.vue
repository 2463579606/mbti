<template>
  <div class="auth-page">
    <!-- Login Form -->
    <div v-if="mode === 'login'" class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">✦</div>
          <h1>欢迎回来</h1>
          <p>登录以查看你的测试历史</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login-email">邮箱地址</label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="login-password">密码</label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="auth-footer">
            还没有账号？
            <a @click="mode = 'register'">立即注册</a>
          </div>
        </form>
      </div>
    </div>

    <!-- Register Form -->
    <div v-else class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">✦</div>
          <h1>创建账号</h1>
          <p>注册以保存你的测试历史</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="register-email">邮箱地址</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="register-nickname">昵称（可选）</label>
            <input
              id="register-nickname"
              v-model="registerForm.nickname"
              type="text"
              placeholder="你的昵称"
            />
          </div>

          <div class="form-group">
            <label for="register-password">密码</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              placeholder="至少8位字符"
              minlength="8"
              required
            />
          </div>

          <div class="form-group">
            <label for="register-confirm">确认密码</label>
            <input
              id="register-confirm"
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              minlength="8"
              required
            />
          </div>

          <div class="form-checkbox">
            <input id="terms" type="checkbox" required />
            <label for="terms">
              我同意
              <a href="#" @click.prevent>服务条款</a>
              和
              <a href="#" @click.prevent>隐私政策</a>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>

          <div class="auth-footer">
            已有账号？
            <a @click="mode = 'login'">立即登录</a>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();

const mode = ref<'login' | 'register'>('login');
const loading = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

const registerForm = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
});

async function handleLogin() {
  loading.value = true;
  try {
    // TODO: Call login API
    console.log('Login:', loginForm);
    // Simulate login
    setTimeout(() => {
      loading.value = false;
      router.push('/');
    }, 1000);
  } catch (error) {
    console.error('Login failed:', error);
    loading.value = false;
  }
}

async function handleRegister() {
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('密码不一致');
    return;
  }

  loading.value = true;
  try {
    // TODO: Call register API
    console.log('Register:', registerForm);
    // Simulate register
    setTimeout(() => {
      loading.value = false;
      mode.value = 'login';
    }, 1000);
  } catch (error) {
    console.error('Register failed:', error);
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--gradient-hero);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-card);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.auth-header p {
  font-size: 0.9rem;
  color: #b8b8d4;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.form-checkbox label {
  font-size: 0.85rem;
  color: #b8b8d4;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-checkbox a {
  color: var(--color-primary-light);
  text-decoration: none;
}

.form-checkbox a:hover {
  text-decoration: underline;
}

.btn-full {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 0.9rem;
  color: #6868a0;
}

.auth-footer a {
  color: var(--color-primary-light);
  cursor: pointer;
  margin-left: 0.25rem;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
