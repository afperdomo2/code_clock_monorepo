import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './plugins/yup-es';
import router from './router';
import { useAuthStore } from './stores/auth';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mantener datos frescos durante 30s para evitar refetches rápidas en acciones de UI rápidas.
      staleTime: 30_000,
      // Mantener datos en caché durante 5 minutos después del último uso.
      gcTime: 5 * 60_000,
      // Un reintento es suficiente para problemas transitorios de red.
      retry: 1,
      // Evitar refetches sorpresa cuando se recupera la red.
      refetchOnReconnect: false,
      // Evitar refetching cuando la pestaña obtiene el foco.
      refetchOnWindowFocus: false,
    },
  },
});

app.use(VueQueryPlugin, { queryClient });

// Initialize auth store
const authStore = useAuthStore();
authStore.initialize();

app.mount('#app');
