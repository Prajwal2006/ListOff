import "server-only";
import { createNeonAuth, type NeonAuth } from "@neon/auth/next/server";

/** True when Neon Auth is configured for this deployment (accounts + solo mode available). */
export function authEnabled(): boolean {
  return !!process.env.NEON_AUTH_BASE_URL && (process.env.NEON_AUTH_COOKIE_SECRET?.length ?? 0) >= 32;
}

let instance: NeonAuth | null = null;

/** Lazily created so builds and tests without Neon Auth env vars still work. */
export function getAuth(): NeonAuth {
  if (!authEnabled()) throw new Error("Neon Auth is not configured (NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET).");
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
  return instance;
}
