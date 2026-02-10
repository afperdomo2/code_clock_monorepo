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
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

app.use(VueQueryPlugin, { queryClient });

// Initialize auth store
const authStore = useAuthStore();
authStore.initialize();

app.mount('#app');
