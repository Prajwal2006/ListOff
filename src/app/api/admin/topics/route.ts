import { json, readJson, route } from "@/server/http";
import { assertAdmin, createTopic, listTopics } from "@/server/admin.service";

const secret = (req: Request) => req.headers.get("x-admin-secret");

export const GET = route(async (req, _ctx, db) => {
  assertAdmin(secret(req));
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return json({ topics: await listTopics(db, q.slice(0, 80)) });
});

export const POST = route(async (req, _ctx, db) => {
  assertAdmin(secret(req));
  return json(await createTopic(db, await readJson(req)), { status: 201 });
});
