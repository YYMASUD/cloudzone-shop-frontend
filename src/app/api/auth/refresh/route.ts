import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, REFRESH_COOKIE, jsonError } from "@/lib/auth/cookie";

/**
 * Silent refresh: reads the httpOnly cookie, calls the backend /auth/refresh,
 * re-sets the cookie with the new refresh token, and returns the new access token.
 * Never exposes the refresh token to client JS.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return jsonError("no session", 401, "no_session");
  }

  let backend: { accessToken?: string; refreshToken?: string; expiresIn?: number };
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      const res2 = NextResponse.json(
        { code: "invalid_session", message: "Session expired" },
        { status: 401 },
      );
      res2.cookies.delete(REFRESH_COOKIE);
      return res2;
    }
    backend = await res.json();
  } catch {
    return jsonError("backend unreachable", 502, "backend_unreachable");
  }

  if (!backend.accessToken || !backend.refreshToken) {
    return jsonError("backend returned incomplete tokens", 502, "backend_error");
  }

  const res = NextResponse.json({
    accessToken: backend.accessToken,
    expiresIn: backend.expiresIn ?? 0,
  });
  res.cookies.set(REFRESH_COOKIE, backend.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
