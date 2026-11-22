"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "./session-store";
import { authApi } from "@/lib/api";
import type { UserProfileResponse } from "@/lib/api/types";

/**
 * High-level session API for components: current user, auth actions, and a
 * bootstrap effect that restores the session from the refresh cookie on mount.
 */
export function useSession() {
  const router = useRouter();
  const { accessToken, user, status, setSession, setUser, clear, bootstrap } = useSessionStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login({ email, password });
      const me = await authApi.getMe();
      setSession(tokens.accessToken, me);
      await persistRefresh(tokens.refreshToken);
      return me;
    },
    [setSession],
  );

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      const tokens = await authApi.register({ email, password, firstName, lastName });
      const me = await authApi.getMe();
      setSession(tokens.accessToken, me);
      await persistRefresh(tokens.refreshToken);
      return me;
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clear();
      router.push("/");
      router.refresh();
    }
  }, [clear, router]);

  return { accessToken, user, status, login, register, logout, setUser };
}

/** Hands the refresh token to our route handler, which sets the httpOnly cookie. */
async function persistRefresh(refreshToken: string) {
  // The access token stays in the in-memory store; this only captures the
  // refresh token into an httpOnly cookie the browser's JS cannot read.
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new Error("Failed to persist session");
  }
}

export type { UserProfileResponse };
