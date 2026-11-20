import { json, limit, readJson, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { saveProfile } from "@/server/solo.service";

export const PUT = route(async (req, _ctx, db) => {
  const user = await requireUser();
  limit(`profile:${user.id}`, 20, 60_000);
  const body = await readJson(req);
  return json({ profile: await saveProfile(db, user.id, body) });
});
