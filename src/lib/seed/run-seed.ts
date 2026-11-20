import { sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { answerAliases, answers, categories, topics } from "@/lib/db/schema";
import { allCategories } from "@/data/seed";
import { prepareAll } from "./parse";
import type { CategorySeed } from "./types";

// Rows per INSERT. Overridable for constrained environments.
const CHUNK = Number(process.env.SEED_CHUNK) || 500;

function chunks<T>(arr: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export interface SeedStats {
  categories: number;
  topics: number;
  answers: number;
  aliases: number;
  warnings: string[];
}

/**
 * Idempotent seeder. Categories and topics upsert on slug, answers on (topic, normalized answer),
 * aliases on (answer, normalized alias). Re-running updates names/prompts in place and never
 * creates duplicates. Answers added later through the admin UI are left untouched.
 */
export async function runSeed(
  db: Db,
  opts: { data?: CategorySeed[]; log?: (msg: string) => void } = {},
): Promise<SeedStats> {
  const log = opts.log ?? console.log;
  const data = prepareAll(opts.data ?? allCategories);
  const warnings: string[] = [];
  let answerCount = 0;
  let aliasCount = 0;

  const catRows = await db
    .insert(categories)
    .values(data.map((c) => ({ name: c.name, slug: c.slug, description: c.description, icon: c.icon, source: c.source ?? null })))
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        icon: sql`excluded.icon`,
        source: sql`excluded.source`,
      },
    })
    .returning({ id: categories.id, slug: categories.slug });
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));
  log(`categories: ${catRows.length}`);

  const topicValues = data.flatMap((c) =>
    c.prepared.map((t) => ({
      categoryId: catId.get(c.slug)!,
      name: t.name,
      slug: t.slug,
      prompt: t.prompt,
      description: t.description,
      difficulty: t.difficulty,
      isActive: t.active,
    })),
  );
  const topicRows: { id: number; slug: string }[] = [];
  for (const part of chunks(topicValues)) {
    topicRows.push(
      ...(await db
        .insert(topics)
        .values(part)
        .onConflictDoUpdate({
          target: topics.slug,
          set: {
            categoryId: sql`excluded.category_id`,
            name: sql`excluded.name`,
            prompt: sql`excluded.prompt`,
            description: sql`excluded.description`,
            difficulty: sql`excluded.difficulty`,
            isActive: sql`excluded.is_active`,
          },
        })
        .returning({ id: topics.id, slug: topics.slug })),
    );
  }
  const topicId = new Map(topicRows.map((t) => [t.slug, t.id]));
  log(`topics: ${topicRows.length}`);

  const all = data.flatMap((c) => c.prepared);
  for (const t of all) for (const w of t.warnings) warnings.push(`[${t.slug}] ${w}`);

  const answerValues = all.flatMap((t) =>
    t.answers.map((a) => ({
      topicId: topicId.get(t.slug)!,
      canonicalAnswer: a.canonical,
      normalizedAnswer: a.normalized,
      isActive: true,
    })),
  );
  const answerIdByKey = new Map<string, number>();
  for (const part of chunks(answerValues)) {
    const rows = await db
      .insert(answers)
      .values(part)
      .onConflictDoUpdate({
        target: [answers.topicId, answers.normalizedAnswer],
        set: { canonicalAnswer: sql`excluded.canonical_answer`, isActive: sql`true` },
      })
      .returning({ id: answers.id, topicId: answers.topicId, normalized: answers.normalizedAnswer });
    for (const r of rows) answerIdByKey.set(`${r.topicId}:${r.normalized}`, r.id);
    answerCount += rows.length;
  }
  log(`answers: ${answerCount}`);

  const aliasValues = all.flatMap((t) =>
    t.answers.flatMap((a) => {
      const id = answerIdByKey.get(`${topicId.get(t.slug)}:${a.normalized}`)!;
      return a.aliases.map((al) => ({ answerId: id, alias: al.alias, normalizedAlias: al.normalized }));
    }),
  );
  for (const part of chunks(aliasValues)) {
    await db.insert(answerAliases).values(part).onConflictDoNothing();
    aliasCount += part.length;
  }
  log(`aliases: ${aliasCount}`);

  return { categories: catRows.length, topics: topicRows.length, answers: answerCount, aliases: aliasCount, warnings };
}
