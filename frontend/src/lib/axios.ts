import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in the environment variables.');
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for CSRF token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
      if (match) {
        config.headers['X-CSRF-Token'] = match[2];
      }
    }
  }
  return config;
});

// Avoid infinite refresh loops
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it's a 401 and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't intercept auth endpoints
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Global Error Formatting for UI mutations
    if (error.response) {
      const data = error.response.data as any;
      // FastAPI wraps HTTPException detail in data.detail; support both shapes
      const detail = data?.detail ?? data;

      if (
        error.response.status === 403 && 
        (detail?.status === 'provider_required' || detail?.action === 'quota_exceeded' || detail?.error_code === 'quota_exceeded')
      ) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('ai_quota_exceeded', { detail: detail }));
        }
      }
    } else {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);
