import { SESSION_HEADER, json, limit, readCode, readJson, route, type CodeParams } from "@/server/http";
import { advanceGame } from "@/server/game.service";
import { authenticateParticipant, getGameByCode } from "@/server/participant.service";
import { submitPrediction } from "@/server/round.service";

export const POST = route<CodeParams>(async (req, ctx, db) => {
  let game = await getGameByCode(db, await readCode(ctx));
  const participant = await authenticateParticipant(db, game, req.headers.get(SESSION_HEADER));
  limit(`predict:${participant.id}`, 10, 10_000);
  const body = await readJson<{ count?: unknown }>(req);
  game = await advanceGame(db, game);
  const result = await submitPrediction(db, game, participant, body.count);
  // If that was the last prediction, reveal now rather than on the next poll.
  await advanceGame(db, game);
  return json(result, { status: 201 });
});
