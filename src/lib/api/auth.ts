import { http } from "./client";
import type {
  AuthTokenResponse,
  ConfirmEmailRequest,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  UserProfileResponse,
} from "./types";

/**
 * The auth surface — the only unauthenticated business endpoints. Tokens are
 * returned in the body; the session store decides where they live (access in
 * memory, refresh in an httpOnly cookie via the /api/auth route handlers).
 */

export function register(body: RegisterRequest) {
  return http.post<AuthTokenResponse>("/auth/register", body, { anonymous: true });
}

export function login(body: LoginRequest) {
  return http.post<AuthTokenResponse>("/auth/login", body, { anonymous: true });
}

export function socialLogin(body: SocialLoginRequest) {
  return http.post<AuthTokenResponse>("/auth/social", body, { anonymous: true });
}

export function refreshToken(refreshToken: string) {
  return http.post<AuthTokenResponse>("/auth/refresh", { refreshToken }, { anonymous: true });
}

export function requestEmailVerification() {
  return http.post<void>("/auth/verify-email/request", undefined, { anonymous: false });
}

export function confirmEmail(body: ConfirmEmailRequest) {
  return http.post<void>("/auth/verify-email/confirm", body, { anonymous: true });
}

export function logout(refreshToken: string) {
  return http.post<void>("/auth/logout", { refreshToken }, { anonymous: true });
}

export function getMe() {
  return http.get<UserProfileResponse>("/auth/me");
}

export function updateProfile(body: Partial<Pick<UserProfileResponse, "firstName" | "lastName">>) {
  return http.patch<UserProfileResponse>("/api/users/me", body);
}
