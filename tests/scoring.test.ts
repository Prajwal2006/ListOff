import { describe, expect, it } from "vitest";
import { calculatePoints, isValidPrediction, rankEntries } from "@/lib/scoring";

describe("calculatePoints — the exact rule", () => {
  it("predict 5, give 6 valid -> 5 points (extras earn nothing)", () => {
    expect(calculatePoints(6, 5)).toBe(5);
  });

  it("predict 7, give 6 valid -> 0 points", () => {
    expect(calculatePoints(6, 7)).toBe(0);
  });

  it("meeting the prediction exactly scores the prediction", () => {
    expect(calculatePoints(4, 4)).toBe(4);
  });

  it("no prediction or no answers scores 0", () => {
    expect(calculatePoints(0, 3)).toBe(0);
    expect(calculatePoints(10, null)).toBe(0);
    expect(calculatePoints(10, undefined)).toBe(0);
    expect(calculatePoints(0, 0)).toBe(0);
  });

  it("guards against nonsense input", () => {
    expect(calculatePoints(-3, 2)).toBe(0);
    expect(calculatePoints(Number.NaN, 2)).toBe(0);
    expect(calculatePoints(5, -1)).toBe(0);
  });
});

describe("isValidPrediction", () => {
  it("accepts whole numbers in range only", () => {
    expect(isValidPrediction(1)).toBe(true);
    expect(isValidPrediction(50)).toBe(true);
    expect(isValidPrediction(0)).toBe(false);
    expect(isValidPrediction(51)).toBe(false);
    expect(isValidPrediction(2.5)).toBe(false);
    expect(isValidPrediction("5")).toBe(false);
  });
});

describe("rankEntries", () => {
  it("uses competition ranking and computes previous rank", () => {
    const ranked = rankEntries([
      { participantId: "a", displayName: "Ana", totalScore: 10, roundPoints: 5 },
      { participantId: "b", displayName: "Ben", totalScore: 10, roundPoints: 0 },
      { participantId: "c", displayName: "Cy", totalScore: 4, roundPoints: 4 },
    ]);
    expect(ranked.map((r) => [r.participantId, r.rank, r.previousRank])).toEqual([
      ["a", 1, 2],
      ["b", 1, 1],
      ["c", 3, 3],
    ]);
  });
});
