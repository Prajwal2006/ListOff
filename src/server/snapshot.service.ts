import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  answers,
  categories,
  gameRounds,
  games,
  participantAnswers,
  participants,
  predictions,
  roundScores,
  topics,
  type Game,
  type GameRound,
  type Participant,
} from "@/lib/db/schema";
import { CONNECTED_WINDOW_MS } from "@/lib/game-engine/state-machine";
import { rankEntries } from "@/lib/scoring";
import { clock } from "@/lib/utils/clock";
import type {
  FinalView,
  GameSnapshot,
  ModeratorView,
  PublicParticipant,
  PublicTopic,
  RoundResultsView,
  RoundView,
  ScoreRow,
  SubmittedAnswerView,
} from "@/types/game";
import { getRound } from "./round.service";

export type Viewer = { role: "moderator" } | { role: "participant"; participant: Participant };

const topicCache = new Map<number, PublicTopic>();

export async function getPublicTopic(db: Db, topicId: number): Promise<PublicTopic> {
  const cached = topicCache.get(topicId);
  if (cached) return cached;
  const [row] = await db
    .select({
      id: topics.id,
      name: topics.name,
      prompt: topics.prompt,
      difficulty: topics.difficulty,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      totalAnswers: sql<number>`(SELECT count(*)::int FROM ${answers} WHERE ${answers.topicId} = ${topics.id} AND ${answers.isActive} = true)`,
    })
    .from(topics)
    .innerJoin(categories, eq(categories.id, topics.categoryId))
    .where(eq(topics.id, topicId))
    .limit(1);
  const topic = { ...row, totalAnswers: Number(row.totalAnswers) } as PublicTopic;
  if (topicCache.size > 500) topicCache.clear();
  topicCache.set(topicId, topic);
  return topic;
}

function answerView(a: typeof participantAnswers.$inferSelect, canonical: Map<number, string>): SubmittedAnswerView {
  return {
    id: a.id,
    text: a.submittedText,
    canonical: a.answerId ? (canonical.get(a.answerId) ?? null) : null,
    isValid: a.isValid,
    isDuplicate: a.isDuplicate,
  };
}

async function canonicalNames(db: Db, ids: number[]): Promise<Map<number, string>> {
  if (!ids.length) return new Map();
  const rows = await db
    .select({ id: answers.id, c: answers.canonicalAnswer })
    .from(answers)
    .where(inArray(answers.id, [...new Set(ids)]));
  return new Map(rows.map((r) => [r.id, r.c]));
}

export async function buildSnapshot(db: Db, game: Game, viewer: Viewer): Promise<GameSnapshot> {
  const now = clock.now();
  const isMod = viewer.role === "moderator";
  const meId = viewer.role === "participant" ? viewer.participant.id : null;

  const roster = await db
    .select()
    .from(participants)
    .where(eq(participants.gameId, game.id))
    .orderBy(asc(participants.joinedAt));

  const round = await getRound(db, game.id, game.currentRound);
  const roundPreds = round
    ? await db
        .select({ participantId: predictions.participantId, predictedCount: predictions.predictedCount })
        .from(predictions)
        .where(eq(predictions.roundId, round.id))
    : [];
  const predictedSet = new Set(roundPreds.map((p) => p.participantId));
  // The topic is shown as soon as a round starts (players bid knowing the topic).
  // Individual bids stay hidden until bidding closes.
  const bidsLocked = !!round && round.status !== "PREDICTION";

  const isConnected = (p: Participant) => now - p.lastSeenAt.getTime() < CONNECTED_WINDOW_MS;
  const publicParticipants: PublicParticipant[] = roster.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    totalScore: p.totalScore,
    isConnected: isConnected(p),
    hasPredicted: predictedSet.has(p.id),
    joinedAt: p.joinedAt.getTime(),
  }));

  let roundView: RoundView | null = null;
  let topic: PublicTopic | null = null;
  if (round && round.status !== "CANCELLED") {
    topic = await getPublicTopic(db, round.topicId);
    const eligible = roster.filter((p) => isConnected(p) || predictedSet.has(p.id)).length;
    roundView = {
      id: round.id,
      number: round.roundNumber,
      status: round.status,
      predictionDeadline: round.predictionDeadline.getTime(),
      answeringStartsAt: round.answeringStartsAt?.getTime() ?? null,
      answeringDeadline: round.answeringDeadline?.getTime() ?? null,
      predictionsIn: roundPreds.length,
      eligible,
      topic,
    };
  }

  // My own round: prediction + answers so a refresh mid-round restores everything.
  let me: GameSnapshot["me"] = null;
  if (viewer.role === "participant") {
    const p = roster.find((r) => r.id === meId) ?? viewer.participant;
    let myRound = null;
    if (round) {
      const mine = await db
        .select()
        .from(participantAnswers)
        .where(and(eq(participantAnswers.roundId, round.id), eq(participantAnswers.participantId, p.id)))
        .orderBy(asc(participantAnswers.id));
      const names = await canonicalNames(db, mine.flatMap((a) => (a.answerId ? [a.answerId] : [])));
      myRound = {
        prediction: roundPreds.find((r) => r.participantId === p.id)?.predictedCount ?? null,
        answers: mine.map((a) => answerView(a, names)),
      };
    }
    me = { id: p.id, displayName: p.displayName, avatar: p.avatar, totalScore: p.totalScore, round: myRound };
  }

  // Scores for every completed round — drives the leaderboard, results, and final stats.
  const scoreRows = await db
    .select({
      roundId: roundScores.roundId,
      roundNumber: gameRounds.roundNumber,
      participantId: roundScores.participantId,
      predictedCount: roundScores.predictedCount,
      validAnswerCount: roundScores.validAnswerCount,
      pointsAwarded: roundScores.pointsAwarded,
    })
    .from(roundScores)
    .innerJoin(gameRounds, eq(gameRounds.id, roundScores.roundId))
    .where(and(eq(gameRounds.gameId, game.id), eq(gameRounds.status, "COMPLETE")));

  const lastCompleted = scoreRows.reduce((m, r) => Math.max(m, r.roundNumber), 0);
  const leaderboard = buildLeaderboard(roster, scoreRows.filter((r) => r.roundNumber === lastCompleted));

  let results: RoundResultsView | null = null;
  const showResults =
    round && round.status === "COMPLETE" && (game.currentState === "ROUND_LEADERBOARD" || game.currentState === "GAME_FINISHED");
  if (showResults && round) results = await buildResults(db, game, round, leaderboard, meId);

  let final: FinalView | null = null;
  if (game.currentState === "GAME_FINISHED") final = await buildFinal(db, game, roster, scoreRows);

  let moderator: ModeratorView | null = null;
  if (isMod) moderator = await buildModeratorView(db, round, roster, roundPreds, bidsLocked);

  let nextGameCode: string | null = null;
  if (game.nextGameId) {
    const [n] = await db.select({ code: games.gameCode }).from(games).where(eq(games.id, game.nextGameId)).limit(1);
    nextGameCode = n?.code ?? null;
  }

  return {
    serverNow: now,
    version: game.stateVersion,
    role: viewer.role,
    game: {
      code: game.gameCode,
      name: game.name,
      hostName: game.hostName,
      state: game.currentState,
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      roundDuration: game.roundDuration,
      predictionDuration: game.predictionDuration,
      categoryIds: game.categoryIds,
      nextGameCode,
      createdAt: game.createdAt.getTime(),
    },
    participants: publicParticipants,
    round: roundView,
    me,
    leaderboard,
    results,
    final,
    moderator,
  };
}

type ScoreRecord = {
  roundNumber: number;
  participantId: string;
  predictedCount: number | null;
  validAnswerCount: number;
  pointsAwarded: number;
};

function buildLeaderboard(roster: Participant[], lastRound: ScoreRecord[]): ScoreRow[] {
  const byP = new Map(lastRound.map((r) => [r.participantId, r]));
  const ranked = rankEntries(
    roster.map((p) => {
      const s = byP.get(p.id);
      return {
        participantId: p.id,
        displayName: p.displayName,
        avatar: p.avatar,
        totalScore: p.totalScore,
        roundPoints: s?.pointsAwarded ?? 0,
        predictedCount: s?.predictedCount ?? null,
        validCount: s?.validAnswerCount ?? 0,
        hit: !!s && s.pointsAwarded > 0,
      };
    }),
  );
  return ranked;
}

async function buildResults(
  db: Db,
  game: Game,
  round: GameRound,
  leaderboard: ScoreRow[],
  meId: string | null,
): Promise<RoundResultsView> {
  const topic = await getPublicTopic(db, round.topicId);
  const all = await db
    .select({ id: answers.id, c: answers.canonicalAnswer })
    .from(answers)
    .where(and(eq(answers.topicId, round.topicId), eq(answers.isActive, true)));
  const found = await db
    .select({ answerId: participantAnswers.answerId, n: sql<number>`count(DISTINCT ${participantAnswers.participantId})::int` })
    .from(participantAnswers)
    .where(and(eq(participantAnswers.roundId, round.id), eq(participantAnswers.isValid, true)))
    .groupBy(participantAnswers.answerId);
  const foundBy = new Map(found.map((f) => [f.answerId, Number(f.n)]));
  const answerKey = all
    .map((a) => ({ answer: a.c, foundBy: foundBy.get(a.id) ?? 0 }))
    .sort((a, b) => b.foundBy - a.foundBy || a.answer.localeCompare(b.answer));

  let mine: SubmittedAnswerView[] | null = null;
  if (meId) {
    const rows = await db
      .select()
      .from(participantAnswers)
      .where(and(eq(participantAnswers.roundId, round.id), eq(participantAnswers.participantId, meId)))
      .orderBy(asc(participantAnswers.id));
    const names = new Map(all.map((a) => [a.id, a.c]));
    mine = rows.map((a) => answerView(a, names));
  }

  return {
    roundNumber: round.roundNumber,
    topic,
    scores: leaderboard,
    answerKey,
    mine,
    isFinalRound: round.roundNumber >= game.totalRounds,
  };
}

async function buildFinal(db: Db, game: Game, roster: Participant[], scoreRows: ScoreRecord[]): Promise<FinalView> {
  const rounds = await db
    .select({ roundNumber: gameRounds.roundNumber, topicName: topics.name, categoryName: categories.name })
    .from(gameRounds)
    .innerJoin(topics, eq(topics.id, gameRounds.topicId))
    .innerJoin(categories, eq(categories.id, topics.categoryId))
    .where(and(eq(gameRounds.gameId, game.id), eq(gameRounds.status, "COMPLETE")))
    .orderBy(asc(gameRounds.roundNumber));

  const ranked = rankEntries(
    roster.map((p) => ({ participantId: p.id, displayName: p.displayName, totalScore: p.totalScore, roundPoints: 0 })),
  );
  const byP = new Map(roster.map((p) => [p.id, p]));
  return {
    rounds,
    standings: ranked.map((r) => {
      const mine = scoreRows.filter((s) => s.participantId === r.participantId).sort((a, b) => a.roundNumber - b.roundNumber);
      const best = mine.reduce<ScoreRecord | null>((b, s) => (s.pointsAwarded > (b?.pointsAwarded ?? 0) ? s : b), null);
      return {
        participantId: r.participantId,
        displayName: r.displayName,
        avatar: byP.get(r.participantId)?.avatar ?? 0,
        totalScore: r.totalScore,
        rank: r.rank,
        roundsHit: mine.filter((s) => s.pointsAwarded > 0).length,
        roundsPlayed: mine.filter((s) => s.predictedCount !== null).length,
        totalValid: mine.reduce((n, s) => n + s.validAnswerCount, 0),
        bestRound: best ? { roundNumber: best.roundNumber, points: best.pointsAwarded } : null,
        perRound: mine.map((s) => ({
          roundNumber: s.roundNumber,
          predicted: s.predictedCount,
          valid: s.validAnswerCount,
          points: s.pointsAwarded,
        })),
      };
    }),
  };
}

async function buildModeratorView(
  db: Db,
  round: GameRound | null,
  roster: Participant[],
  roundPreds: { participantId: string; predictedCount: number }[],
  revealed: boolean,
): Promise<ModeratorView> {
  const nameOf = new Map(roster.map((p) => [p.id, p.displayName]));
  const view: ModeratorView = { predictions: null, answerCounts: {}, answers: null };
  if (!round) return view;
  if (revealed) {
    view.predictions = roundPreds
      .map((p) => ({ ...p, displayName: nameOf.get(p.participantId) ?? "?" }))
      .sort((a, b) => b.predictedCount - a.predictedCount);
  }
  if (round.status === "PREDICTION") return view;
  const rows = await db
    .select()
    .from(participantAnswers)
    .where(eq(participantAnswers.roundId, round.id))
    .orderBy(asc(participantAnswers.id));
  for (const r of rows) view.answerCounts[r.participantId] = (view.answerCounts[r.participantId] ?? 0) + 1;
  if (round.status === "COMPLETE" || round.status === "PROCESSING") {
    const names = await canonicalNames(db, rows.flatMap((a) => (a.answerId ? [a.answerId] : [])));
    view.answers = roster.map((p) => ({
      participantId: p.id,
      displayName: p.displayName,
      items: rows.filter((r) => r.participantId === p.id).map((r) => answerView(r, names)),
    }));
  }
  return view;
}
