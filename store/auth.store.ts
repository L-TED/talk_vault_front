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

export const AUTH_USER_STORAGE_KEY = "auth_user";

type StoredUser = Omit<User, "password" | "refreshToken"> & {
  // 과거/다른 응답 형태 호환
  profileImage?: string;
};

const normalizeStoredUser = (value: unknown): Omit<User, "password" | "refreshToken"> | null => {
  if (!value || typeof value !== "object") return null;
  const anyUser = value as StoredUser;
  // profileImage -> profileImageUrl 정규화
  if (!anyUser.profileImageUrl && typeof anyUser.profileImage === "string") {
    (anyUser as any).profileImageUrl = anyUser.profileImage;
  }
  // 불필요 키 제거
  delete (anyUser as any).profileImage;
  return anyUser as Omit<User, "password" | "refreshToken">;
};

const loadStoredUser = (): Omit<User, "password" | "refreshToken"> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredUser(parsed);
    return normalized;
  } catch {
    return null;
  }
};

const persistUser = (user: Omit<User, "password" | "refreshToken"> | null) => {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return;
    }
    // 저장 전에도 형태 정규화(이전 구조로 저장된 값이 남지 않게)
    const normalized = normalizeStoredUser(user) || user;
    sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalized));
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
