import { json, readJson, route } from "@/server/http";
import { requireAdmin, createTopic, listTopics } from "@/server/admin.service";


export const GET = route(async (req, _ctx, db) => {
  requireAdmin(req);
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return json({ topics: await listTopics(db, q.slice(0, 80)) });
});

export const POST = route(async (req, _ctx, db) => {
  requireAdmin(req);
  return json(await createTopic(db, await readJson(req)), { status: 201 });
});
