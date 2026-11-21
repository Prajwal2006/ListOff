import { json, route } from "@/server/http";
import { requireAdmin } from "@/server/admin.service";
import { listAppeals } from "@/server/appeals.service";

export const GET = route(async (req, _ctx, db) => {
  requireAdmin(req);
  const status = new URL(req.url).searchParams.get("status") ?? "PENDING";
  return json({ appeals: await listAppeals(db, status) });
});
