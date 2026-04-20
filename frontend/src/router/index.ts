import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('../pages/WelcomePage.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../pages/TestPage.vue'),
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => import('../pages/LoadingPage.vue'),
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('../pages/ResultPage.vue'),
  },
  {
    path: '/ai-analysis',
    name: 'ai-analysis',
    component: () => import('../pages/AIAnalysisPage.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../pages/AuthPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../pages/Admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Initialize user store if not already done
  if (!userStore.user && userStore.token) {
    try {
      await userStore.initialize();
    } catch (error) {
      // Invalid token, clear it
      userStore.clear();
    }
  }

  const requiresAuth = to.meta.requiresAuth;
  const requiresGuest = to.meta.requiresGuest;
  const requiresAdmin = to.meta.requiresAdmin;

  if (requiresAuth && !userStore.isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ name: 'auth', query: { redirect: to.fullPath } });
  } else if (requiresGuest && userStore.isAuthenticated) {
    // Redirect to home if logged in user tries to access guest route
    next({ name: 'welcome' });
  } else if (requiresAdmin && userStore.user?.email !== 'admin@mbti.com') {
    // Redirect non-admin users
    next({ name: 'welcome' });
  } else {
    next();
  }
});

export default router;
