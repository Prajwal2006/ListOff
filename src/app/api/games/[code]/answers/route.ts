import { SESSION_HEADER, json, limit, readCode, readJson, route, type CodeParams } from "@/server/http";
import { advanceGame } from "@/server/game.service";
import { authenticateParticipant, getGameByCode } from "@/server/participant.service";
import { submitAnswer } from "@/server/round.service";

export const POST = route<CodeParams>(async (req, ctx, db) => {
  let game = await getGameByCode(db, await readCode(ctx));
  const participant = await authenticateParticipant(db, game, req.headers.get(SESSION_HEADER));
  limit(`answer:${participant.id}`, 40, 10_000);
  const body = await readJson<{ text?: unknown }>(req);
  game = await advanceGame(db, game);
  const result = await submitAnswer(db, game, participant, body.text);
  return json(result, { status: 201 });
});
