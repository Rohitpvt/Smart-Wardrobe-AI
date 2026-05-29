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

  uploads: {
    presign: (data: { file_name: string; file_type: string; upload_context: string; temp_id: string }) => 
      request<{ upload_url: string; fields: Record<string, string>; s3_key: string }>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  clothing: {
    create: (data: any) => request("/clothing", { method: "POST", body: JSON.stringify(data) }),
    list: (query?: Record<string, string>) => {
      const searchParams = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v) searchParams.append(k, v);
        });
      }
      const qs = searchParams.toString();
      return request(`/clothing${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request(`/clothing/${id}`),
    update: (id: string, data: any) => request(`/clothing/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/clothing/${id}`, { method: "DELETE" }),
  },

  ai: {
    analyzeClothing: (data: { s3_key: string; user_hints?: string }) =>
      request<any>("/ai/analyze-clothing", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  recommendations: {
    generateOutfit: (data: {
      selected_item_id?: string;
      preferred_type?: string;
      occasion?: string;
      weather?: string;
      gender_style?: string;
    }) =>
      request<any>("/recommendations/outfit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  weather: {
    current: (location?: string) => {
      const params = location ? `?location=${encodeURIComponent(location)}` : "";
      return request<any>(`/weather/current${params}`);
    },
    outfit: (data: {
      location?: string;
      occasion?: string;
      gender_style?: string;
    }) =>
      request<any>("/weather/outfit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  outfits: {
    save: (data: any) => request<any>("/outfits/save", { method: "POST", body: JSON.stringify(data) }),
    getSaved: () => request<any[]>("/outfits/saved"),
    getHistory: () => request<any[]>("/outfits/history"),
    markWorn: (data: any) => request<any>("/outfits/mark-worn", { method: "POST", body: JSON.stringify(data) }),
  },

  analytics: {
    dashboard: () => request<any>("/analytics/dashboard"),
  },
};

export default api;
