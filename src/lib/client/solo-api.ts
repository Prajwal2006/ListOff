"use client";

import { ApiError } from "./api";
import type {
  LeaderboardResponse,
  LeaderboardScope,
  MeResponse,
  SoloAnswerResponse,
  SoloProfileView,
  SoloRoundView,
  UniversityView,
} from "@/types/solo";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK", "You seem to be offline. Check your connection.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(res.status, err?.code ?? "INTERNAL", err?.message ?? "Something went wrong.");
  }
  return body as T;
}

const post = <T>(path: string, data: unknown = {}) => call<T>(path, { method: "POST", body: JSON.stringify(data) });

export const soloApi = {
  me: () => call<MeResponse>("/api/me"),
  saveProfile: (p: { displayName: string; country: string; stateCode: string; universityId: number }) =>
    call<{ profile: SoloProfileView }>("/api/me/profile", { method: "PUT", body: JSON.stringify(p) }),
  universities: (country: string, state?: string, q?: string) => {
    const sp = new URLSearchParams({ country });
    if (state) sp.set("state", state);
    if (q) sp.set("q", q);
    return call<{ universities: UniversityView[] }>(`/api/universities?${sp}`);
  },
  addUniversity: (u: { name: string; country: string; stateCode: string }) =>
    post<{ university: UniversityView }>("/api/universities", u),
  start: () => post<{ round: SoloRoundView }>("/api/solo/rounds"),
  round: (id: string) => call<{ round: SoloRoundView }>(`/api/solo/rounds/${id}`),
  bid: (id: string, count: number) => post<{ round: SoloRoundView }>(`/api/solo/rounds/${id}/bid`, { count }),
  answer: (id: string, text: string) => post<SoloAnswerResponse>(`/api/solo/rounds/${id}/answers`, { text }),
  skip: (id: string) => post<{ ok: true }>(`/api/solo/rounds/${id}/skip`),
  leaderboard: (q: { scope: LeaderboardScope; country: string; state?: string; university?: number }) => {
    const sp = new URLSearchParams({ scope: q.scope, country: q.country });
    if (q.state) sp.set("state", q.state);
    if (q.university) sp.set("university", String(q.university));
    return call<LeaderboardResponse>(`/api/leaderboards?${sp}`);
  },
};
