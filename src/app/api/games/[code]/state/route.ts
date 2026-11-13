import { advanceGame } from "@/server/game.service";
import { MODERATOR_HEADER, SESSION_HEADER, json, limit, readCode, route, type CodeParams } from "@/server/http";
import { authenticateParticipant, getGameByCode, heartbeat, isModerator } from "@/server/participant.service";
import { buildSnapshot, type Viewer } from "@/server/snapshot.service";
import { clock } from "@/lib/utils/clock";
import { fail } from "@/server/errors";

/**
 * The sync endpoint every client polls. It (1) authenticates the caller, (2) records a heartbeat,
 * (3) applies any due timed transitions, and (4) returns either a full snapshot or, when the caller
 * already holds the current version, a tiny "unchanged" reply.
 */
export const GET = route<CodeParams>(async (req, ctx, db) => {
  const code = await readCode(ctx);
  let game = await getGameByCode(db, code);
  const modToken = req.headers.get(MODERATOR_HEADER);
  const sessionToken = req.headers.get(SESSION_HEADER);

  let viewer: Viewer;
  if (modToken && isModerator(game, modToken)) {
    viewer = { role: "moderator" };
    limit(`state:mod:${game.id}`, 600, 60_000);
  } else if (sessionToken) {
    const participant = await authenticateParticipant(db, game, sessionToken);
    limit(`state:${participant.id}`, 300, 60_000);
    await heartbeat(db, participant);
    viewer = { role: "participant", participant };
  } else {
    return fail("UNAUTHORIZED", "Join the game to continue.");
  }

  game = await advanceGame(db, game);

  const known = Number(new URL(req.url).searchParams.get("v") ?? NaN);
  if (viewer.role === "participant" && known === game.stateVersion) {
    return json({ unchanged: true, serverNow: clock.now(), version: game.stateVersion });
  }
  if (viewer.role === "participant") {
    // Re-read so the snapshot reflects score updates applied during advanceGame.
    viewer = { role: "participant", participant: await authenticateParticipant(db, game, sessionToken) };
  }
  return json(await buildSnapshot(db, game, viewer));
});
