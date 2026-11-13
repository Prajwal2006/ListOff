/**
 * Seeds the knowledge base (categories, topics, answers, aliases). Idempotent: re-running updates
 * rows in place and never creates duplicates. Usage: `npm run db:seed`.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/client";
import { runSeed } from "../src/lib/seed/run-seed";
import { directDatabaseUrl } from "../src/lib/db/env";

async function main() {
  const url = directDatabaseUrl();
  if (!url) throw new Error("Set DATABASE_URL (and ideally DATABASE_URL_UNPOOLED) in .env first.");
  const client = postgres(url, { max: 1, prepare: false });
  const started = Date.now();
  try {
    const db = drizzle(client, { schema }) as unknown as Db;
    const stats = await runSeed(db);
    for (const w of stats.warnings) console.warn("warn:", w);
    console.log(
      `Seeded ${stats.categories} categories, ${stats.topics} topics, ${stats.answers} answers, ${stats.aliases} aliases in ${((Date.now() - started) / 1000).toFixed(1)}s.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
