import { and, eq, inArray, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/lib/db/client";
import { gameRounds, games, participantAnswers, participants, predictions, roundScores, type GameRound } from "@/lib/db/schema";
import { calculatePoints } from "@/lib/scoring";
import { clock } from "@/lib/utils/clock";

/**
 * Tallies a round exactly once.
 *
 * The round row is claimed with a conditional UPDATE (ANSWERING/TOPIC_REVEAL -> PROCESSING). That
 * row lock waits for any in-flight answer transaction holding FOR SHARE, and makes every later
 * caller's claim a no-op. round_scores has a unique (round, participant) key and totals are
 * recomputed from round_scores, so even a retried transaction can't double-count.
 */
export async function processRound(db: Db, gameId: string, round: GameRound): Promise<boolean> {
  return db.transaction(async (tx) => {
    const claimed = await tx
      .update(gameRounds)
      .set({ status: "PROCESSING" })
      .where(and(eq(gameRounds.id, round.id), inArray(gameRounds.status, ["ANSWERING", "TOPIC_REVEAL"])))
      .returning({ id: gameRounds.id });
    if (!claimed.length) return false;

    await tx.update(games).set({ currentState: "ROUND_PROCESSING" }).where(eq(games.id, gameId));

    const roster = await tx.select({ id: participants.id }).from(participants).where(eq(participants.gameId, gameId));
    const preds = await tx
      .select({ participantId: predictions.participantId, predictedCount: predictions.predictedCount })
      .from(predictions)
      .where(eq(predictions.roundId, round.id));
    const validCounts = await tx
      .select({ participantId: participantAnswers.participantId, n: sql<number>`count(*)::int` })
      .from(participantAnswers)
      .where(
        and(
          eq(participantAnswers.roundId, round.id),
          eq(participantAnswers.isValid, true),
          eq(participantAnswers.isDuplicate, false),
        ),
      )
      .groupBy(participantAnswers.participantId);

    const predBy = new Map(preds.map((p) => [p.participantId, p.predictedCount]));
    const validBy = new Map(validCounts.map((v) => [v.participantId, Number(v.n)]));

    if (roster.length) {
      await tx
        .insert(roundScores)
        .values(
          roster.map((p) => {
            const predicted = predBy.get(p.id) ?? null;
            const valid = validBy.get(p.id) ?? 0;
            return {
              roundId: round.id,
              participantId: p.id,
              predictedCount: predicted,
              validAnswerCount: valid,
              pointsAwarded: calculatePoints(valid, predicted),
            };
          }),
        )
        .onConflictDoNothing();
    }

    await recomputeTotals(tx, gameId);

    await tx.update(gameRounds).set({ status: "COMPLETE", processedAt: clock.date() }).where(eq(gameRounds.id, round.id));
    await tx
      .update(games)
      .set({ currentState: "ROUND_LEADERBOARD", stateVersion: sql`${games.stateVersion} + 1` })
      .where(eq(games.id, gameId));
    return true;
  });
}

/** Totals are always derived from round_scores of completed rounds — never incremented in place. */
export async function recomputeTotals(db: DbOrTx, gameId: string) {
  await db.execute(sql`
    UPDATE participants p
    SET total_score = COALESCE((
      SELECT SUM(rs.points_awarded)
      FROM round_scores rs
      JOIN game_rounds gr ON gr.id = rs.round_id
      WHERE rs.participant_id = p.id AND gr.status <> 'CANCELLED'
    ), 0)
    WHERE p.game_id = ${gameId}
  `);
}
