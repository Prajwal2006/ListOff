/**
 * Applies SQL migrations in ./drizzle to the database in DATABASE_URL_UNPOOLED (preferred for DDL)
 * or DATABASE_URL. Safe to run repeatedly: applied migrations are tracked by drizzle.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { directDatabaseUrl } from "../src/lib/db/env";

async function main() {
  const url = directDatabaseUrl();
  if (!url) throw new Error("Set DATABASE_URL (and ideally DATABASE_URL_UNPOOLED) in .env first.");
  const client = postgres(url, { max: 1, prepare: false });
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
