"use client";

import { createAuthClient } from "@neon/auth/next";

/** Browser auth client. Talks to /api/auth (same origin), which proxies to Neon Auth. */
export const authClient = createAuthClient();
