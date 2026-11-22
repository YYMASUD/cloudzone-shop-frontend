import { NextResponse } from "next/server";

/** Name of the httpOnly cookie holding the refresh token. */
export const REFRESH_COOKIE = "cz_refresh";

/** Backend origin, server-side. Falls back to the public var. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/** Refresh-token cookie options: httpOnly so JS can never read it. */
export function refreshCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Default refresh lifetime when the backend does not advertise one. */
export const DEFAULT_REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function jsonError(message: string, status: number, code = "auth_error") {
  return NextResponse.json(
    { code, message, status, path: "", timestamp: new Date().toISOString() },
    { status },
  );
}
