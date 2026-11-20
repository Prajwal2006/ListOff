import { json, limit, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { skipSoloRound } from "@/server/solo.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (_req, ctx, db) => {
  const user = await requireUser();
  limit(`solo-skip:${user.id}`, 30, 60_000);
  await skipSoloRound(db, user.id, (await ctx.params).id);
  return json({ ok: true });
});
