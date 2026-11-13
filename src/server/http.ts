import { NextResponse } from "next/server";
import { getDb, type Db } from "@/lib/db/client";
import { isValidGameCode } from "@/lib/auth/tokens";
import { rateLimit } from "@/lib/utils/rate-limit";
import { GameError, fail } from "./errors";

export const MODERATOR_HEADER = "x-moderator-token";
export const SESSION_HEADER = "x-session-token";

export type CodeParams = { params: Promise<{ code: string }> };

export function json<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) } });
}

export function clientIp(req: Request): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export function limit(key: string, max: number, windowMs: number) {
  if (!rateLimit(key, max, windowMs)) fail("RATE_LIMITED", "Slow down a little and try again.");
}

const MAX_BODY_BYTES = 16 * 1024;

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) fail("BAD_REQUEST", "Request is too large.");
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) fail("BAD_REQUEST", "Request is too large.");
  if (!text) return {} as T;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    return parsed as T;
  } catch {
    return fail("BAD_REQUEST", "Malformed JSON body.");
  }
}

export async function readCode(ctx: CodeParams): Promise<string> {
  const { code } = await ctx.params;
  const upper = (code ?? "").toUpperCase();
  if (!isValidGameCode(upper)) fail("NOT_FOUND", "No game with that code. Check the link and try again.");
  return upper;
}

/** Wraps a route handler: injects the DB and turns GameErrors into clean JSON errors. */
export function route<C>(fn: (req: Request, ctx: C, db: Db) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      const db = await getDb();
      return await fn(req, ctx, db);
    } catch (err) {
      if (err instanceof GameError) {
        return json({ error: { code: err.code, message: err.message } }, { status: err.status });
      }
      console.error("[listoff] Unhandled API error", err);
      return json(
        { error: { code: "INTERNAL", message: "Something went wrong on our side. Try again." } },
        { status: 500 },
      );
    }
  };
}
