import { LoginData, RegisterData } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Generic fetch wrapper with error handling and automatic Bearer token injection.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only run localStorage on client-side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * API methods organized by resource.
 */
export const api = {
  health: () => request<{ status: string; version: string; service: string }>("/health"),

  auth: {
    login: (data: LoginData) => request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: RegisterData) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => request("/auth/me"),
    updateProfile: (data: any) => request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
    googleUrl: () => request<{ url: string }>("/auth/google"),
    googleCallback: (code: string) => request<{ access_token: string }>(`/auth/google/callback?code=${code}`),
  },

  // Future Clothing endpoints
  // clothing: {
  //   list: () => request("/clothing"),
  // },
};

export default api;
