import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_REFRESH_MAX_AGE,
  REFRESH_COOKIE,
  jsonError,
  refreshCookieOptions,
} from "@/lib/auth/cookie";

/**
 * Captures the refresh token issued by a direct /auth/login or /auth/register
 * call into an httpOnly cookie. The access token stays in the client's memory;
 * this route never sees or returns it. Never exposes the refresh token to JS.
 */
export async function POST(request: NextRequest) {
  let body: { refreshToken?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("malformed body", 400);
  }

  if (!body.refreshToken) {
    return jsonError("refreshToken is required", 400);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    REFRESH_COOKIE,
    body.refreshToken,
    refreshCookieOptions(DEFAULT_REFRESH_MAX_AGE),
  );
  return res;
}
