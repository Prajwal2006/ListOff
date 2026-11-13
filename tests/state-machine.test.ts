import { describe, expect, it } from "vitest";
import {
  PROCESS_DELAY_MS,
  REVEAL_MS,
  SUBMIT_GRACE_MS,
  canTransition,
  computeRevealTiming,
  dueTransition,
  isWithinAnsweringWindow,
} from "@/lib/game-engine/state-machine";

const t0 = 1_000_000;
const predictionOnly = { predictionDeadline: new Date(t0 + 30_000), answeringStartsAt: null, answeringDeadline: null };

describe("transition table", () => {
  it("allows the documented flow", () => {
    expect(canTransition("LOBBY", "PREDICTION")).toBe(true);
    expect(canTransition("PREDICTION", "TOPIC_REVEAL")).toBe(true);
    expect(canTransition("TOPIC_REVEAL", "ANSWERING")).toBe(true);
    expect(canTransition("ANSWERING", "ROUND_PROCESSING")).toBe(true);
    expect(canTransition("ROUND_PROCESSING", "ROUND_LEADERBOARD")).toBe(true);
    expect(canTransition("ROUND_LEADERBOARD", "PREDICTION")).toBe(true);
    expect(canTransition("ROUND_LEADERBOARD", "GAME_FINISHED")).toBe(true);
  });

  it("forbids skipping the prediction phase or going backwards", () => {
    expect(canTransition("LOBBY", "TOPIC_REVEAL")).toBe(false);
    expect(canTransition("LOBBY", "ANSWERING")).toBe(false);
    expect(canTransition("ANSWERING", "PREDICTION")).toBe(false);
    expect(canTransition("GAME_FINISHED", "LOBBY")).toBe(false);
  });
});

describe("dueTransition", () => {
  it("waits during prediction until all predict or the deadline passes", () => {
    expect(dueTransition("PREDICTION", predictionOnly, t0, { allPredicted: false })).toBeNull();
    expect(dueTransition("PREDICTION", predictionOnly, t0, { allPredicted: true })).toEqual({
      kind: "reveal",
      reason: "all-predicted",
    });
    expect(dueTransition("PREDICTION", predictionOnly, t0 + 30_000, { allPredicted: false })).toEqual({
      kind: "reveal",
      reason: "deadline",
    });
  });

  it("opens answering after the reveal countdown and tallies after the deadline + delay", () => {
    const timing = { predictionDeadline: new Date(t0), ...computeRevealTiming(t0, 20) };
    expect(dueTransition("TOPIC_REVEAL", timing, t0 + REVEAL_MS - 1, { allPredicted: false })).toBeNull();
    expect(dueTransition("TOPIC_REVEAL", timing, t0 + REVEAL_MS, { allPredicted: false })).toEqual({ kind: "open-answering" });
    const deadline = t0 + REVEAL_MS + 20_000;
    expect(dueTransition("ANSWERING", timing, deadline, { allPredicted: false })).toBeNull();
    expect(dueTransition("ANSWERING", timing, deadline + PROCESS_DELAY_MS, { allPredicted: false })).toEqual({ kind: "process" });
  });

  it("does nothing in lobby, leaderboard or finished states", () => {
    for (const s of ["LOBBY", "ROUND_LEADERBOARD", "GAME_FINISHED"] as const) {
      expect(dueTransition(s, predictionOnly, t0 + 10 ** 9, { allPredicted: true })).toBeNull();
    }
  });
});

describe("answering window", () => {
  const timing = { predictionDeadline: new Date(t0), ...computeRevealTiming(t0, 20) };
  const start = t0 + REVEAL_MS;
  const end = start + 20_000;

  it("accepts submissions inside the window plus a small network grace", () => {
    expect(isWithinAnsweringWindow(timing, start)).toBe(true);
    expect(isWithinAnsweringWindow(timing, end)).toBe(true);
    expect(isWithinAnsweringWindow(timing, end + SUBMIT_GRACE_MS)).toBe(true);
  });

  it("rejects early and late submissions", () => {
    expect(isWithinAnsweringWindow(timing, start - 1000)).toBe(false);
    expect(isWithinAnsweringWindow(timing, end + SUBMIT_GRACE_MS + 1)).toBe(false);
  });

  it("the tally always starts after the last accepted submission", () => {
    expect(PROCESS_DELAY_MS).toBeGreaterThan(SUBMIT_GRACE_MS);
  });
});
