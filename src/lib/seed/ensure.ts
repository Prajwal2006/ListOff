import { createHash } from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { appMeta, topics } from "@/lib/db/schema";
import { allCategories } from "@/data/seed";
import { UNIVERSITIES } from "@/data/universities";
import { prepareAll } from "./parse";
import { runSeed, type SeedStats } from "./run-seed";

const KB_KEY = "knowledge_base_version";

/**
 * Fingerprint of the knowledge base as it will be written (after parsing), so it changes whenever
 * any category, topic, answer — or a derived field such as a generated prompt — changes.
 */
export function knowledgeBaseVersion(): string {
  return createHash("sha256").update(JSON.stringify([prepareAll(allCategories), UNIVERSITIES])).digest("hex").slice(0, 16);
}

export interface EnsureResult {
  action: "seeded" | "up-to-date";
  version: string;
  stats?: SeedStats;
}

/**
 * Loads the knowledge base if it's missing or older than the bundled data, otherwise does nothing.
 * Re-deploys are therefore fast, and seeding stays idempotent if it ever runs twice.
 */
export async function ensureKnowledgeBase(db: Db, log: (msg: string) => void = () => {}): Promise<EnsureResult> {
  const version = knowledgeBaseVersion();
  const [{ value: topicCount }] = await db.select({ value: count() }).from(topics);
  const [stored] = await db.select().from(appMeta).where(eq(appMeta.key, KB_KEY)).limit(1);
  if (topicCount > 0 && stored?.value === version) return { action: "up-to-date", version };

  const stats = await runSeed(db, { log });
  await db
    .insert(appMeta)
    .values({ key: KB_KEY, value: version })
    .onConflictDoUpdate({ target: appMeta.key, set: { value: version, updatedAt: sql`now()` } });
  return { action: "seeded", version, stats };
}

export async function storedKnowledgeBaseVersion(db: Db): Promise<string | null> {
  const [row] = await db.select().from(appMeta).where(eq(appMeta.key, KB_KEY)).limit(1);
  return row?.value ?? null;
}
