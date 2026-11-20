import { clientIp, json, limit, readJson, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { addUniversity, searchUniversities } from "@/server/solo.service";

export const GET = route(async (req, _ctx, db) => {
  limit(`uni-search:${clientIp(req)}`, 120, 60_000);
  const p = new URL(req.url).searchParams;
  return json({ universities: await searchUniversities(db, { country: p.get("country"), state: p.get("state"), q: p.get("q") }) });
});

export const POST = route(async (req, _ctx, db) => {
  const user = await requireUser();
  limit(`uni-add:${user.id}`, 5, 60_000);
  return json({ university: await addUniversity(db, user.id, await readJson(req)) });
});
