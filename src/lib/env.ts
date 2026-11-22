/** App configuration from environment variables, validated at access time. */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (see .env.example)`);
  }
  return value;
}

export const env = {
  /** Backend origin, e.g. http://localhost:8080 */
  apiBaseUrl: () => required("NEXT_PUBLIC_API_BASE_URL"),
  /** Origin this app is served from, e.g. http://localhost:3000 */
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
