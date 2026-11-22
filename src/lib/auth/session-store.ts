import { create } from "zustand";
import { configureAuth } from "@/lib/api/client";
import { authApi } from "@/lib/api";
import type { UserProfileResponse } from "@/lib/api/types";

/**
 * Client session state.
 *
 * The access token lives in memory only (never localStorage — a single XSS would
 * otherwise exfiltrate it). The refresh token is held by the browser as an httpOnly
 * cookie managed by the /api/auth route handlers, so JS can never read it either.
 * On a hard reload the in-memory access token is gone; `bootstrap()` silently
 * exchanges the cookie for a new one.
 */

interface SessionState {
  accessToken: string | null;
  user: UserProfileResponse | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  setSession: (accessToken: string, user: UserProfileResponse | null) => void;
  setUser: (user: UserProfileResponse) => void;
  clear: () => void;
  bootstrap: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  user: null,
  status: "idle",

  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),

  setUser: (user) => set({ user }),

  clear: () => set({ accessToken: null, user: null, status: "anonymous" }),

  bootstrap: async () => {
    if (get().status === "loading" || get().status === "authenticated") return;
    set({ status: "loading" });
    const token = await refreshSession();
    if (!token) {
      set({ status: "anonymous", accessToken: null, user: null });
      return;
    }
    set({ accessToken: token, status: "authenticated" });
    try {
      const user = await authApi.getMe();
      set({ user });
    } catch {
      // Token worked for refresh but profile fetch failed — treat as unauthenticated.
      set({ status: "anonymous", accessToken: null, user: null });
    }
  },
}));

/**
 * Calls our own Next route handler, which owns the refresh cookie. Returns the new
 * access token, or null when the session is not (or no longer) valid.
 */
async function refreshSession(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

/** Registers the client's token accessors once, at module load. */
configureAuth({
  getAccessToken: () => useSessionStore.getState().accessToken,
  refreshAccessToken: async () => {
    const token = await refreshSession();
    if (token) useSessionStore.setState({ accessToken: token, status: "authenticated" });
    return token;
  },
  onAuthFailure: () => useSessionStore.getState().clear(),
});

/** Non-hook accessor for use inside event handlers and route guards. */
export const session = {
  refresh: refreshSession,
  isAuthenticated: () => useSessionStore.getState().status === "authenticated",
  user: () => useSessionStore.getState().user,
};
