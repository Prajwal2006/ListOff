import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { answers, soloAnswers, soloRounds, topics } from "@/lib/db/schema";
import { assertAdmin } from "@/server/admin.service";
import { cleanPath, getAnalytics, recordEvent } from "@/server/analytics.service";
import { listAppeals, resolveAppeal, submitAppeal } from "@/server/appeals.service";
import { loadTopicIndex } from "@/server/answer-validation.service";
import { GameError } from "@/server/errors";
import { makeTestDb } from "./helpers";

let db: Db;
let fruits: number;

beforeAll(async () => {
  db = await makeTestDb();
  [{ id: fruits }] = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, "test-fruits"));
});

describe("admin password", () => {
  it("accepts the built-in password and rejects others", () => {
    expect(() => assertAdmin("BabluAdmin123#")).not.toThrow();
    expect(() => assertAdmin("babluadmin123#")).toThrow(GameError);
    expect(() => assertAdmin(null)).toThrow(GameError);
  });
});

describe("analytics", () => {
  it("normalizes dynamic paths and drops junk events", async () => {
    expect(cleanPath("/game/ABCD?x=1")).toBe("/game/[code]");
    expect(cleanPath("javascript:alert(1)")).toBeNull();
    await recordEvent(db, { name: "not_allowed", path: "/" });
    await recordEvent(db, { name: "page_view", path: "/", anonId: "abcd-1234-efgh", device: "mobile", referrer: "https://example.com/x?y" });
    await recordEvent(db, { name: "page_view", path: "/privacy", anonId: "abcd-1234-efgh", device: "bogus" });
    const r = await getAnalytics(db, 30);
    expect(r.totals.pageViews).toBe(2);
    expect(r.totals.visitors).toBe(1);
    expect(r.referrers).toEqual([{ label: "example.com", n: 1 }]);
    expect(r.series).toHaveLength(30);
    expect(r.series.at(-1)!.views).toBe(2);
  });
});

describe("appeals", () => {
  it("queues, dedupes, refuses already-accepted answers, and approving teaches the topic", async () => {
    await expect(submitAppeal(db, { topicId: fruits, text: "Apple" })).rejects.toThrow(/already accepted/);
    await submitAppeal(db, { topicId: fruits, text: "Dragon fruit" });
    await submitAppeal(db, { topicId: fruits, text: "  dragon   FRUIT " });
    let list = await listAppeals(db, "PENDING");
    expect(list).toHaveLength(1);
    expect(list[0].reportCount).toBe(2);
    expect((await getAnalytics(db, 30)).totals.appealsPending).toBe(1);

    expect((await loadTopicIndex(db, fruits)).match("Dragon fruit", { autocorrect: false }).answerId).toBeNull();
    await resolveAppeal(db, list[0].id, { action: "approve", answer: "Dragon fruit=Pitaya" });
    list = await listAppeals(db, "PENDING");
    expect(list).toHaveLength(0);
    expect((await listAppeals(db, "APPROVED"))).toHaveLength(1);
    const idx = await loadTopicIndex(db, fruits);
    expect(idx.match("Dragon fruit", { autocorrect: false }).answerId).not.toBeNull();
    expect(idx.match("pitaya", { autocorrect: false }).answerId).not.toBeNull();
    expect((await db.select().from(answers).where(eq(answers.topicId, fruits))).some((a) => a.canonicalAnswer === "Dragon fruit")).toBe(true);
  });

  it("can reject and reopen", async () => {
    await submitAppeal(db, { topicId: fruits, text: "Spaghetti" });
    const [a] = await listAppeals(db, "PENDING");
    await resolveAppeal(db, a.id, { action: "reject" });
    expect(await listAppeals(db, "PENDING")).toHaveLength(0);
    await resolveAppeal(db, a.id, { action: "reopen" });
    expect(await listAppeals(db, "PENDING")).toHaveLength(1);
  });
});

describe("analytics from gameplay", () => {
  it("reports topic popularity and most-rejected answers", async () => {
    const userId = "00000000-0000-4000-8000-000000000001";
    for (let i = 0; i < 3; i++) {
      const [r] = await db
        .insert(soloRounds)
        .values({ userId: i === 2 ? userId : `00000000-0000-4000-8000-00000000010${i}`, topicId: fruits, status: "COMPLETE", predictedCount: 5, roundDuration: 20, validCount: 2, points: 0 })
        .returning();
      await db.insert(soloAnswers).values({ roundId: r.id, submittedText: "Tomato", normalizedText: "tomato", isValid: false });
    }
    const r = await getAnalytics(db, 30);
    expect(r.totals.soloCompleted).toBe(3);
    expect(r.totals.answersSubmitted).toBe(3);
    expect(r.totals.answerAcceptRate).toBe(0);
    expect(r.popularTopics[0]).toMatchObject({ name: "Fruits", plays: 3, hitRate: 0 });
    expect(r.hardestTopics[0].name).toBe("Fruits");
    expect(r.topRejected[0]).toMatchObject({ text: "Tomato", count: 3, topic: "Fruits" });
    expect(r.categories[0]).toEqual({ label: "Test Food", n: 3 });
  });
});
