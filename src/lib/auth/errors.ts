/** Maps ApiClientError-ish values to a user-facing message. */
export function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message && message !== "Request failed") return message;
  }
  return "Something went wrong. Please try again.";
}

/** Groups backend validation messages when the API returns a field-oriented error. */
export function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 401
  );
}
