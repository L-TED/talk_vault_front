import { create } from "zustand";
import { User } from "@/types/auth.types";

// ZUSTAND STORE
// 유저 프로필 정보 & 로그인 여부 상태 관리 (토큰 X)

interface AuthState {
  user: Omit<User, "password" | "refreshToken"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Omit<User, "password" | "refreshToken"> | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: (user: Omit<User, "password" | "refreshToken">) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  initialize: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),
}));
