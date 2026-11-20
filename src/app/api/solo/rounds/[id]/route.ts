import { json, limit, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { getSoloRound } from "@/server/solo.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, ctx, db) => {
  const user = await requireUser();
  limit(`solo-get:${user.id}`, 240, 60_000);
  return json({ round: await getSoloRound(db, user.id, (await ctx.params).id) });
});
