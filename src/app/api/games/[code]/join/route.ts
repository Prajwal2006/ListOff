import { clientIp, json, limit, readCode, readJson, route, type CodeParams } from "@/server/http";
import { getGameByCode, joinGame } from "@/server/participant.service";

export const POST = route<CodeParams>(async (req, ctx, db) => {
  limit(`join:${clientIp(req)}`, 20, 60_000);
  const game = await getGameByCode(db, await readCode(ctx));
  const body = await readJson<{ displayName?: unknown; token?: unknown }>(req);
  const { participant, token, reconnected } = await joinGame(db, game, body.displayName, body.token);
  return json(
    { participantId: participant.id, displayName: participant.displayName, token, reconnected },
    { status: reconnected ? 200 : 201 },
  );
});
