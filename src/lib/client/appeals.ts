"use client";

import { ApiError } from "./api";

export async function appealAnswer(topicId: number, text: string, note?: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/appeals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, text, note }),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "You seem to be offline. Check your connection.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.code ?? "INTERNAL", body?.error?.message ?? "Something went wrong.");
  }
}
