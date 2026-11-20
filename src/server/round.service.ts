import { and, count, eq, gte, inArray, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/lib/db/client";
import {
  answers,
  gameRounds,
  games,
  participantAnswers,
  participants,
  predictions,
  topics,
  type Game,
  type GameRound,
  type Participant,
} from "@/lib/db/schema";
import {
  CONNECTED_WINDOW_MS,
  MAX_ANSWERS_PER_ROUND,
  computeRevealTiming,
  isWithinAnsweringWindow,
} from "@/lib/game-engine/state-machine";
import { isValidPrediction, MAX_PREDICTION, MIN_PREDICTION } from "@/lib/scoring";
import { MAX_ANSWER_LENGTH, normalizeAnswer } from "@/lib/validation/normalize";
import { clock } from "@/lib/utils/clock";
import type { AnswerSubmitResponse } from "@/types/game";
import { loadAnswerLexicon, loadTopicIndex } from "./answer-validation.service";
import { fail } from "./errors";
import { bumpVersion } from "./participant.service";

/** Topics with fewer answers than this are never dealt — they'd cap ambitious predictions. */
export const MIN_TOPIC_ANSWERS = 10;

export async function getRound(db: DbOrTx, gameId: string, roundNumber: number): Promise<GameRound | null> {
  if (roundNumber < 1) return null;
  const [r] = await db
    .select()
    .from(gameRounds)
    .where(and(eq(gameRounds.gameId, gameId), eq(gameRounds.roundNumber, roundNumber)))
    .limit(1);
  return r ?? null;
}

type TopicCandidate = { id: number; categoryId: number };
let candidateCache: { at: number; rows: TopicCandidate[] } | null = null;

export function invalidateTopicCandidates() {
  candidateCache = null;
}

async function topicCandidates(db: DbOrTx): Promise<TopicCandidate[]> {
  if (candidateCache && Date.now() - candidateCache.at < 60_000) return candidateCache.rows;
  const rows = await db
    .select({ id: topics.id, categoryId: topics.categoryId })
    .from(topics)
    .innerJoin(answers, and(eq(answers.topicId, topics.id), eq(answers.isActive, true)))
    .where(eq(topics.isActive, true))
    .groupBy(topics.id, topics.categoryId)
    .having(gte(count(answers.id), MIN_TOPIC_ANSWERS));
  candidateCache = { at: Date.now(), rows };
  return rows;
}

/**
 * Random topic that hasn't appeared in this game, honouring the host's category filter and
 * steering away from the categories used in the last two rounds so consecutive rounds feel fresh.
 */
export async function pickTopic(db: DbOrTx, game: Game): Promise<number> {
  const used = await db
    .select({ topicId: gameRounds.topicId, categoryId: topics.categoryId, n: gameRounds.roundNumber })
    .from(gameRounds)
    .innerJoin(topics, eq(topics.id, gameRounds.topicId))
    .where(eq(gameRounds.gameId, game.id));
  const usedIds = new Set(used.map((u) => u.topicId));
  const recentCats = new Set(
    used
      .sort((a, b) => b.n - a.n)
      .slice(0, 2)
      .map((u) => u.categoryId),
  );

  let pool = (await topicCandidates(db)).filter((t) => !usedIds.has(t.id));
  if (game.categoryIds?.length) {
    const allowed = new Set(game.categoryIds);
    const filtered = pool.filter((t) => allowed.has(t.categoryId));
    if (filtered.length) pool = filtered;
  }
  if (!pool.length) fail("CONFLICT", "No unused topics are left for this game.");
  const fresh = pool.filter((t) => !recentCats.has(t.categoryId));
  const from = fresh.length ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)].id;
}

/** Creates the next round in the PREDICTION phase. The topic is shown to everyone while they bid. */
export async function startRound(db: Db, game: Game, roundNumber: number): Promise<void> {
  const topicId = await pickTopic(db, game);
  const now = clock.now();
  await db.transaction(async (tx) => {
    const moved = await tx
      .update(games)
      .set({
        currentState: "PREDICTION",
        currentRound: roundNumber,
        stateVersion: sql`${games.stateVersion} + 1`,
        startedAt: game.startedAt ?? new Date(now),
      })
      .where(
        and(
          eq(games.id, game.id),
          eq(games.currentRound, roundNumber - 1),
          inArray(games.currentState, ["LOBBY", "ROUND_LEADERBOARD"]),
        ),
      )
      .returning({ id: games.id });
    if (!moved.length) fail("WRONG_PHASE", "The next round has already started.");
    await tx.insert(gameRounds).values({
      gameId: game.id,
      topicId,
      roundNumber,
      status: "PREDICTION",
      predictionDeadline: new Date(now + game.predictionDuration * 1000),
      createdAt: new Date(now),
    });
  });
}

export async function submitPrediction(db: Db, game: Game, participant: Participant, raw: unknown) {
  if (game.currentState !== "PREDICTION") fail("WRONG_PHASE", "Predictions are closed for this round.");
  if (!isValidPrediction(raw)) {
    fail("BAD_REQUEST", `Pick a whole number from ${MIN_PREDICTION} to ${MAX_PREDICTION}.`);
  }
  const round = await getRound(db, game.id, game.currentRound);
  if (!round || round.status !== "PREDICTION") fail("WRONG_PHASE", "Predictions are closed for this round.");
  if (clock.now() > round!.predictionDeadline.getTime() + 500) fail("DEADLINE_PASSED", "Time's up — predictions are locked.");

  const inserted = await db
    .insert(predictions)
    .values({ roundId: round!.id, participantId: participant.id, predictedCount: raw as number, submittedAt: clock.date() })
    .onConflictDoNothing()
    .returning({ id: predictions.id });
  if (!inserted.length) fail("CONFLICT", "You already locked in a prediction for this round.");
  await bumpVersion(db, game.id);
  return { predictedCount: raw as number };
}

/** True when every connected player has locked a prediction (and at least one has). */
export async function allConnectedPredicted(db: DbOrTx, game: Game, round: GameRound): Promise<boolean> {
  const since = new Date(clock.now() - CONNECTED_WINDOW_MS);
  const roster = await db
    .select({ id: participants.id, lastSeenAt: participants.lastSeenAt, predicted: predictions.id })
    .from(participants)
    .leftJoin(predictions, and(eq(predictions.participantId, participants.id), eq(predictions.roundId, round.id)))
    .where(eq(participants.gameId, game.id));
  const connected = roster.filter((r) => r.lastSeenAt >= since || r.predicted !== null);
  return connected.length > 0 && connected.every((r) => r.predicted !== null);
}

/** PREDICTION -> TOPIC_REVEAL. Idempotent: only the first caller wins the conditional update. */
export async function revealTopic(db: Db, game: Game, round: GameRound): Promise<boolean> {
  const timing = computeRevealTiming(clock.now(), game.roundDuration);
  return db.transaction(async (tx) => {
    const moved = await tx
      .update(games)
      .set({ currentState: "TOPIC_REVEAL", stateVersion: sql`${games.stateVersion} + 1` })
      .where(and(eq(games.id, game.id), eq(games.currentState, "PREDICTION"), eq(games.currentRound, round.roundNumber)))
      .returning({ id: games.id });
    if (!moved.length) return false;
    await tx
      .update(gameRounds)
      .set({ status: "TOPIC_REVEAL", ...timing })
      .where(and(eq(gameRounds.id, round.id), eq(gameRounds.status, "PREDICTION")));
    return true;
  });
}

/** TOPIC_REVEAL -> ANSWERING once the reveal countdown has elapsed. */
export async function openAnswering(db: Db, game: Game, round: GameRound): Promise<boolean> {
  return db.transaction(async (tx) => {
    const moved = await tx
      .update(games)
      .set({ currentState: "ANSWERING", stateVersion: sql`${games.stateVersion} + 1` })
      .where(and(eq(games.id, game.id), eq(games.currentState, "TOPIC_REVEAL"), eq(games.currentRound, round.roundNumber)))
      .returning({ id: games.id });
    if (!moved.length) return false;
    await tx
      .update(gameRounds)
      .set({ status: "ANSWERING" })
      .where(and(eq(gameRounds.id, round.id), eq(gameRounds.status, "TOPIC_REVEAL")));
    return true;
  });
}

/**
 * Validates and records one answer. The round row is read FOR SHARE inside the transaction, so
 * scoring (which takes a row lock on the round) can never interleave with an in-flight submission:
 * either the answer lands before the tally, or it is rejected.
 */
export async function submitAnswer(
  db: Db,
  game: Game,
  participant: Participant,
  rawText: unknown,
): Promise<AnswerSubmitResponse> {
  if (typeof rawText !== "string") fail("BAD_REQUEST", "Type an answer first.");
  const text = (rawText as string).replace(/\s+/g, " ").trim();
  if (!text) fail("BAD_REQUEST", "Type an answer first.");
  if (text.length > MAX_ANSWER_LENGTH) fail("BAD_REQUEST", `Answers can be up to ${MAX_ANSWER_LENGTH} characters.`);
  const normalized = normalizeAnswer(text);
  if (!normalized) fail("BAD_REQUEST", "That answer has no letters or numbers in it.");

  return db.transaction(async (tx) => {
    const [round] = await tx
      .select()
      .from(gameRounds)
      .where(and(eq(gameRounds.gameId, game.id), eq(gameRounds.roundNumber, game.currentRound)))
      .for("share")
      .limit(1);
    if (!round || !["TOPIC_REVEAL", "ANSWERING"].includes(round.status)) {
      fail("WRONG_PHASE", "Answering isn't open right now.");
    }
    if (!isWithinAnsweringWindow(round, clock.now())) {
      fail("DEADLINE_PASSED", clock.now() < (round.answeringStartsAt?.getTime() ?? 0) ? "Hold on — the clock hasn't started." : "Time's up — answers are locked.");
    }

    const [{ n }] = await tx
      .select({ n: count() })
      .from(participantAnswers)
      .where(and(eq(participantAnswers.roundId, round.id), eq(participantAnswers.participantId, participant.id)));
    if (n >= MAX_ANSWERS_PER_ROUND) fail("LIMIT_REACHED", `That's the limit of ${MAX_ANSWERS_PER_ROUND} answers for a round.`);

    const index = await loadTopicIndex(tx, round.topicId);
    let match = index.match(text, { autocorrect: false });
    if (match.answerId === null) {
      const lexicon = await loadAnswerLexicon(tx);
      match = index.match(text, { isKnownAnswer: (k) => lexicon.has(k) });
    }
    const base = {
      roundId: round.id,
      participantId: participant.id,
      answerId: match.answerId,
      submittedText: text,
      normalizedText: normalized,
      isValid: match.answerId !== null,
      submittedAt: clock.date(),
    };

    // First attempt: a credited answer. Conflicts on either unique index mean it's a repeat.
    let [row] = await tx
      .insert(participantAnswers)
      .values({ ...base, isDuplicate: false })
      .onConflictDoNothing()
      .returning();

    let isDuplicate = false;
    if (!row) {
      isDuplicate = true;
      const [sameText] = await tx
        .select()
        .from(participantAnswers)
        .where(
          and(
            eq(participantAnswers.roundId, round.id),
            eq(participantAnswers.participantId, participant.id),
            eq(participantAnswers.normalizedText, normalized),
          ),
        )
        .limit(1);
      if (sameText) {
        row = sameText;
      } else {
        // Same canonical answer via a different spelling/alias: store it, flagged as a duplicate.
        [row] = await tx
          .insert(participantAnswers)
          .values({ ...base, isDuplicate: true })
          .onConflictDoNothing()
          .returning();
      }
    }

    const [{ valid }] = await tx
      .select({ valid: count() })
      .from(participantAnswers)
      .where(
        and(
          eq(participantAnswers.roundId, round.id),
          eq(participantAnswers.participantId, participant.id),
          eq(participantAnswers.isValid, true),
          eq(participantAnswers.isDuplicate, false),
        ),
      );

    return {
      id: row?.id ?? 0,
      submittedAnswer: text,
      canonicalAnswer: match.canonical,
      isValid: base.isValid,
      isDuplicate,
      corrected: match.method === "typo" || match.method === "sound" || match.method === "partial",
      validCount: valid,
    };
  });
}
