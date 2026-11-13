import { createGame } from "@/server/game.service";
import { clientIp, json, limit, readJson, route } from "@/server/http";

export const POST = route(async (req, _ctx, db) => {
  limit(`create:${clientIp(req)}`, 10, 60_000);
  const body = await readJson(req);
  const { game, moderatorToken } = await createGame(db, body);
  return json({ code: game.gameCode, moderatorToken }, { status: 201 });
});
