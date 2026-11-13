"use client";

import { useEffect, useState } from "react";

/** Server-aligned "now", re-rendering every `intervalMs`. */
export function useServerNow(offset: number, intervalMs = 100): number {
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offset), intervalMs);
    return () => clearInterval(id);
  }, [offset, intervalMs]);
  return now;
}

/** Milliseconds remaining until `deadline` (server clock), never negative. */
export function useCountdown(deadline: number | null | undefined, offset: number, intervalMs = 100) {
  const now = useServerNow(offset, intervalMs);
  if (!deadline) return { msLeft: 0, secondsLeft: 0, done: true, now };
  const msLeft = Math.max(0, deadline - now);
  return { msLeft, secondsLeft: Math.ceil(msLeft / 1000), done: msLeft <= 0, now };
}
