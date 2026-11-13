import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { gameRounds, games, participantAnswers, roundScores, topics, type Game } from "@/lib/db/schema";
import { MAX_ANSWERS_PER_ROUND, PROCESS_DELAY_MS, REVEAL_MS, SUBMIT_GRACE_MS } from "@/lib/game-engine/state-machine";
import { clock } from "@/lib/utils/clock";
import { GameError } from "@/server/errors";
import { advanceGame, createGame, finishGame, nextRound, playAgain, revealNow, startGame } from "@/server/game.service";
import { authenticateParticipant, getGameByCode, isModerator, joinGame } from "@/server/participant.service";
import { getRound, submitAnswer, submitPrediction } from "@/server/round.service";
import { processRound } from "@/server/scoring.service";
import { buildSnapshot } from "@/server/snapshot.service";
import { fakeClock, makeTestDb } from "./helpers";

let db: Db;
let time: ReturnType<typeof fakeClock>;

beforeAll(async () => {
  db = await makeTestDb();
});
afterAll(() => clock.reset());
beforeEach(() => {
  time = fakeClock();
});

const reload = (g: Game) => getGameByCode(db, g.gameCode);

async function expectError(p: Promise<unknown>, code: string) {
  await expect(p).rejects.toBeInstanceOf(GameError);
  await p.catch((e: GameError) => expect(e.code).toBe(code));
}

/** Creates a game with N players and starts round 1. */
async function setup(players: string[], opts: { rounds?: number; duration?: number } = {}) {
  const { game, moderatorToken } = await createGame(db, {
    name: "Test night",
    totalRounds: opts.rounds ?? 3,
    roundDuration: opts.duration ?? 20,
    predictionDuration: 30,
  });
  const joined = [];
  for (const name of players) joined.push(await joinGame(db, game, name));
  return { game, moderatorToken, players: joined };
}

/** Forces the round topic so answers are deterministic. */
async function forceTopic(g: Game, slug: string) {
  const [t] = await db.select().from(topics).where(eq(topics.slug, slug));
  await db
    .update(gameRounds)
    .set({ topicId: t.id })
    .where(and(eq(gameRounds.gameId, g.id), eq(gameRounds.roundNumber, g.currentRound)));
}

/** Reveal + open answering by advancing the clock. */
async function toAnswering(g: Game) {
  await revealNow(db, await reload(g));
  time.advance(REVEAL_MS);
  return advanceGame(db, await reload(g));
}

async function toLeaderboard(g: Game) {
  const round = await getRound(db, g.id, (await reload(g)).currentRound);
  time.set(round!.answeringDeadline!.getTime() + PROCESS_DELAY_MS);
  return advanceGame(db, await reload(g));
}

describe("game creation and joining", () => {
  it("creates a lobby with a secure code and hashed moderator token", async () => {
    const { game, moderatorToken } = await createGame(db, { name: "Friday", totalRounds: 5 });
    expect(game.gameCode).toMatch(/^[A-Z2-9]{6}$/);
    expect(game.currentState).toBe("LOBBY");
    expect(game.moderatorTokenHash).not.toContain(moderatorToken);
    expect(isModerator(game, moderatorToken)).toBe(true);
    expect(isModerator(game, "x".repeat(43))).toBe(false);
  });

  it("validates settings", async () => {
    await expectError(createGame(db, { name: "", totalRounds: 3 }), "BAD_REQUEST");
    await expectError(createGame(db, { name: "X", totalRounds: 0 }), "BAD_REQUEST");
    await expectError(createGame(db, { name: "X", totalRounds: 3, roundDuration: 7 }), "BAD_REQUEST");
  });

  it("rejects duplicate display names in a lobby", async () => {
    const { game } = await setup(["Sam"]);
    await expectError(joinGame(db, game, "  sam "), "CONFLICT");
  });

  it("reconnects with an existing token instead of creating a new player", async () => {
    const { game, players } = await setup(["Ana"]);
    const again = await joinGame(db, game, "Whatever", players[0].token);
    expect(again.reconnected).toBe(true);
    expect(again.participant.id).toBe(players[0].participant.id);
    const p = await authenticateParticipant(db, game, players[0].token);
    expect(p.displayName).toBe("Ana");
  });

  it("does not let a late player join an active game, but lets a known player back in", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    const g = await reload(game);
    await expectError(joinGame(db, g, "Latecomer"), "WRONG_PHASE");
    const back = await joinGame(db, g, "Ana", players[0].token);
    expect(back.reconnected).toBe(true);
  });

  it("refuses to start without players", async () => {
    const { game } = await setup([]);
    await expectError(startGame(db, game), "BAD_REQUEST");
  });
});

describe("prediction phase", () => {
  it("hides the topic until predictions lock", async () => {
    const { game, players } = await setup(["Ana", "Ben"]);
    await startGame(db, game);
    const g = await reload(game);
    const snap = await buildSnapshot(db, g, { role: "participant", participant: players[0].participant });
    expect(g.currentState).toBe("PREDICTION");
    expect(snap.round?.topic).toBeNull();
    expect(JSON.stringify(snap)).not.toMatch(/Fruits|Vegetables|US cities|Colors/);
    const mod = await buildSnapshot(db, g, { role: "moderator" });
    expect(mod.round?.topic).toBeNull();
    expect(mod.moderator?.predictions).toBeNull();
  });

  it("locks a prediction once and rejects changes", async () => {
    const { game, players } = await setup(["Ana", "Ben"]);
    await startGame(db, game);
    const g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 5);
    await expectError(submitPrediction(db, g, players[0].participant, 9), "CONFLICT");
    await expectError(submitPrediction(db, g, players[1].participant, 0), "BAD_REQUEST");
    await expectError(submitPrediction(db, g, players[1].participant, 3.5), "BAD_REQUEST");
  });

  it("reveals automatically once every connected player has predicted", async () => {
    const { game, players } = await setup(["Ana", "Ben"]);
    await startGame(db, game);
    let g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 3);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("PREDICTION");
    await submitPrediction(db, g, players[1].participant, 4);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("TOPIC_REVEAL");
    const snap = await buildSnapshot(db, g, { role: "participant", participant: players[0].participant });
    expect(snap.round?.topic?.name).toBeTruthy();
  });

  it("reveals at the prediction deadline even if someone never predicts", async () => {
    const { game, players } = await setup(["Ana", "Ben"]);
    await startGame(db, game);
    let g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 3);
    time.advance(30_000);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("TOPIC_REVEAL");
    await expectError(submitPrediction(db, g, players[1].participant, 2), "WRONG_PHASE");
  });
});

describe("answering and scoring", () => {
  it("scores the exact examples: predict 5 with 6 valid -> 5; predict 7 with 6 valid -> 0", async () => {
    const { game, players } = await setup(["Ana", "Ben", "Cy"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-fruits");
    await submitPrediction(db, g, players[0].participant, 5);
    await submitPrediction(db, g, players[1].participant, 7);
    await submitPrediction(db, g, players[2].participant, 2);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("TOPIC_REVEAL");
    time.advance(REVEAL_MS);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("ANSWERING");

    const six = ["Apple", "Banana", "Mango", "Orange", "Grapes", "Watermelon"];
    for (const a of six) {
      await submitAnswer(db, g, players[0].participant, a);
      await submitAnswer(db, g, players[1].participant, a);
    }
    // Cy: one valid, plus duplicates and junk that must not count.
    const r1 = await submitAnswer(db, g, players[2].participant, "apple");
    const r2 = await submitAnswer(db, g, players[2].participant, " APPLE ");
    const r3 = await submitAnswer(db, g, players[2].participant, "Car");
    const r4 = await submitAnswer(db, g, players[2].participant, "Laptop");
    expect(r1).toMatchObject({ isValid: true, isDuplicate: false, canonicalAnswer: "Apple", validCount: 1 });
    expect(r2).toMatchObject({ isDuplicate: true, validCount: 1 });
    expect(r3).toMatchObject({ isValid: false, canonicalAnswer: null });
    expect(r4.isValid).toBe(false);

    g = await toLeaderboard(g);
    expect(g.currentState).toBe("ROUND_LEADERBOARD");

    const snap = await buildSnapshot(db, g, { role: "participant", participant: players[0].participant });
    const byName = Object.fromEntries(snap.results!.scores.map((s) => [s.displayName, s]));
    expect(byName.Ana).toMatchObject({ predictedCount: 5, validCount: 6, roundPoints: 5, totalScore: 5, hit: true });
    expect(byName.Ben).toMatchObject({ predictedCount: 7, validCount: 6, roundPoints: 0, totalScore: 0, hit: false });
    expect(byName.Cy).toMatchObject({ predictedCount: 2, validCount: 1, roundPoints: 0 });
    expect(snap.results!.answerKey.find((a) => a.answer === "Apple")?.foundBy).toBe(3);
    expect(snap.results!.mine).toHaveLength(6);
  });

  it("treats alias duplicates as one answer", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-us-cities");
    await submitPrediction(db, g, players[0].participant, 2);
    g = await toAnswering(g);
    const a = await submitAnswer(db, g, players[0].participant, "New York");
    const b = await submitAnswer(db, g, players[0].participant, "NYC");
    const c = await submitAnswer(db, g, players[0].participant, "Saint Louis");
    expect(a).toMatchObject({ canonicalAnswer: "New York City", isDuplicate: false });
    expect(b).toMatchObject({ canonicalAnswer: "New York City", isDuplicate: true, validCount: 1 });
    expect(c).toMatchObject({ canonicalAnswer: "St. Louis", validCount: 2 });
  });

  it("rejects answers before the clock starts and after the deadline", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 1);
    g = await advanceGame(db, g);
    expect(g.currentState).toBe("TOPIC_REVEAL");
    await expectError(submitAnswer(db, g, players[0].participant, "Apple"), "DEADLINE_PASSED");

    time.advance(REVEAL_MS);
    g = await advanceGame(db, g);
    const round = await getRound(db, g.id, g.currentRound);
    time.set(round!.answeringDeadline!.getTime() + SUBMIT_GRACE_MS + 1);
    await expectError(submitAnswer(db, g, players[0].participant, "Apple"), "DEADLINE_PASSED");
  });

  it("rejects answers once the round has been tallied, even inside the grace period", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 1);
    g = await toAnswering(g);
    const round = (await getRound(db, g.id, g.currentRound))!;
    await processRound(db, g.id, round);
    await expectError(submitAnswer(db, await reload(g), players[0].participant, "Apple"), "WRONG_PHASE");
  });

  it("enforces input limits", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await submitPrediction(db, g, players[0].participant, 1);
    g = await toAnswering(g);
    await expectError(submitAnswer(db, g, players[0].participant, "x".repeat(61)), "BAD_REQUEST");
    await expectError(submitAnswer(db, g, players[0].participant, "   "), "BAD_REQUEST");
    await expectError(submitAnswer(db, g, players[0].participant, "!!!"), "BAD_REQUEST");
    await expectError(submitAnswer(db, g, players[0].participant, 42 as unknown as string), "BAD_REQUEST");
    for (let i = 0; i < MAX_ANSWERS_PER_ROUND; i++) await submitAnswer(db, g, players[0].participant, `junk ${i}`);
    await expectError(submitAnswer(db, g, players[0].participant, "Apple"), "LIMIT_REACHED");
  });

  it("handles many players submitting simultaneously", async () => {
    const names = Array.from({ length: 8 }, (_, i) => `P${i}`);
    const { game, players } = await setup(names);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-colors");
    for (const p of players) await submitPrediction(db, g, p.participant, 3);
    g = await advanceGame(db, g);
    time.advance(REVEAL_MS);
    g = await advanceGame(db, g);

    const answers = ["Red", "red", "Blue", "Green", "Gray", "Grey", "Nope"];
    await Promise.all(players.flatMap((p) => answers.map((a) => submitAnswer(db, g, p.participant, a))));
    g = await toLeaderboard(g);
    const scores = await db.select().from(roundScores);
    const round = await getRound(db, g.id, 1);
    const mine = scores.filter((s) => s.roundId === round!.id);
    expect(mine).toHaveLength(8);
    for (const s of mine) expect(s).toMatchObject({ validAnswerCount: 4, pointsAwarded: 3 });
  });

  it("processes a round exactly once, even when triggered concurrently", async () => {
    const { game, players } = await setup(["Ana", "Ben"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-fruits");
    await submitPrediction(db, g, players[0].participant, 2);
    await submitPrediction(db, g, players[1].participant, 1);
    g = await toAnswering(g);
    await submitAnswer(db, g, players[0].participant, "Apple");
    await submitAnswer(db, g, players[0].participant, "Pear");
    await submitAnswer(db, g, players[1].participant, "Plum");

    const round = (await getRound(db, g.id, 1))!;
    time.set(round.answeringDeadline!.getTime() + PROCESS_DELAY_MS);
    const results = await Promise.all([
      processRound(db, g.id, round),
      processRound(db, g.id, round),
      advanceGame(db, g),
      advanceGame(db, g),
    ]);
    expect(results.filter((r) => r === true)).toHaveLength(1);
    expect(await processRound(db, g.id, round)).toBe(false);

    const scores = await db.select().from(roundScores).where(eq(roundScores.roundId, round.id));
    expect(scores).toHaveLength(2);
    const after = await reload(g);
    expect(after.currentState).toBe("ROUND_LEADERBOARD");
    const snap = await buildSnapshot(db, after, { role: "moderator" });
    expect(snap.participants.find((p) => p.displayName === "Ana")?.totalScore).toBe(2);
    expect(snap.participants.find((p) => p.displayName === "Ben")?.totalScore).toBe(1);
  });

  it("restores a player's prediction and answers after a refresh", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-vegetables");
    await submitPrediction(db, g, players[0].participant, 4);
    g = await toAnswering(g);
    await submitAnswer(db, g, players[0].participant, "Carrot");
    await submitAnswer(db, g, players[0].participant, "Aubergine");
    // "Refresh": authenticate again with the stored token and rebuild the snapshot.
    const p = await authenticateParticipant(db, g, players[0].token);
    const snap = await buildSnapshot(db, g, { role: "participant", participant: p });
    expect(snap.me?.round?.prediction).toBe(4);
    expect(snap.me?.round?.answers.map((a) => a.canonical)).toEqual(["Carrot", "Eggplant"]);
    expect(snap.round?.topic?.name).toBe("Vegetables");
  });
});

describe("rounds, moderator controls and game end", () => {
  it("never repeats a topic within a game and finishes after the last round", async () => {
    const { game, players } = await setup(["Ana"], { rounds: 3 });
    await startGame(db, game);
    const seen = new Set<number>();
    let g = await reload(game);
    for (let r = 1; r <= 3; r++) {
      const round = (await getRound(db, g.id, r))!;
      expect(seen.has(round.topicId)).toBe(false);
      seen.add(round.topicId);
      await submitPrediction(db, g, players[0].participant, 1);
      g = await advanceGame(db, await reload(g));
      time.advance(REVEAL_MS);
      g = await advanceGame(db, g);
      g = await toLeaderboard(g);
      expect(g.currentState).toBe("ROUND_LEADERBOARD");
      await nextRound(db, g);
      g = await reload(g);
    }
    expect(g.currentState).toBe("GAME_FINISHED");
    const snap = await buildSnapshot(db, g, { role: "moderator" });
    expect(snap.final?.rounds).toHaveLength(3);
    expect(snap.final?.standings[0].perRound).toHaveLength(3);
  });

  it("blocks moderator actions in the wrong phase", async () => {
    const { game } = await setup(["Ana"]);
    await expectError(nextRound(db, game), "WRONG_PHASE");
    await expectError(revealNow(db, game), "WRONG_PHASE");
    await startGame(db, game);
    await expectError(startGame(db, await reload(game)), "WRONG_PHASE");
  });

  it("ending early cancels the unfinished round so it never scores", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-fruits");
    await submitPrediction(db, g, players[0].participant, 1);
    g = await toAnswering(g);
    await submitAnswer(db, g, players[0].participant, "Apple");
    await finishGame(db, g);
    g = await reload(g);
    expect(g.currentState).toBe("GAME_FINISHED");
    const [round] = await db.select().from(gameRounds).where(eq(gameRounds.gameId, g.id));
    expect(round.status).toBe("CANCELLED");
    const snap = await buildSnapshot(db, g, { role: "moderator" });
    expect(snap.participants[0].totalScore).toBe(0);
  });

  it("play again creates a linked rematch with the same players and host", async () => {
    const { game, moderatorToken, players } = await setup(["Ana", "Ben"]);
    await finishGame(db, game);
    const next = await playAgain(db, await reload(game));
    const again = await playAgain(db, await reload(game));
    expect(again.id).toBe(next.id);
    expect(next.currentState).toBe("LOBBY");
    expect(isModerator(next, moderatorToken)).toBe(true);
    const p = await authenticateParticipant(db, next, players[1].token);
    expect(p.displayName).toBe("Ben");
    const old = await reload(game);
    const snap = await buildSnapshot(db, old, { role: "moderator" });
    expect(snap.game.nextGameCode).toBe(next.gameCode);
  });

  it("does not expose tokens or hashes in snapshots", async () => {
    const { game, moderatorToken, players } = await setup(["Ana"]);
    const [row] = await db.select().from(games).where(eq(games.id, game.id));
    const snap = JSON.stringify(await buildSnapshot(db, row, { role: "moderator" }));
    expect(snap).not.toContain(moderatorToken);
    expect(snap).not.toContain(row.moderatorTokenHash);
    expect(snap).not.toContain(players[0].token);
    expect(snap).not.toContain(players[0].participant.sessionTokenHash);
  });

  it("stores every submission with its validation result", async () => {
    const { game, players } = await setup(["Ana"]);
    await startGame(db, game);
    let g = await reload(game);
    await forceTopic(g, "test-fruits");
    await submitPrediction(db, g, players[0].participant, 1);
    g = await toAnswering(g);
    await submitAnswer(db, g, players[0].participant, "Kiwi");
    await submitAnswer(db, g, players[0].participant, "kiwifruit");
    await submitAnswer(db, g, players[0].participant, "Tractor");
    const rows = await db
      .select()
      .from(participantAnswers)
      .where(eq(participantAnswers.participantId, players[0].participant.id));
    expect(rows.map((r) => [r.submittedText, r.isValid, r.isDuplicate])).toEqual([
      ["Kiwi", true, false],
      ["kiwifruit", true, true],
      ["Tractor", false, false],
    ]);
  });
});
