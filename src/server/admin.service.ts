import { asc, eq, ilike, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { answerAliases, answers, categories, topics } from "@/lib/db/schema";
import { prepareTopic, slugify } from "@/lib/seed/parse";
import { safeEqualHex, hashToken } from "@/lib/auth/tokens";
import { invalidateTopicIndex } from "./answer-validation.service";
import { invalidateTopicCandidates } from "./round.service";
import { fail } from "./errors";

export function assertAdmin(secret: string | null) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) fail("FORBIDDEN", "The admin area is disabled. Set ADMIN_SECRET to enable it.");
  if (!secret || !safeEqualHex(hashToken(secret), hashToken(expected!))) fail("UNAUTHORIZED", "Wrong admin secret.");
}

export async function listTopics(db: Db, q: string) {
  const term = `%${q.trim()}%`;
  return db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      prompt: topics.prompt,
      difficulty: topics.difficulty,
      isActive: topics.isActive,
      category: categories.name,
      answerCount: sql<number>`(SELECT count(*)::int FROM ${answers} WHERE ${answers.topicId} = ${topics.id})`,
    })
    .from(topics)
    .innerJoin(categories, eq(categories.id, topics.categoryId))
    .where(q.trim() ? or(ilike(topics.name, term), ilike(categories.name, term)) : undefined)
    .orderBy(asc(categories.name), asc(topics.name))
    .limit(400);
}

export async function topicAnswers(db: Db, topicId: number) {
  const rows = await db
    .select({ id: answers.id, canonical: answers.canonicalAnswer, isActive: answers.isActive })
    .from(answers)
    .where(eq(answers.topicId, topicId))
    .orderBy(asc(answers.canonicalAnswer));
  const aliasRows = await db
    .select({ answerId: answerAliases.answerId, alias: answerAliases.alias })
    .from(answerAliases)
    .innerJoin(answers, eq(answers.id, answerAliases.answerId))
    .where(eq(answers.topicId, topicId));
  return rows.map((r) => ({ ...r, aliases: aliasRows.filter((a) => a.answerId === r.id).map((a) => a.alias) }));
}

/** Adds answers (and aliases) in the seed format "Canonical=alias | Next". Existing answers gain new aliases. */
export async function addAnswers(db: Db, topicId: number, src: string) {
  if (typeof src !== "string" || src.length > 50_000) fail("BAD_REQUEST", "Paste up to 50,000 characters of answers.");
  const prepared = prepareTopic({ name: "x", difficulty: "medium", answers: src });
  if (!prepared.answers.length) fail("BAD_REQUEST", "No answers found. Separate answers with | or new lines.");
  let added = 0;
  for (const a of prepared.answers) {
    const [row] = await db
      .insert(answers)
      .values({ topicId, canonicalAnswer: a.canonical, normalizedAnswer: a.normalized })
      .onConflictDoUpdate({ target: [answers.topicId, answers.normalizedAnswer], set: { isActive: sql`true` } })
      .returning({ id: answers.id, inserted: sql<boolean>`(xmax = 0)` });
    if (row.inserted) added++;
    if (a.aliases.length) {
      await db
        .insert(answerAliases)
        .values(a.aliases.map((al) => ({ answerId: row.id, alias: al.alias, normalizedAlias: al.normalized })))
        .onConflictDoNothing();
    }
  }
  invalidateTopicIndex(topicId);
  invalidateTopicCandidates();
  return { added, total: prepared.answers.length, warnings: prepared.warnings };
}

export async function createTopic(
  db: Db,
  input: { categoryId?: unknown; name?: unknown; prompt?: unknown; difficulty?: unknown; answers?: unknown },
) {
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 80) : "";
  if (!name) fail("BAD_REQUEST", "Give the topic a name.");
  const categoryId = Number(input.categoryId);
  const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!cat) fail("BAD_REQUEST", "Pick a category.");
  const difficulty = ["easy", "medium", "hard"].includes(input.difficulty as string) ? (input.difficulty as "easy") : "medium";
  const prompt =
    typeof input.prompt === "string" && input.prompt.trim()
      ? input.prompt.trim().slice(0, 140)
      : prepareTopic({ name, difficulty, answers: "" }).prompt;
  const [topic] = await db
    .insert(topics)
    .values({ categoryId, name, slug: `${slugify(name)}-${Date.now().toString(36)}`, prompt, difficulty })
    .returning();
  const result = typeof input.answers === "string" && input.answers.trim() ? await addAnswers(db, topic.id, input.answers) : null;
  invalidateTopicCandidates();
  return { topic, result };
}

export async function setTopicActive(db: Db, topicId: number, isActive: boolean) {
  await db.update(topics).set({ isActive }).where(eq(topics.id, topicId));
  invalidateTopicCandidates();
}

export async function setAnswerActive(db: Db, answerId: number, isActive: boolean) {
  const [row] = await db.update(answers).set({ isActive }).where(eq(answers.id, answerId)).returning({ topicId: answers.topicId });
  if (row) invalidateTopicIndex(row.topicId);
}
