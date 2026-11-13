"use client";

import type { AnswerSubmitResponse, ApiErrorBody, GameSnapshot, UnchangedSnapshot } from "@/types/game";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export type Auth = { kind: "player"; token: string } | { kind: "host"; token: string } | { kind: "none" };

function headers(auth: Auth): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (auth.kind === "player") h["x-session-token"] = auth.token;
  if (auth.kind === "host") h["x-moderator-token"] = auth.token;
  return h;
}

async function call<T>(path: string, init: RequestInit & { auth?: Auth; signal?: AbortSignal } = {}): Promise<T> {
  const { auth = { kind: "none" }, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, { ...rest, headers: headers(auth), cache: "no-store" });
  } catch {
    throw new ApiError(0, "NETWORK", "Connection lost. Retrying…");
  }
  const body = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok) {
    const err = (body as ApiErrorBody | null)?.error;
    throw new ApiError(res.status, err?.code ?? "HTTP_" + res.status, err?.message ?? "Something went wrong.");
  }
  return body as T;
}

const post = <T>(path: string, data: unknown, auth?: Auth) =>
  call<T>(path, { method: "POST", body: JSON.stringify(data), auth });

export const api = {
  createGame: (input: {
    name: string;
    hostName?: string;
    totalRounds: number;
    roundDuration: number;
    predictionDuration: number;
    categoryIds: number[] | null;
  }) => post<{ code: string; moderatorToken: string }>("/api/games", input),

  categories: () =>
    call<{ categories: { id: number; name: string; slug: string; icon: string; description: string; topicCount: number }[] }>(
      "/api/categories",
    ),

  preview: (code: string) =>
    call<{
      code: string;
      name: string;
      hostName: string | null;
      state: string;
      totalRounds: number;
      roundDuration: number;
      playerCount: number;
      joinable: boolean;
    }>(`/api/games/${code}/preview`),

  join: (code: string, displayName: string, token?: string) =>
    post<{ participantId: string; displayName: string; token: string; reconnected: boolean }>(
      `/api/games/${code}/join`,
      { displayName, token },
    ),

  state: (code: string, auth: Auth, version?: number, signal?: AbortSignal) =>
    call<GameSnapshot | UnchangedSnapshot>(
      `/api/games/${code}/state${version !== undefined ? `?v=${version}` : ""}`,
      { auth, signal },
    ),

  predict: (code: string, token: string, count: number) =>
    post<{ predictedCount: number }>(`/api/games/${code}/prediction`, { count }, { kind: "player", token }),

  answer: (code: string, token: string, text: string) =>
    post<AnswerSubmitResponse>(`/api/games/${code}/answers`, { text }, { kind: "player", token }),

  control: (code: string, token: string, action: "start" | "next" | "reveal" | "end" | "play-again") =>
    post<{ ok: true; nextGameCode?: string }>(`/api/games/${code}/control`, { action }, { kind: "host", token }),

  settings: (code: string, token: string, settings: Record<string, unknown>) =>
    call<{ ok: true }>(`/api/games/${code}/settings`, {
      method: "PATCH",
      body: JSON.stringify(settings),
      auth: { kind: "host", token },
    }),
};
