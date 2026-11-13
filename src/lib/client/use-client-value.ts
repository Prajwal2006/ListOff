"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value (localStorage, window.location) without hydration mismatches:
 * the server render sees `serverValue`, the client sees `read()`. `read` must return a stable
 * primitive (string / number / null) so React can compare snapshots.
 */
export function useClientValue<T extends string | number | boolean | null | undefined>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, read, () => serverValue);
}
