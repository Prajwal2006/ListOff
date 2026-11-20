import { and, eq, inArray } from "drizzle-orm";
import type { DbOrTx } from "@/lib/db/client";
import { answerAliases, answers } from "@/lib/db/schema";
import { TopicIndex, type IndexedAnswer } from "@/lib/validation/topic-index";

/**
 * Topic answer sets are immutable during play, so each server instance caches the compiled
 * lookup index. This is a read-through cache of database content — never game state.
 */
const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHED = 300;
const cache = new Map<number, { index: TopicIndex; at: number }>();

export function invalidateTopicIndex(topicId?: number) {
  lexicon = null;
  if (topicId === undefined) cache.clear();
  else cache.delete(topicId);
}

export async function loadTopicIndex(db: DbOrTx, topicId: number): Promise<TopicIndex> {
  const hit = cache.get(topicId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.index;

  const rows = await db
    .select({ id: answers.id, canonical: answers.canonicalAnswer, normalized: answers.normalizedAnswer })
    .from(answers)
    .where(and(eq(answers.topicId, topicId), eq(answers.isActive, true)));

  const aliasRows = rows.length
    ? await db
        .select({ answerId: answerAliases.answerId, normalized: answerAliases.normalizedAlias })
        .from(answerAliases)
        .where(inArray(answerAliases.answerId, rows.map((r) => r.id)))
    : [];

  const aliasMap = new Map<number, string[]>();
  for (const a of aliasRows) {
    const list = aliasMap.get(a.answerId) ?? [];
    list.push(a.normalized);
    aliasMap.set(a.answerId, list);
  }

  const indexed: IndexedAnswer[] = rows
    .sort((a, b) => a.id - b.id)
    .map((r) => ({ ...r, aliases: aliasMap.get(r.id) ?? [] }));
  const index = new TopicIndex(indexed);

  if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value!);
  cache.set(topicId, { index, at: Date.now() });
  return index;
}

/**
 * Every normalized answer and alias in the knowledge base, so autocorrect can tell a typo from a
 * different real answer. Loaded lazily (only when a submission misses exactly) and cached.
 */
let lexicon: { set: Set<string>; at: number } | null = null;

export async function loadAnswerLexicon(db: DbOrTx): Promise<Set<string>> {
  if (lexicon && Date.now() - lexicon.at < CACHE_TTL_MS * 2) return lexicon.set;
  const [a, al] = await Promise.all([
    db.select({ n: answers.normalizedAnswer }).from(answers),
    db.select({ n: answerAliases.normalizedAlias }).from(answerAliases),
  ]);
  const set = new Set<string>();
  for (const r of a) set.add(r.n);
  for (const r of al) set.add(r.n);
  lexicon = { set, at: Date.now() };
  return set;
}
