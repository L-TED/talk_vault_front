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

const USER_STORAGE_KEY = "auth_user";

const loadStoredUser = (): Omit<User, "password" | "refreshToken"> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Omit<User, "password" | "refreshToken">;
  } catch {
    return null;
  }
};

const persistUser = (user: Omit<User, "password" | "refreshToken"> | null) => {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      sessionStorage.removeItem(USER_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = loadStoredUser();

  return {
    user: storedUser,
    isAuthenticated: Boolean(storedUser),
    isLoading: false,

    setUser: (user) => {
      persistUser(user);
      set({
        user,
        isAuthenticated: !!user,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    logout: () => {
      persistUser(null);
      set({
        user: null,
        isAuthenticated: false,
      });
    },

    initialize: (user) => {
      persistUser(user);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    },
  };
});
