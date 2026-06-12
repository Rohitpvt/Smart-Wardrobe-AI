import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in the environment variables.');
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for attaching tokens can be added here in Phase 2
api.interceptors.request.use((config) => {
  // Logic to get token from storage and attach it to headers
  return config;
});

// Response interceptor for handling token refresh can be added here in Phase 2
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 and refresh token logic
    return Promise.reject(error);
  }
);
