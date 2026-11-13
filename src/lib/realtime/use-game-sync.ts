"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type Auth } from "@/lib/client/api";
import type { GameSnapshot, GameState } from "@/types/game";

/**
 * Real-time game sync over versioned polling.
 *
 * The server is authoritative and stateless between requests (all state lives in Postgres), so this
 * works on serverless hosting with no socket server. Every poll doubles as a heartbeat and as the
 * trigger for due phase transitions. When nothing changed, the server answers with a ~60-byte
 * "unchanged" reply, so polling quickly during live phases stays cheap.
 */
const FAST_STATES: GameState[] = ["PREDICTION", "TOPIC_REVEAL", "ANSWERING", "ROUND_PROCESSING"];
const FAST_MS = 700;
const SLOW_MS = 1500;
const HIDDEN_MS = 4000;
const FULL_REFRESH_MS = 5000;

export interface GameSync {
  snapshot: GameSnapshot | null;
  /** serverNow - clientNow, so countdowns follow the server clock. */
  offset: number;
  connected: boolean;
  error: ApiError | null;
  refresh: () => void;
}

export function useGameSync(code: string, auth: Auth | null): GameSync {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [offset, setOffset] = useState(0);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const versionRef = useRef<number | undefined>(undefined);
  const lastFullRef = useRef(0);
  const stateRef = useRef<GameState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightRef = useRef<AbortController | null>(null);
  const kickRef = useRef<() => void>(() => {});
  const authKey = auth ? `${auth.kind}:${"token" in auth ? auth.token : ""}` : "";

  useEffect(() => {
    if (!auth || auth.kind === "none") return;
    let stopped = false;
    versionRef.current = undefined;

    const schedule = (ms: number) => {
      if (stopped) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(tick, ms);
    };

    const tick = async () => {
      if (stopped) return;
      inflightRef.current?.abort();
      const ctrl = new AbortController();
      inflightRef.current = ctrl;
      const sentAt = Date.now();
      const wantFull = auth.kind === "host" || Date.now() - lastFullRef.current > FULL_REFRESH_MS;
      try {
        const res = await api.state(code, auth, wantFull ? undefined : versionRef.current, ctrl.signal);
        if (stopped) return;
        const rtt = Date.now() - sentAt;
        setOffset(res.serverNow + rtt / 2 - Date.now());
        setConnected(true);
        setError(null);
        if (!res.unchanged) {
          versionRef.current = res.version;
          lastFullRef.current = Date.now();
          stateRef.current = res.game.state;
          setSnapshot(res);
        }
      } catch (e) {
        if (stopped || (e instanceof DOMException && e.name === "AbortError")) return;
        const err = e instanceof ApiError ? e : new ApiError(0, "NETWORK", "Connection lost.");
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          setError(err);
          return; // fatal: stop polling, the page decides what to do
        }
        setConnected(false);
      }
      const hidden = typeof document !== "undefined" && document.hidden;
      const fast = stateRef.current && FAST_STATES.includes(stateRef.current);
      schedule(hidden ? HIDDEN_MS : fast ? FAST_MS : SLOW_MS);
    };

    kickRef.current = () => {
      lastFullRef.current = 0;
      schedule(0);
    };
    const onVisible = () => !document.hidden && kickRef.current();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    tick();

    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      inflightRef.current?.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, authKey]);

  const refresh = useCallback(() => kickRef.current(), []);
  return { snapshot, offset, connected, error, refresh };
}
