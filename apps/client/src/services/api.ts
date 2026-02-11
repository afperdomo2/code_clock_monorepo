import axios from 'axios';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;
    const message = payload?.message;
    const status = error.response?.status;
    if (Array.isArray(message)) {
      return message[0] ?? 'Ocurrio un error inesperado.';
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (payload?.error) {
      return payload.error;
    }
    if (status === 403) {
      return 'No tienes permisos para realizar esta accion.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ??
          refreshClient
            .post<{ access_token: string }>('/auth/refresh')
            .then((res) => res.data.access_token)
            .finally(() => {
              refreshPromise = null;
            });

        const newToken = await refreshPromise;
        setAccessToken(newToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (refreshError instanceof Error) {
          refreshError.message = getApiErrorMessage(refreshError);
        }
        return Promise.reject(refreshError);
      }
    }

    if (error instanceof Error) {
      error.message = getApiErrorMessage(error);
    }
    return Promise.reject(error);
  },
);

export default api;
