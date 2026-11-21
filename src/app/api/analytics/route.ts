import { json, limit, clientIp, readJson, route } from "@/server/http";
import { recordEvent } from "@/server/analytics.service";

/** Anonymous page-view beacon. Always answers 200 so it can never break a page. */
export const POST = route(async (req, _ctx, db) => {
  limit(`analytics:${clientIp(req)}`, 120, 60_000);
  await recordEvent(db, await readJson(req));
  return json({ ok: true });
});
