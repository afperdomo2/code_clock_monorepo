import { defineStore } from 'pinia';
import Swal from 'sweetalert2';
import { computed, ref } from 'vue';
import api, { getApiErrorMessage, setAccessToken } from '../services/api';

type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export const useAuthStore = defineStore('auth', () => {
  const userEmail = ref<string | null>(localStorage.getItem('userEmail'));
  const accessToken = ref<string | null>(null);
  const loading = ref(false);
  const needsSetup = ref<boolean | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const initialize = async () => {
    try {
      loading.value = true;
      const { data } = await api.get<{ needsSetup: boolean }>('/setup');
      needsSetup.value = data.needsSetup;

      if (!data.needsSetup) {
        try {
          const refresh = await api.post<{ access_token: string }>('/auth/refresh');
          accessToken.value = refresh.data.access_token;
          setAccessToken(refresh.data.access_token);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (refreshError) {
          setAccessToken(null);
          accessToken.value = null;
        }
      }
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
    setAccessToken(data.access_token);
    userEmail.value = email;
    localStorage.setItem('userEmail', email);
  };

  const registerFirstUser = async (payload: RegisterPayload) => {
    await api.post('/setup/register', payload);
    needsSetup.value = false;
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      accessToken.value = null;
      userEmail.value = null;
      setAccessToken(null);
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
