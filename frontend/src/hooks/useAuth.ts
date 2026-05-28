/**
 * Smart Wardrobe AI — useAuth Hook (Placeholder)
 *
 * Phase 2: Will provide authentication state and methods.
 * - isAuthenticated: boolean
 * - user: User | null
 * - login(email, password): Promise
 * - loginWithGoogle(): Promise
 * - register(data): Promise
 * - logout(): void
 */

"use client";

export function useAuth() {
  // Phase 2: Implement real auth logic
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: async (_email: string, _password: string) => {
      console.warn("Auth not implemented yet (Phase 2)");
    },
    logout: () => {
      console.warn("Auth not implemented yet (Phase 2)");
    },
  };
}
