import { count, sql } from "drizzle-orm";
import { answers, categories, topics } from "@/lib/db/schema";
import { pooledDatabaseUrl } from "@/lib/db/env";
import { knowledgeBaseVersion, storedKnowledgeBaseVersion } from "@/lib/seed/ensure";
import { json, route } from "@/server/http";

/**
 * Deployment check: confirms the database is reachable and the knowledge base is loaded.
 * Exposes counts only — never connection details.
 */
export const GET = route(async (_req, _ctx, db) => {
  const started = Date.now();
  await db.execute(sql`select 1`);
  const [[c], [t], [a]] = await Promise.all([
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(topics),
    db.select({ n: count() }).from(answers),
  ]);
  const loaded = await storedKnowledgeBaseVersion(db);
  const bundled = knowledgeBaseVersion();
  const ok = t.n > 0;
  return json(
    {
      ok,
      database: pooledDatabaseUrl() ? "postgres" : "pglite (local dev)",
      latencyMs: Date.now() - started,
      knowledgeBase: {
        categories: c.n,
        topics: t.n,
        answers: a.n,
        version: loaded,
        upToDate: loaded === bundled,
      },
    },
    { status: ok ? 200 : 503 },
  );
});
