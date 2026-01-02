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
    const hasUser = Boolean(user);
    const hasProfileImageUrl = Boolean((user as any)?.profileImageUrl);

    // user가 있고 profileImageUrl도 있으면 더 할 게 없음
    if (hasUser && hasProfileImageUrl) {
      if (DEV) {
        console.info("[ProfileDebug] hydrate skipped (user + profileImageUrl present)", {
          id: (user as any)?.id,
          profileImageUrl: (user as any)?.profileImageUrl,
        });
      }
      return;
    }

    // user는 있는데 profileImageUrl이 없으면(새로고침 후 default로 고정되는 케이스) 복구를 시도
    if (hasUser && !hasProfileImageUrl && DEV) {
      console.warn("[ProfileDebug] user present but profileImageUrl missing; attempting repair", {
        id: (user as any)?.id,
        keys: user ? Object.keys(user as any) : [],
      });
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
        const parsed = JSON.parse(raw) as any;
        if (!parsed || typeof parsed !== "object") return;

        // profileImage -> profileImageUrl 정규화(이전 값 호환)
        if (!parsed.profileImageUrl && typeof parsed.profileImage === "string") {
          parsed.profileImageUrl = parsed.profileImage;
        }
        if (typeof parsed.profileImage !== "undefined") {
          delete parsed.profileImage;
        }

        if (DEV) {
          console.info("[ProfileDebug] hydrate from sessionStorage(auth_user)", {
            id: (parsed as any)?.id,
            hasProfileImageUrl: Boolean((parsed as any)?.profileImageUrl),
            profileImageUrl: (parsed as any)?.profileImageUrl,
          });
        }

        // sessionStorage 값에 profileImageUrl이 있으면 store로 복원
        if (parsed.profileImageUrl) {
          setUser(parsed);
          return;
        }

        // sessionStorage(user)는 있는데 profileImageUrl이 없는 경우 → 토큰 기반 재조회로 보강
        if (DEV) {
          console.warn(
            "[ProfileDebug] auth_user exists but profileImageUrl missing; fallback fetch",
            {
              id: parsed.id,
            }
          );
        }
      }

      // Fallback: access_token(JWT)에서 sub를 뽑아서 유저 재조회
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
