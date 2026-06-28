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
  // withCredentials is no longer needed since we use Bearer tokens via Clerk, not cookies
});

/**
 * Helper to get the Clerk session token.
 * Waits briefly for Clerk to initialize on first load to avoid race conditions.
 */
async function getClerkToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const clerk = (window as any).Clerk;
  if (!clerk) return null;

  // If Clerk is loaded but session isn't ready yet, wait briefly
  if (!clerk.session && clerk.loaded !== false) {
    // Clerk may still be initializing — wait up to 2s
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 100));
      if ((window as any).Clerk?.session) break;
    }
  }

  const session = (window as any).Clerk?.session;
  if (!session) return null;

  try {
    return await session.getToken();
  } catch {
    return null;
  }
}

// Request interceptor for Clerk token
api.interceptors.request.use(async (config) => {
  const token = await getClerkToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401s and AI Quota errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Clerk middleware and AuthGuard handle unauthenticated redirects.
    // We just pass the 401 error down so React Query can handle it or fail gracefully.
    if (error.response?.status === 401) {
      return Promise.reject(error);
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
