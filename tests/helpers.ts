import type { Db } from "@/lib/db/client";
import { createPgliteDb } from "@/lib/db/pglite";
import { runSeed } from "@/lib/seed/run-seed";
import type { CategorySeed } from "@/lib/seed/types";
import { clock } from "@/lib/utils/clock";
import { invalidateTopicIndex } from "@/server/answer-validation.service";
import { invalidateTopicCandidates } from "@/server/round.service";

export const FIXTURE: CategorySeed[] = [
  {
    name: "Test Food",
    slug: "test-food",
    icon: "apple",
    description: "fixture",
    topics: [
      {
        name: "Fruits",
        slug: "test-fruits",
        difficulty: "easy",
        answers:
          "Apple|Banana|Mango|Orange|Grape=Grapes|Watermelon|Strawberry|Kiwi=Kiwifruit|Pineapple|Cherry|Peach|Pear|Plum|Lychee=Litchi",
      },
      {
        name: "Vegetables",
        slug: "test-vegetables",
        difficulty: "easy",
        answers: "Carrot|Potato|Onion|Garlic|Broccoli|Cabbage|Spinach|Kale|Cucumber|Eggplant=Aubergine|Leek|Pea",
      },
    ],
  },
  {
    name: "Test Places",
    slug: "test-places",
    icon: "globe",
    description: "fixture",
    topics: [
      {
        name: "US cities",
        slug: "test-us-cities",
        difficulty: "easy",
        answers: "New York City=New York=NYC|Los Angeles=LA|Chicago|Houston|Phoenix|Boston|Seattle|Denver|Miami|Dallas|St. Louis",
      },
      {
        name: "Colors",
        slug: "test-colors",
        difficulty: "easy",
        answers: "Red|Orange|Yellow|Green|Blue|Purple|Pink|Brown|Black|White|Grey=Gray",
      },
    ],
  },
];

/**
 * In-memory PGlite by default. Set TEST_DATABASE_URL to run the same tests over the production
 * driver (postgres.js) against a real Postgres — e.g. a throwaway Neon branch.
 */
export async function makeTestDb(): Promise<Db> {
  const db = process.env.TEST_DATABASE_URL ? await postgresTestDb(process.env.TEST_DATABASE_URL) : await createPgliteDb();
  await runSeed(db, { data: FIXTURE, log: () => {} });
  invalidateTopicIndex();
  invalidateTopicCandidates();
  return db;
}

async function postgresTestDb(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const schema = await import("@/lib/db/schema");
  const client = postgres(url, { prepare: false, max: Number(process.env.DB_POOL_MAX ?? 5), onnotice: () => {} });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db as unknown as Db;
}

/** A controllable clock for simulating timers. */
export function fakeClock(start = Date.UTC(2026, 0, 1, 12, 0, 0)) {
  let now = start;
  clock.set(() => now);
  return {
    get now() {
      return now;
    },
    advance(ms: number) {
      now += ms;
    },
    set(t: number) {
      now = t;
    },
  };
}
