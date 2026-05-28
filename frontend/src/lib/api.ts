/**
 * Smart Wardrobe AI — API Client
 *
 * Centralized API client for making requests to the FastAPI backend.
 * All API calls should go through this module.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Phase 2: Add JWT token to Authorization header
  // const token = getAccessToken();
  // if (token) {
  //   config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  // }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An unexpected error occurred",
    }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API methods organized by resource.
 */
export const api = {
  /** Health check */
  health: () => request<{ status: string; version: string; service: string }>("/health"),

  // Phase 2: Auth endpoints
  // auth: {
  //   login: (email: string, password: string) => request("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  //   register: (data: RegisterData) => request("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
  //   me: () => request("/api/v1/auth/me"),
  // },

  // Phase 2: Clothing endpoints
  // clothing: {
  //   list: () => request("/api/v1/clothing"),
  //   get: (id: string) => request(`/api/v1/clothing/${id}`),
  //   create: (data: CreateClothingData) => request("/api/v1/clothing", { method: "POST", body: JSON.stringify(data) }),
  //   uploadUrl: () => request("/api/v1/clothing/upload-url", { method: "POST" }),
  // },
};

export default api;
