import { describe, expect, it } from "vitest";
import { count } from "drizzle-orm";
import { createPgliteDb } from "@/lib/db/pglite";
import { answerAliases, answers, categories, topics } from "@/lib/db/schema";
import { runSeed } from "@/lib/seed/run-seed";
import { allCategories } from "@/data/seed";
import { FIXTURE } from "./helpers";

describe("seed script", () => {
  it("is idempotent", async () => {
    const db = await createPgliteDb();
    const counts = async () => ({
      c: (await db.select({ n: count() }).from(categories))[0].n,
      t: (await db.select({ n: count() }).from(topics))[0].n,
      a: (await db.select({ n: count() }).from(answers))[0].n,
      al: (await db.select({ n: count() }).from(answerAliases))[0].n,
    });
    await runSeed(db, { data: FIXTURE, log: () => {} });
    const first = await counts();
    await runSeed(db, { data: FIXTURE, log: () => {} });
    await runSeed(db, { data: FIXTURE, log: () => {} });
    expect(await counts()).toEqual(first);
    expect(first.t).toBe(4);
  });

  it("ships a substantial curated dataset", () => {
    const topicCount = allCategories.reduce((n, c) => n + c.topics.length, 0);
    expect(allCategories.length).toBeGreaterThanOrEqual(30);
    expect(topicCount).toBeGreaterThanOrEqual(300);
  });

  it("seeds the full dataset with at least 10,000 answers", async () => {
    const db = await createPgliteDb();
    const stats = await runSeed(db, { log: () => {} });
    expect(stats.categories).toBeGreaterThanOrEqual(30);
    expect(stats.topics).toBeGreaterThanOrEqual(300);
    expect(stats.answers).toBeGreaterThanOrEqual(10_000);
    expect(stats.warnings).toEqual([]);
  }, 120_000);
});
