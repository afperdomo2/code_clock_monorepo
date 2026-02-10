import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import './plugins/yup-es';
import App from './App.vue';
import { useAuthStore } from './stores/auth';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Initialize auth store
const authStore = useAuthStore();
authStore.initialize();

app.mount('#app');
