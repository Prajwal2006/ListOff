import { MODERATOR_HEADER, json, limit, readCode, readJson, route, type CodeParams } from "@/server/http";
import { advanceGame, finishGame, nextRound, playAgain, revealNow, startGame } from "@/server/game.service";
import { assertModerator, getGameByCode } from "@/server/participant.service";
import { fail } from "@/server/errors";

const ACTIONS = ["start", "next", "reveal", "end", "play-again"] as const;
type Action = (typeof ACTIONS)[number];

export const POST = route<CodeParams>(async (req, ctx, db) => {
  let game = await getGameByCode(db, await readCode(ctx));
  assertModerator(game, req.headers.get(MODERATOR_HEADER));
  limit(`control:${game.id}`, 30, 10_000);
  const { action } = await readJson<{ action?: Action }>(req);
  if (!action || !ACTIONS.includes(action)) fail("BAD_REQUEST", "Unknown action.");
  game = await advanceGame(db, game);

  switch (action) {
    case "start":
      await startGame(db, game);
      break;
    case "next":
      await nextRound(db, game);
      break;
    case "reveal":
      await revealNow(db, game);
      break;
    case "end":
      await finishGame(db, game);
      break;
    case "play-again": {
      const next = await playAgain(db, game);
      return json({ ok: true, nextGameCode: next.gameCode });
    }
  }
  return json({ ok: true });
});
