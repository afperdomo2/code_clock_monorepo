import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout' },
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('../views/ProjectDetailView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout' },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout' },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout', requiresAdmin: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, layout: 'MainLayout' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/SetupView.vue'),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initialize();
  }

  if (authStore.needsSetup && to.path !== '/setup') {
    return { path: '/setup' };
  }

  if (to.path === '/setup' && authStore.needsSetup === false) {
    return { path: '/login' };
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' };
  }

  if (to.meta.requiresAdmin && !authStore.isAdminUser) {
    return { path: '/' };
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/' };
  }

  return true;
});

export default router;
