"use client";

import { useEffect } from "react";
import { useAuthStore, AUTH_USER_STORAGE_KEY } from "@/store/auth.store";
import type { User } from "@/types/auth.types";

export default function AuthHydrator() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) return;

    try {
      const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Omit<User, "password" | "refreshToken">;
      if (!parsed || typeof parsed !== "object") return;

      // sessionStorage에 남아있는 유저 정보를 store로 복원
      setUser(parsed);
    } catch {
      // ignore
    }
  }, [user, setUser]);

  return null;
}
