/**
 * Gets the database ready: applies migrations, then loads the knowledge base if it's missing or
 * out of date. Runs automatically before `next build`, so every Vercel deployment (production and
 * Neon preview branches alike) has a migrated, seeded database with zero manual steps.
 *
 *   - No database configured locally  → skipped (local dev uses the embedded PGlite fallback).
 *   - No database configured on Vercel → the build fails with instructions to add Neon.
 *   - SKIP_DB_PREPARE=1                → skipped.
 *
 * Safe to run repeatedly and concurrently (guarded by a Postgres advisory lock).
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/client";
import { directDatabaseUrl } from "../src/lib/db/env";
import { ensureKnowledgeBase } from "../src/lib/seed/ensure";

config({ quiet: true });
config({ path: ".env.local", override: false, quiet: true });

const LOCK_ID = 7_265_501; // arbitrary, app-specific advisory lock key

async function main() {
  if (process.env.SKIP_DB_PREPARE === "1") {
    console.log("[listoff] SKIP_DB_PREPARE=1 — skipping database preparation.");
    return;
  }
  const url = directDatabaseUrl();
  if (!url) {
    if (process.env.VERCEL) {
      console.error(
        [
          "",
          "✖ ListOff needs a Postgres database, but none is connected to this Vercel project.",
          "",
          "  Fix (about a minute):",
          "    1. Vercel dashboard → your project → Storage → Create Database → Neon (free tier is fine).",
          "    2. Connect it to all environments (it sets DATABASE_URL and DATABASE_URL_UNPOOLED).",
          "    3. Deployments → … → Redeploy.",
          "",
          "  The build migrates and seeds the database automatically.",
          "",
        ].join("\n"),
      );
      process.exit(1);
    }
    console.log("[listoff] No DATABASE_URL — skipping (local dev uses the embedded PGlite database).");
    return;
  }

  const started = Date.now();
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    await client`select pg_advisory_lock(${LOCK_ID})`;
    try {
      console.log("[listoff] Applying migrations…");
      await migrate(drizzle(client), { migrationsFolder: "./drizzle" });

      const db = drizzle(client, { schema }) as unknown as Db;
      const result = await ensureKnowledgeBase(db, (m) => console.log(`[listoff]   ${m}`));
      if (result.action === "seeded") {
        const s = result.stats!;
        for (const w of s.warnings) console.warn("[listoff] warn:", w);
        console.log(
          `[listoff] Knowledge base loaded (v${result.version}): ${s.categories} categories, ${s.topics} topics, ${s.answers} answers, ${s.aliases} aliases.`,
        );
      } else {
        console.log(`[listoff] Knowledge base already current (v${result.version}).`);
      }
    } finally {
      await client`select pg_advisory_unlock(${LOCK_ID})`;
    }
    console.log(`[listoff] Database ready in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  const cause = err instanceof Error && err.cause instanceof Error ? err.cause : null;
  // Drizzle's "Failed query" message embeds every bound parameter; keep only the head.
  const message = err instanceof Error ? err.message.split("params:")[0].slice(0, 300) : String(err);
  console.error("[listoff] Database preparation failed:", cause ? `${cause.message} (${message.slice(0, 120)}…)` : message);
  process.exit(1);
});
