import path from "node:path";
import type { Db } from "./client";
import * as schema from "./schema";

/**
 * Creates a PGlite-backed Drizzle client (embedded Postgres compiled to WASM).
 * Used by the test-suite (in-memory) and as the zero-config local dev fallback (on disk).
 */
export async function createPgliteDb(opts: { dataDir?: string; seed?: boolean } = {}): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  // Dev/test only: keep these paths out of production file tracing.
  const client = opts.dataDir ? new PGlite(path.resolve(/*turbopackIgnore: true*/ opts.dataDir)) : new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.resolve(/*turbopackIgnore: true*/ process.cwd(), "drizzle") });

  if (opts.seed) {
    // Seeds on first run, and re-seeds whenever the bundled knowledge base changes.
    const { ensureKnowledgeBase } = await import("../seed/ensure");
    const result = await ensureKnowledgeBase(db as unknown as Db);
    if (result.stats) {
      console.log(`[listoff] Loaded knowledge base into local PGlite: ${result.stats.topics} topics / ${result.stats.answers} answers.`);
    }
  }
  return db as unknown as Db;
}
