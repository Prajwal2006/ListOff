import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { pooledDatabaseUrl } from "./env";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbOrTx = Db | Tx;

type Holder = { db?: Db; init?: Promise<Db> };
// Survive Next.js dev hot reloads without opening a new pool each time.
const holder = ((globalThis as unknown as { __listoffDb?: Holder }).__listoffDb ??= {});

/**
 * Returns the shared Drizzle client.
 *
 * - Production / any env with DATABASE_URL: Neon Postgres via postgres.js (works with Neon's
 *   pooled connection string on Vercel serverless functions).
 * - Local dev without DATABASE_URL: an on-disk PGlite database in ./.pglite, migrated and seeded
 *   on first use so the game is playable with zero setup. Never used in production.
 */
export function getDb(): Promise<Db> {
  if (holder.db) return Promise.resolve(holder.db);
  holder.init ??= createDb().then((db) => (holder.db = db));
  return holder.init;
}

/** Test hook: inject an isolated database. */
export function setDb(db: Db | undefined) {
  holder.db = db;
  holder.init = db ? Promise.resolve(db) : undefined;
}

async function createDb(): Promise<Db> {
  const url = pooledDatabaseUrl();
  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const client = postgres(url, {
      // Neon's pooler runs PgBouncer in transaction mode: no prepared statements.
      prepare: false,
      max: Number(process.env.DB_POOL_MAX ?? 5),
      idle_timeout: 20,
      connect_timeout: 15,
    });
    return drizzle(client, { schema }) as unknown as Db;
  }

  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PGLITE) {
    throw new Error(
      "No database configured. On Vercel: Storage → Create Database → Neon, then redeploy. Elsewhere: set DATABASE_URL.",
    );
  }

  const { createPgliteDb } = await import("./pglite");
  return createPgliteDb({ dataDir: process.env.PGLITE_DIR ?? "./.pglite", seed: true });
}
