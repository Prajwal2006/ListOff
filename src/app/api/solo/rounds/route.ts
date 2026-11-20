import { json, limit, route } from "@/server/http";
import { requireUser } from "@/server/session";
import { startSoloRound } from "@/server/solo.service";

/** Starts a solo round with a random topic (or resumes the open one). */
export const POST = route(async (_req, _ctx, db) => {
  const user = await requireUser();
  limit(`solo-start:${user.id}`, 30, 60_000);
  return json({ round: await startSoloRound(db, user.id) });
});
