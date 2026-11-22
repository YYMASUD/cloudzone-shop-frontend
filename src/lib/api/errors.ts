import type { ApiError } from "./types";

/** Thrown for any non-2xx response. Carries the backend's ApiError body when present. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly path?: string;
  readonly body?: ApiError;

  constructor(status: number, code: string, message: string, body?: ApiError, path?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.body = body;
    this.path = path;
  }

  /** True when the caller should authenticate to retry. */
  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

/** Network-level failure (server unreachable, DNS, CORS preflight rejected). */
export class ApiNetworkError extends Error {
  constructor(message = "Cannot reach the API. Is the backend running?") {
    super(message);
    this.name = "ApiNetworkError";
  }
}
