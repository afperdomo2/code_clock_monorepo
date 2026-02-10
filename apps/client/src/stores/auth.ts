import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api, { getApiErrorMessage } from '../services/api';
import Swal from 'sweetalert2';

type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export const useAuthStore = defineStore('auth', () => {
  const userEmail = ref<string | null>(localStorage.getItem('userEmail'));
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const loading = ref(false);
  const needsSetup = ref<boolean | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const initialize = async () => {
    try {
      loading.value = true;
      const { data } = await api.get<{ needsSetup: boolean }>('/setup');
      needsSetup.value = data.needsSetup;
    } catch (error) {
      console.error('Failed to check setup status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getApiErrorMessage(error),
      });
      needsSetup.value = false;
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', {
      email,
      password,
    });
    accessToken.value = data.access_token;
    localStorage.setItem('accessToken', data.access_token);
    userEmail.value = email;
    localStorage.setItem('userEmail', email);
  };

  const registerFirstUser = async (payload: RegisterPayload) => {
    await api.post('/setup/register', payload);
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      accessToken.value = null;
      userEmail.value = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
    }
  };

  return {
    userEmail,
    accessToken,
    loading,
    needsSetup,
    initialized,
    isAuthenticated,
    initialize,
    login,
    registerFirstUser,
    signOut,
  };
});
