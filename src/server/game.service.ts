import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { gameRounds, games, participants, type Game } from "@/lib/db/schema";
import { generateGameCode, generateToken, hashToken } from "@/lib/auth/tokens";
import {
  MAX_ROUNDS,
  MIN_ROUNDS,
  ROUND_DURATION_OPTIONS,
  dueTransition,
} from "@/lib/game-engine/state-machine";
import { clock } from "@/lib/utils/clock";
import { fail } from "./errors";
import { getGameByCode } from "./participant.service";
import { allConnectedPredicted, getRound, openAnswering, revealTopic, startRound } from "./round.service";
import { processRound, recomputeTotals } from "./scoring.service";

export interface GameSettingsInput {
  name?: unknown;
  hostName?: unknown;
  totalRounds?: unknown;
  roundDuration?: unknown;
  predictionDuration?: unknown;
  categoryIds?: unknown;
}

const PREDICTION_DURATION_OPTIONS = [15, 20, 30, 45, 60];

function parseSettings(input: GameSettingsInput, partial = false) {
  const out: Partial<Pick<Game, "name" | "hostName" | "totalRounds" | "roundDuration" | "predictionDuration" | "categoryIds">> = {};
  if (input.name !== undefined || !partial) {
    const name = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";
    if (!name) fail("BAD_REQUEST", "Give your game a name.");
    if (name.length > 40) fail("BAD_REQUEST", "Game names can be up to 40 characters.");
    out.name = name;
  }
  if (input.hostName !== undefined) {
    const h = typeof input.hostName === "string" ? input.hostName.replace(/\s+/g, " ").trim().slice(0, 20) : "";
    out.hostName = h || null;
  }
  if (input.totalRounds !== undefined || !partial) {
    const n = input.totalRounds ?? 5;
    if (typeof n !== "number" || !Number.isInteger(n) || n < MIN_ROUNDS || n > MAX_ROUNDS) {
      fail("BAD_REQUEST", `Rounds must be between ${MIN_ROUNDS} and ${MAX_ROUNDS}.`);
    }
    out.totalRounds = n as number;
  }
  if (input.roundDuration !== undefined || !partial) {
    const d = input.roundDuration ?? 20;
    if (!(ROUND_DURATION_OPTIONS as readonly number[]).includes(d as number)) {
      fail("BAD_REQUEST", `Round length must be one of ${ROUND_DURATION_OPTIONS.join(", ")} seconds.`);
    }
    out.roundDuration = d as number;
  }
  if (input.predictionDuration !== undefined || !partial) {
    const d = input.predictionDuration ?? 30;
    if (!PREDICTION_DURATION_OPTIONS.includes(d as number)) {
      fail("BAD_REQUEST", `Prediction time must be one of ${PREDICTION_DURATION_OPTIONS.join(", ")} seconds.`);
    }
    out.predictionDuration = d as number;
  }
  if (input.categoryIds !== undefined) {
    const ids = input.categoryIds;
    if (ids === null || (Array.isArray(ids) && ids.length === 0)) out.categoryIds = null;
    else if (Array.isArray(ids) && ids.length <= 100 && ids.every((i) => Number.isInteger(i) && i > 0)) {
      out.categoryIds = ids as number[];
    } else fail("BAD_REQUEST", "Invalid category selection.");
  }
  return out;
}

export async function createGame(db: Db, input: GameSettingsInput) {
  const settings = parseSettings(input) as Required<ReturnType<typeof parseSettings>>;
  const moderatorToken = generateToken();
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateGameCode();
    const [game] = await db
      .insert(games)
      .values({
        gameCode: code,
        moderatorTokenHash: hashToken(moderatorToken),
        name: settings.name,
        hostName: settings.hostName ?? null,
        totalRounds: settings.totalRounds,
        roundDuration: settings.roundDuration,
        predictionDuration: settings.predictionDuration,
        categoryIds: settings.categoryIds ?? null,
        createdAt: clock.date(),
      })
      .onConflictDoNothing()
      .returning();
    if (game) return { game, moderatorToken };
  }
  return fail("CONFLICT", "Couldn't allocate a game code. Try again.");
}

export async function updateSettings(db: Db, game: Game, input: GameSettingsInput) {
  if (game.currentState !== "LOBBY") fail("WRONG_PHASE", "Settings can only change before the game starts.");
  const settings = parseSettings(input, true);
  await db
    .update(games)
    .set({ ...settings, stateVersion: sql`${games.stateVersion} + 1` })
    .where(and(eq(games.id, game.id), eq(games.currentState, "LOBBY")));
}

/**
 * Applies any time-based transitions that are due (reveal, open answering, tally). Called on every
 * state read and mutation, so the game advances as long as anyone is connected — no background
 * timers or in-memory state required. Every step is a conditional update, safe under concurrency.
 */
export async function advanceGame(db: Db, game: Game): Promise<Game> {
  let current = game;
  for (let i = 0; i < 4; i++) {
    if (!["PREDICTION", "TOPIC_REVEAL", "ANSWERING"].includes(current.currentState)) return current;
    const round = await getRound(db, current.id, current.currentRound);
    if (!round) return current;
    const allPredicted = current.currentState === "PREDICTION" ? await allConnectedPredicted(db, current, round) : false;
    const due = dueTransition(current.currentState, round, clock.now(), { allPredicted });
    if (!due) return current;
    if (due.kind === "reveal") await revealTopic(db, current, round);
    else if (due.kind === "open-answering") await openAnswering(db, current, round);
    else if (due.kind === "process") await processRound(db, current.id, round);
    current = await getGameByCode(db, current.gameCode);
  }
  return current;
}

export async function startGame(db: Db, game: Game) {
  if (game.currentState !== "LOBBY") fail("WRONG_PHASE", "The game has already started.");
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(participants)
    .where(eq(participants.gameId, game.id));
  if (Number(n) < 1) fail("BAD_REQUEST", "Wait for at least one player to join.");
  await startRound(db, game, 1);
}

export async function nextRound(db: Db, game: Game) {
  if (game.currentState !== "ROUND_LEADERBOARD") fail("WRONG_PHASE", "Finish the current round first.");
  if (game.currentRound >= game.totalRounds) return finishGame(db, game);
  await startRound(db, game, game.currentRound + 1);
}

/** Moderator shortcut: lock predictions and reveal the topic now. */
export async function revealNow(db: Db, game: Game) {
  if (game.currentState !== "PREDICTION") fail("WRONG_PHASE", "The topic is already revealed.");
  const round = await getRound(db, game.id, game.currentRound);
  if (!round) fail("NOT_FOUND", "Round not found.");
  await revealTopic(db, game, round!);
}

export async function finishGame(db: Db, game: Game) {
  if (game.currentState === "GAME_FINISHED") return;
  await db.transaction(async (tx) => {
    // Any round that never got tallied is cancelled and doesn't count.
    await tx
      .update(gameRounds)
      .set({ status: "CANCELLED" })
      .where(and(eq(gameRounds.gameId, game.id), notInArray(gameRounds.status, ["COMPLETE", "CANCELLED"])));
    await recomputeTotals(tx, game.id);
    await tx
      .update(games)
      .set({ currentState: "GAME_FINISHED", finishedAt: clock.date(), stateVersion: sql`${games.stateVersion} + 1` })
      .where(and(eq(games.id, game.id), inArray(games.currentState, ["LOBBY", "PREDICTION", "TOPIC_REVEAL", "ANSWERING", "ROUND_PROCESSING", "ROUND_LEADERBOARD"])));
  });
}

/**
 * "Play again": a fresh game with the same settings and the same players. Players' and host's
 * existing tokens carry over (only hashes are copied), so everyone follows the old game's
 * next_game_id pointer straight into the new lobby.
 */
export async function playAgain(db: Db, game: Game) {
  if (game.nextGameId) {
    const [next] = await db.select().from(games).where(eq(games.id, game.nextGameId)).limit(1);
    if (next) return next;
  }
  if (game.currentState !== "GAME_FINISHED") fail("WRONG_PHASE", "Finish this game before starting a rematch.");

  return db.transaction(async (tx) => {
    let next: Game | undefined;
    for (let attempt = 0; attempt < 6 && !next; attempt++) {
      [next] = await tx
        .insert(games)
        .values({
          gameCode: generateGameCode(),
          moderatorTokenHash: game.moderatorTokenHash,
          name: game.name,
          hostName: game.hostName,
          totalRounds: game.totalRounds,
          roundDuration: game.roundDuration,
          predictionDuration: game.predictionDuration,
          categoryIds: game.categoryIds,
          createdAt: clock.date(),
        })
        .onConflictDoNothing()
        .returning();
    }
    if (!next) fail("CONFLICT", "Couldn't allocate a game code. Try again.");
    const roster = await tx.select().from(participants).where(eq(participants.gameId, game.id));
    if (roster.length) {
      await tx.insert(participants).values(
        roster.map((p) => ({
          gameId: next!.id,
          displayName: p.displayName,
          nameKey: p.nameKey,
          sessionTokenHash: p.sessionTokenHash,
          avatar: p.avatar,
          joinedAt: clock.date(),
          lastSeenAt: p.lastSeenAt,
        })),
      );
    }
    const linked = await tx
      .update(games)
      .set({ nextGameId: next!.id, stateVersion: sql`${games.stateVersion} + 1` })
      .where(and(eq(games.id, game.id), sql`${games.nextGameId} IS NULL`))
      .returning({ id: games.id });
    if (!linked.length) fail("CONFLICT", "A rematch was already created.");
    return next!;
  });
}
