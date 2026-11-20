import { json, limit, readJson, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { placeSoloBid } from "@/server/solo.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, ctx, db) => {
  const user = await requireUser();
  limit(`solo-bid:${user.id}`, 30, 60_000);
  const body = await readJson<{ count?: unknown }>(req);
  return json({ round: await placeSoloBid(db, user.id, (await ctx.params).id, body.count) });
});
