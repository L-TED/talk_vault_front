"use client";

import { useEffect } from "react";
import { useAuthStore, AUTH_USER_STORAGE_KEY } from "@/store/auth.store";
import type { User } from "@/types/auth.types";
import { usersApi } from "@/lib/api";

const DEV = process.env.NODE_ENV !== "production";

const base64UrlDecode = (input: string): string => {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
};

const getJwtSub = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json) as { sub?: string };
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
};

export default function AuthHydrator() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (DEV) {
        console.info("[ProfileDebug] hydrate skipped (store already has user)", {
          id: (user as any)?.id,
          hasProfileImageUrl: Boolean((user as any)?.profileImageUrl),
        });
      }
      return;
    }

    try {
      const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (DEV) {
        console.info("[ProfileDebug] hydrate start", {
          hasAuthUser: Boolean(raw),
          authUserLength: raw?.length ?? 0,
          hasAccessToken: Boolean(sessionStorage.getItem("access_token")),
        });
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Omit<User, "password" | "refreshToken">;
        if (!parsed || typeof parsed !== "object") return;

        if (DEV) {
          console.info("[ProfileDebug] hydrate from sessionStorage(auth_user)", {
            id: (parsed as any)?.id,
            hasProfileImageUrl: Boolean((parsed as any)?.profileImageUrl),
            profileImageUrl: (parsed as any)?.profileImageUrl,
          });
        }

        // sessionStorage에 남아있는 유저 정보를 store로 복원
        setUser(parsed);
        return;
      }

      // Fallback: auth_user가 없으면 access_token(JWT)에서 sub를 뽑아서 유저 재조회
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        if (DEV) console.warn("[ProfileDebug] no auth_user and no access_token");
        return;
      }

      const sub = getJwtSub(token);
      if (!sub) {
        if (DEV) console.warn("[ProfileDebug] access_token has no sub");
        return;
      }

      if (DEV) console.info("[ProfileDebug] fallback fetch user by sub", { sub });

      (async () => {
        try {
          const fetched = await usersApi.getUserById(sub);
          if (DEV) {
            console.info("[ProfileDebug] fetched user", {
              id: (fetched as any)?.id,
              email: (fetched as any)?.email,
              profileImageUrl: (fetched as any)?.profileImageUrl,
            });
          }

          // getUserById는 profileImage -> profileImageUrl 정규화를 수행함
          setUser(fetched as any);
        } catch (e) {
          if (DEV) console.error("[ProfileDebug] failed to fetch user", e);
        }
      })();
    } catch {
      // ignore
    }
  }, [user, setUser]);

  return null;
}
