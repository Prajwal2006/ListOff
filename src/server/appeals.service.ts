import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { answerAppeals, topics } from "@/lib/db/schema";
import { normalizeAnswer, MAX_ANSWER_LENGTH } from "@/lib/validation/normalize";
import { addAnswers } from "./admin.service";
import { loadAnswerLexicon, loadTopicIndex } from "./answer-validation.service";
import { fail } from "./errors";

/** A player says "this should have counted". Repeat reports of the same text just raise its count. */
export async function submitAppeal(db: Db, input: { topicId?: unknown; text?: unknown; note?: unknown }) {
  const topicId = Number(input.topicId);
  if (!Number.isInteger(topicId) || topicId <= 0) fail("BAD_REQUEST", "Unknown topic.");
  if (typeof input.text !== "string") fail("BAD_REQUEST", "Nothing to appeal.");
  const text = (input.text as string).replace(/\s+/g, " ").trim();
  const normalized = normalizeAnswer(text);
  if (!text || !normalized) fail("BAD_REQUEST", "Nothing to appeal.");
  if (text.length > MAX_ANSWER_LENGTH) fail("BAD_REQUEST", `Answers can be up to ${MAX_ANSWER_LENGTH} characters.`);
  const note = typeof input.note === "string" ? input.note.replace(/\s+/g, " ").trim().slice(0, 300) || null : null;

  const [topic] = await db.select({ id: topics.id }).from(topics).where(eq(topics.id, topicId)).limit(1);
  if (!topic) fail("NOT_FOUND", "Unknown topic.");

  // Don't queue answers the game already accepts.
  const index = await loadTopicIndex(db, topicId);
  const lexicon = await loadAnswerLexicon(db);
  if (index.match(text, { isKnownAnswer: (k) => lexicon.has(k) }).answerId !== null) {
    fail("CONFLICT", "That answer is already accepted for this topic.");
  }

  await db
    .insert(answerAppeals)
    .values({ topicId, submittedText: text, normalizedText: normalized, note })
    .onConflictDoUpdate({
      target: [answerAppeals.topicId, answerAppeals.normalizedText],
      set: {
        reportCount: sql`${answerAppeals.reportCount} + 1`,
        lastReportedAt: sql`now()`,
        note: sql`coalesce(${answerAppeals.note}, excluded.note)`,
        // A rejected answer that keeps getting reported deserves another look.
        status: sql`case when ${answerAppeals.status} = 'REJECTED' and ${answerAppeals.reportCount} >= 2 then 'PENDING'::appeal_status else ${answerAppeals.status} end`,
      },
    });
  return { ok: true as const };
}

export async function listAppeals(db: Db, status: string) {
  const s = ["PENDING", "APPROVED", "REJECTED"].includes(status) ? (status as "PENDING") : "PENDING";
  return db
    .select({
      id: answerAppeals.id,
      topicId: answerAppeals.topicId,
      topic: topics.name,
      text: answerAppeals.submittedText,
      note: answerAppeals.note,
      status: answerAppeals.status,
      reportCount: answerAppeals.reportCount,
      lastReportedAt: answerAppeals.lastReportedAt,
    })
    .from(answerAppeals)
    .innerJoin(topics, eq(topics.id, answerAppeals.topicId))
    .where(eq(answerAppeals.status, s))
    .orderBy(desc(answerAppeals.reportCount), desc(answerAppeals.lastReportedAt))
    .limit(300);
}

/**
 * Approving adds the answer to its topic (optionally as an alias of an existing answer, using the
 * admin's wording in the seed format, e.g. "Canonical=alias"). Rejecting just closes the appeal.
 */
export async function resolveAppeal(db: Db, id: number, input: { action?: unknown; answer?: unknown }) {
  const [appeal] = await db.select().from(answerAppeals).where(eq(answerAppeals.id, id)).limit(1);
  if (!appeal) fail("NOT_FOUND", "Appeal not found.");
  if (input.action === "reject" || input.action === "reopen") {
    await db
      .update(answerAppeals)
      .set(input.action === "reject" ? { status: "REJECTED", resolvedAt: sql`now()` } : { status: "PENDING", resolvedAt: null })
      .where(eq(answerAppeals.id, id));
    return { ok: true as const };
  }
  if (input.action !== "approve") fail("BAD_REQUEST", "Unknown action.");
  const src =
    typeof input.answer === "string" && input.answer.trim() ? input.answer.trim() : appeal.submittedText;
  const result = await addAnswers(db, appeal.topicId, src);
  await db
    .update(answerAppeals)
    .set({ status: "APPROVED", resolvedAt: sql`now()` })
    .where(and(eq(answerAppeals.id, id)));
  return { ok: true as const, added: result.added };
}
