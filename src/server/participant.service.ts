import { and, eq, lt, sql } from "drizzle-orm";
import type { DbOrTx } from "@/lib/db/client";
import { games, participants, type Game, type Participant } from "@/lib/db/schema";
import { generateToken, hashToken, isPlausibleToken, safeEqualHex } from "@/lib/auth/tokens";
import { nameKey } from "@/lib/validation/normalize";
import { HEARTBEAT_WRITE_MS, MAX_PARTICIPANTS } from "@/lib/game-engine/state-machine";
import { clock } from "@/lib/utils/clock";
import { fail } from "./errors";

export const DISPLAY_NAME_MAX = 20;
export const AVATAR_COUNT = 12;

export function sanitizeDisplayName(raw: unknown): string {
  if (typeof raw !== "string") fail("BAD_REQUEST", "Enter a display name.");
  const name = (raw as string)
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 1) fail("BAD_REQUEST", "Enter a display name.");
  if (name.length > DISPLAY_NAME_MAX) fail("BAD_REQUEST", `Display names can be up to ${DISPLAY_NAME_MAX} characters.`);
  return name;
}

export async function getGameByCode(db: DbOrTx, code: string): Promise<Game> {
  const normalized = code.trim().toUpperCase();
  const [game] = await db.select().from(games).where(eq(games.gameCode, normalized)).limit(1);
  if (!game) fail("NOT_FOUND", "No game with that code. Check the link and try again.");
  return game!;
}

export async function authenticateParticipant(db: DbOrTx, game: Game, token: unknown): Promise<Participant> {
  if (!isPlausibleToken(token)) fail("UNAUTHORIZED", "Join the game to continue.");
  const [p] = await db
    .select()
    .from(participants)
    .where(and(eq(participants.gameId, game.id), eq(participants.sessionTokenHash, hashToken(token as string))))
    .limit(1);
  if (!p) fail("UNAUTHORIZED", "Your session for this game has expired. Join again.");
  return p!;
}

export function isModerator(game: Game, token: unknown): boolean {
  return isPlausibleToken(token) && safeEqualHex(hashToken(token), game.moderatorTokenHash);
}

export function assertModerator(game: Game, token: unknown) {
  if (!isModerator(game, token)) fail("FORBIDDEN", "Only the host can do that.");
}

/** Updates last-seen at most every few seconds per player to keep heartbeats cheap. */
export async function heartbeat(db: DbOrTx, participant: Participant) {
  const now = clock.now();
  if (now - participant.lastSeenAt.getTime() < HEARTBEAT_WRITE_MS && participant.isConnected) return;
  await db
    .update(participants)
    .set({ lastSeenAt: new Date(now), isConnected: true })
    .where(and(eq(participants.id, participant.id), lt(participants.lastSeenAt, new Date(now - 1000))));
}

export async function joinGame(
  db: DbOrTx,
  game: Game,
  rawName: unknown,
  existingToken?: unknown,
): Promise<{ participant: Participant; token: string; reconnected: boolean }> {
  // Reconnect: a valid token for this game always gets you back in, whatever the phase.
  if (isPlausibleToken(existingToken)) {
    const [existing] = await db
      .select()
      .from(participants)
      .where(and(eq(participants.gameId, game.id), eq(participants.sessionTokenHash, hashToken(existingToken))))
      .limit(1);
    if (existing) return { participant: existing, token: existingToken, reconnected: true };
  }

  if (game.currentState !== "LOBBY") {
    fail("WRONG_PHASE", "This game has already started. Ask the host to start a new one.");
  }
  const displayName = sanitizeDisplayName(rawName);
  const key = nameKey(displayName);

  const roster = await db
    .select({ id: participants.id, nameKey: participants.nameKey, avatar: participants.avatar })
    .from(participants)
    .where(eq(participants.gameId, game.id));
  if (roster.length >= MAX_PARTICIPANTS) fail("LIMIT_REACHED", "This lobby is full.");
  if (roster.some((r) => r.nameKey === key)) fail("CONFLICT", "Someone in this lobby already has that name.");

  // Spread avatars so neighbours rarely match.
  const used = new Map<number, number>();
  roster.forEach((r) => used.set(r.avatar, (used.get(r.avatar) ?? 0) + 1));
  let avatar = 0;
  let best = Infinity;
  const offset = Math.floor(Math.random() * AVATAR_COUNT);
  for (let i = 0; i < AVATAR_COUNT; i++) {
    const a = (i + offset) % AVATAR_COUNT;
    const c = used.get(a) ?? 0;
    if (c < best) {
      best = c;
      avatar = a;
    }
  }

  const token = generateToken();
  const now = clock.date();
  const inserted = await db
    .insert(participants)
    .values({
      gameId: game.id,
      displayName,
      nameKey: key,
      sessionTokenHash: hashToken(token),
      avatar,
      joinedAt: now,
      lastSeenAt: now,
    })
    .onConflictDoNothing()
    .returning();
  if (!inserted.length) fail("CONFLICT", "Someone in this lobby already has that name.");

  await bumpVersion(db, game.id);
  return { participant: inserted[0], token, reconnected: false };
}

export async function bumpVersion(db: DbOrTx, gameId: string) {
  await db.update(games).set({ stateVersion: sql`${games.stateVersion} + 1` }).where(eq(games.id, gameId));
}
