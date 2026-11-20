import { json, limit, readJson, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { submitSoloAnswer } from "@/server/solo.service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, ctx, db) => {
  const user = await requireUser();
  limit(`solo-answer:${user.id}`, 150, 60_000);
  const body = await readJson<{ text?: unknown }>(req);
  return json(await submitSoloAnswer(db, user.id, (await ctx.params).id, body.text));
});
