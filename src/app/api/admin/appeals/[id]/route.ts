import { json, readJson, route } from "@/server/http";
import { requireAdmin } from "@/server/admin.service";
import { resolveAppeal } from "@/server/appeals.service";
import { fail } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

/** { action: "approve" | "reject" | "reopen", answer?: "Canonical=alias" } */
export const POST = route<Ctx>(async (req, ctx, db) => {
  requireAdmin(req);
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) fail("BAD_REQUEST", "Invalid request.");
  return json(await resolveAppeal(db, id, await readJson(req)));
});
