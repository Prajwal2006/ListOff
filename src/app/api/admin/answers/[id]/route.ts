import { json, readJson, route } from "@/server/http";
import { requireAdmin, setAnswerActive } from "@/server/admin.service";
import { fail } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

/** Toggle a single answer: { isActive: boolean } */
export const PATCH = route<Ctx>(async (req, ctx, db) => {
  requireAdmin(req);
  const id = Number((await ctx.params).id);
  const body = await readJson<{ isActive?: unknown }>(req);
  if (!Number.isInteger(id) || typeof body.isActive !== "boolean") fail("BAD_REQUEST", "Invalid request.");
  await setAnswerActive(db, id, body.isActive as boolean);
  return json({ ok: true });
});
