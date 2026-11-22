import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, REFRESH_COOKIE } from "@/lib/auth/cookie";

/**
 * Server-side logout: revokes the refresh token on the backend (proof of
 * ownership — the client never sees it) and clears the cookie.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Best-effort revocation; clear the cookie regardless.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
