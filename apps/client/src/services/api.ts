import axios from 'axios';

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;
    const message = payload?.message;
    if (Array.isArray(message)) {
      return message[0] ?? 'Ocurrio un error inesperado.';
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (payload?.error) {
      return payload.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof Error) {
      error.message = getApiErrorMessage(error);
    }
    return Promise.reject(error);
  },
);

export default api;
