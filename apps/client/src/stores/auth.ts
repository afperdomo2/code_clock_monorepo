import { defineStore } from 'pinia';
import Swal from 'sweetalert2';
import { computed, ref } from 'vue';
import api, { getApiErrorMessage, isThrottledError, setAccessToken } from '../services/api';
import type { UserProfile } from '../types';

type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export const useAuthStore = defineStore('auth', () => {
  const userEmail = ref<string | null>(localStorage.getItem('userEmail'));
  const userProfile = ref<UserProfile | null>(null);
  const accessToken = ref<string | null>(null);
  const storedAdmin = localStorage.getItem('isAdmin');
  const isAdmin = ref<boolean | null>(
    storedAdmin === 'true' ? true : storedAdmin === 'false' ? false : null,
  );
  const loading = ref(false);
  const needsSetup = ref<boolean | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const isAdminUser = computed(() => isAdmin.value === true);

  const initialize = async () => {
    try {
      loading.value = true;
      const { data } = await api.get<{ needsSetup: boolean }>('/setup');
      needsSetup.value = data.needsSetup;

      if (!data.needsSetup) {
        try {
          const refresh = await api.post<{ access_token: string; is_admin: boolean }>(
            '/auth/refresh',
          );
          accessToken.value = refresh.data.access_token;
          setAccessToken(refresh.data.access_token);
          isAdmin.value = refresh.data.is_admin;
          localStorage.setItem('isAdmin', String(refresh.data.is_admin));
          await fetchProfile();
        } catch (refreshError) {
          if (isThrottledError(refreshError)) {
            return;
          }
          setAccessToken(null);
          accessToken.value = null;
          isAdmin.value = null;
          localStorage.removeItem('isAdmin');
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
    const { data } = await api.post<{ access_token: string; is_admin: boolean }>('/auth/login', {
      email,
      password,
    });
    accessToken.value = data.access_token;
    setAccessToken(data.access_token);
    isAdmin.value = data.is_admin;
    localStorage.setItem('isAdmin', String(data.is_admin));
    userEmail.value = email;
    localStorage.setItem('userEmail', email);
    await fetchProfile();
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
      userProfile.value = null;
      setAccessToken(null);
      isAdmin.value = null;
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userEmail');
    }
  };

  const fetchProfile = async () => {
    if (!accessToken.value) {
      return null;
    }
    const { data } = await api.get<UserProfile>('/users/me');
    userProfile.value = data;
    if (typeof data?.is_admin === 'boolean') {
      isAdmin.value = data.is_admin;
      localStorage.setItem('isAdmin', String(data.is_admin));
    }
    if (data?.email) {
      userEmail.value = data.email;
      localStorage.setItem('userEmail', data.email);
    }
    return data;
  };

  const updateProfile = async (payload: { email?: string; name?: string }) => {
    const { data } = await api.patch<UserProfile>('/users/me', payload);
    userProfile.value = data;
    if (typeof data?.is_admin === 'boolean') {
      isAdmin.value = data.is_admin;
      localStorage.setItem('isAdmin', String(data.is_admin));
    }
    if (data?.email) {
      userEmail.value = data.email;
      localStorage.setItem('userEmail', data.email);
    }
    return data;
  };

  const changePassword = async (payload: { current_password: string; new_password: string }) => {
    await api.post('/auth/change-password', payload);
  };

  return {
    userEmail,
    accessToken,
    loading,
    needsSetup,
    initialized,
    isAuthenticated,
    isAdmin,
    isAdminUser,
    initialize,
    login,
    registerFirstUser,
    signOut,
    userProfile,
    fetchProfile,
    updateProfile,
    changePassword,
  };
});
