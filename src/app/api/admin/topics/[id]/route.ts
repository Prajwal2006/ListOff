import { json, readJson, route } from "@/server/http";
import { addAnswers, requireAdmin, setTopicActive, topicAnswers } from "@/server/admin.service";
import { fail } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };
async function topicId(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) fail("NOT_FOUND", "Topic not found.");
  return id;
}

export const GET = route<Ctx>(async (req, ctx, db) => {
  requireAdmin(req);
  return json({ answers: await topicAnswers(db, await topicId(ctx)) });
});

/** Add answers: { answers: "Canonical=alias | Next" } */
export const POST = route<Ctx>(async (req, ctx, db) => {
  requireAdmin(req);
  const body = await readJson<{ answers?: string }>(req);
  return json(await addAnswers(db, await topicId(ctx), body.answers ?? ""));
});

/** Toggle: { isActive: boolean } */
export const PATCH = route<Ctx>(async (req, ctx, db) => {
  requireAdmin(req);
  const body = await readJson<{ isActive?: unknown }>(req);
  if (typeof body.isActive !== "boolean") fail("BAD_REQUEST", "isActive must be true or false.");
  await setTopicActive(db, await topicId(ctx), body.isActive as boolean);
  return json({ ok: true });
});
