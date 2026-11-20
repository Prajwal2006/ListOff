/** Points per answer up to (and including) the bid. */
export const POINTS_PER_BID_ANSWER = 2;
/** Points per answer beyond the bid. */
export const POINTS_PER_EXTRA_ANSWER = 1;

/**
 * The single source of truth for ListOff scoring.
 *
 *   if (validUniqueAnswers >= predictedCount)
 *     points = 2 × predictedCount + 1 × (validUniqueAnswers − predictedCount)
 *   else
 *     points = 0
 *
 * Meeting the bid pays double for every answer up to the bid, and a bonus point for each extra
 * answer. Falling short of the bid, or not bidding, scores 0.
 */
export function calculatePoints(validUniqueAnswers: number, predictedCount: number | null | undefined): number {
  if (predictedCount == null || !Number.isFinite(predictedCount) || predictedCount <= 0) return 0;
  if (!Number.isFinite(validUniqueAnswers) || validUniqueAnswers < 0) return 0;
  if (validUniqueAnswers < predictedCount) return 0;
  return POINTS_PER_BID_ANSWER * predictedCount + POINTS_PER_EXTRA_ANSWER * (validUniqueAnswers - predictedCount);
}

export const MIN_PREDICTION = 1;
export const MAX_PREDICTION = 50;

export function isValidPrediction(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= MIN_PREDICTION && n <= MAX_PREDICTION;
}

export interface RankedEntry {
  participantId: string;
  displayName: string;
  totalScore: number;
  roundPoints: number;
  rank: number;
  previousRank: number | null;
}

/** Standard competition ranking ("1, 2, 2, 4"). Ties broken alphabetically for stable display. */
export function rankEntries<T extends { participantId: string; displayName: string; totalScore: number; roundPoints: number }>(
  entries: T[],
): (T & { rank: number; previousRank: number | null })[] {
  const rankBy = (score: (e: T) => number) => {
    const sorted = [...entries].sort(
      (a, b) => score(b) - score(a) || a.displayName.localeCompare(b.displayName),
    );
    const ranks = new Map<string, number>();
    sorted.forEach((e, i) => {
      const prev = sorted[i - 1];
      ranks.set(e.participantId, prev && score(prev) === score(e) ? ranks.get(prev.participantId)! : i + 1);
    });
    return { sorted, ranks };
  };
  const now = rankBy((e) => e.totalScore);
  const before = rankBy((e) => e.totalScore - e.roundPoints);
  return now.sorted.map((e) => ({
    ...e,
    rank: now.ranks.get(e.participantId)!,
    previousRank: before.ranks.get(e.participantId) ?? null,
  }));
}
