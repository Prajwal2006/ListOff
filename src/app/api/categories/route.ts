import { asc, eq, sql } from "drizzle-orm";
import { categories, topics } from "@/lib/db/schema";
import { json, route } from "@/server/http";

export const GET = route(async (_req, _ctx, db) => {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      description: categories.description,
      topicCount: sql<number>`count(${topics.id}) FILTER (WHERE ${topics.isActive} = true)::int`,
    })
    .from(categories)
    .leftJoin(topics, eq(topics.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
  return json({ categories: rows.map((r) => ({ ...r, topicCount: Number(r.topicCount) })) });
});
