import { MODERATOR_HEADER, json, readCode, readJson, route, type CodeParams } from "@/server/http";
import { updateSettings } from "@/server/game.service";
import { assertModerator, getGameByCode } from "@/server/participant.service";

export const PATCH = route<CodeParams>(async (req, ctx, db) => {
  const game = await getGameByCode(db, await readCode(ctx));
  assertModerator(game, req.headers.get(MODERATOR_HEADER));
  await updateSettings(db, game, await readJson(req));
  return json({ ok: true });
});
