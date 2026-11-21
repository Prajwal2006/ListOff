import { json, limit, clientIp, readJson, route } from "@/server/http";
import { submitAppeal } from "@/server/appeals.service";

export const POST = route(async (req, _ctx, db) => {
  limit(`appeal:${clientIp(req)}`, 20, 60_000);
  return json(await submitAppeal(db, await readJson(req)), { status: 201 });
});
