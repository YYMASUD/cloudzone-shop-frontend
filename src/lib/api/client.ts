import { ApiClientError, ApiNetworkError } from "./errors";
import type { ApiError } from "./types";

/** Origin of the Spring Boot backend, e.g. http://localhost:8080 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type QueryValue = string | number | boolean | undefined | null;

/** Serializes defined, non-null params into a query string (no leading "?" when empty). */
export function toQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Loosens an interface into an index-signature record for toQuery(). */
export function query<T extends object>(params: T): Record<string, QueryValue> {
  return params as Record<string, QueryValue>;
}

// ── token plumbing ───────────────────────────────────────────────────────────

/**
 * The session store registers these so the client can read the in-memory access
 * token and, on a 401, obtain a fresh one. Decoupled via setters to avoid a
 * circular import between lib/api and the Zustand store.
 */
type TokenAccessors = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
};

let accessors: TokenAccessors = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  onAuthFailure: () => {},
};

export function configureAuth(next: Partial<TokenAccessors>) {
  accessors = { ...accessors, ...next };
}

// ── core request ─────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable body; FormData passes through untouched. */
  body?: unknown;
  /** Skip attaching the Authorization header (auth + public endpoints). */
  anonymous?: boolean;
  /** Internal: prevents infinite refresh loops on the retried request. */
  _retried?: boolean;
}

/**
 * Single-flight refresh: concurrent 401s share one refresh call instead of
 * hammering the refresh endpoint (and racing to invalidate each other's token).
 */
let refreshInFlight: Promise<string | null> | null = null;

function refreshOnce(): Promise<string | null> {
  refreshInFlight ??= accessors.refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function parseError(response: Response): Promise<never> {
  let body: ApiError | undefined;
  try {
    body = (await response.json()) as ApiError;
  } catch {
    body = undefined;
  }
  throw new ApiClientError(
    response.status,
    body?.code ?? `http_${response.status}`,
    body?.message ?? response.statusText ?? "Request failed",
    body,
    body?.path,
  );
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, anonymous, _retried, headers, ...init } = options;

  const finalHeaders = new Headers(headers);
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    // Let the browser set the multipart boundary.
    payload = body;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  if (!anonymous) {
    const token = accessors.getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: finalHeaders,
      body: payload,
      credentials: "omit",
    });
  } catch {
    throw new ApiNetworkError();
  }

  if (response.status === 401 && !anonymous && !_retried) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
    accessors.onAuthFailure();
    return parseError(response);
  }

  if (!response.ok) {
    return parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Convenience helpers used by the endpoint modules. */
export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
