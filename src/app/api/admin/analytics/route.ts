import { json, route } from "@/server/http";
import { requireAdmin } from "@/server/admin.service";
import { getAnalytics } from "@/server/analytics.service";

export const GET = route(async (req, _ctx, db) => {
  requireAdmin(req);
  const days = Number(new URL(req.url).searchParams.get("days") ?? 30);
  return json(await getAnalytics(db, days));
});
