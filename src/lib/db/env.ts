/**
 * Database URLs, accepting the names injected by Neon's Vercel integration (DATABASE_URL /
 * DATABASE_URL_UNPOOLED) and the legacy Vercel Postgres names (POSTGRES_URL / POSTGRES_URL_NON_POOLING).
 */
export function pooledDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

/** Direct (non-pooled) connection — preferred for migrations and bulk seeding. */
export function directDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || pooledDatabaseUrl();
}
