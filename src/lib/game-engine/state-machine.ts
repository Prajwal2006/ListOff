import type { GameState } from "@/lib/db/schema";

/** How long the dramatic reveal + 3-2-1 countdown lasts before answering opens. */
export const REVEAL_MS = 4_500;
/** Network allowance after the answering deadline. Submissions later than this are rejected. */
export const SUBMIT_GRACE_MS = 750;
/** Extra wait before tallying so in-flight submissions land first. */
export const PROCESS_DELAY_MS = 1_500;
/** A player counts as connected if we heard from them within this window. */
export const CONNECTED_WINDOW_MS = 12_000;
/** Heartbeats only touch the DB this often per player. */
export const HEARTBEAT_WRITE_MS = 4_000;

export const MAX_ANSWERS_PER_ROUND = 100;
export const MAX_PARTICIPANTS = 50;

export const ROUND_DURATION_OPTIONS = [15, 20, 30, 45, 60] as const;
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 20;

/** Allowed manual (moderator-driven) and automatic transitions. */
export const TRANSITIONS: Record<GameState, GameState[]> = {
  LOBBY: ["PREDICTION", "GAME_FINISHED"],
  PREDICTION: ["TOPIC_REVEAL", "GAME_FINISHED"],
  TOPIC_REVEAL: ["ANSWERING", "GAME_FINISHED"],
  ANSWERING: ["ROUND_PROCESSING", "GAME_FINISHED"],
  ROUND_PROCESSING: ["ROUND_LEADERBOARD", "ANSWERING"],
  ROUND_LEADERBOARD: ["PREDICTION", "GAME_FINISHED"],
  GAME_FINISHED: [],
};

export function canTransition(from: GameState, to: GameState): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface RoundTiming {
  predictionDeadline: Date;
  answeringStartsAt: Date | null;
  answeringDeadline: Date | null;
}

export type TimedTransition =
  | { kind: "reveal"; reason: "deadline" | "all-predicted" }
  | { kind: "open-answering" }
  | { kind: "process" }
  | null;

/**
 * Given the stored state, round timing and the current server time, decide which automatic
 * transition (if any) is due. Pure — the caller applies it with a conditional UPDATE so concurrent
 * callers can't apply it twice.
 */
export function dueTransition(
  state: GameState,
  timing: RoundTiming | null,
  now: number,
  opts: { allPredicted: boolean },
): TimedTransition {
  if (!timing) return null;
  switch (state) {
    case "PREDICTION":
      if (opts.allPredicted) return { kind: "reveal", reason: "all-predicted" };
      if (now >= timing.predictionDeadline.getTime()) return { kind: "reveal", reason: "deadline" };
      return null;
    case "TOPIC_REVEAL":
      if (timing.answeringStartsAt && now >= timing.answeringStartsAt.getTime()) return { kind: "open-answering" };
      return null;
    case "ANSWERING":
      if (timing.answeringDeadline && now >= timing.answeringDeadline.getTime() + PROCESS_DELAY_MS) {
        return { kind: "process" };
      }
      return null;
    default:
      return null;
  }
}

/** Whether a submission arriving at `now` is inside the answering window. */
export function isWithinAnsweringWindow(timing: RoundTiming, now: number): boolean {
  if (!timing.answeringStartsAt || !timing.answeringDeadline) return false;
  return now >= timing.answeringStartsAt.getTime() - 250 && now <= timing.answeringDeadline.getTime() + SUBMIT_GRACE_MS;
}

export function computeRevealTiming(now: number, roundDurationSec: number) {
  const answeringStartsAt = new Date(now + REVEAL_MS);
  const answeringDeadline = new Date(now + REVEAL_MS + roundDurationSec * 1000);
  return { revealedAt: new Date(now), answeringStartsAt, answeringDeadline };
}
