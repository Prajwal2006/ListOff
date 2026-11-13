import { eq, sql } from "drizzle-orm";
import { participants } from "@/lib/db/schema";
import { clientIp, json, limit, readCode, route, type CodeParams } from "@/server/http";
import { getGameByCode } from "@/server/participant.service";

/** Public lobby info for the join screen. Never includes tokens, topics, or answers. */
export const GET = route<CodeParams>(async (req, ctx, db) => {
  limit(`preview:${clientIp(req)}`, 60, 60_000);
  const game = await getGameByCode(db, await readCode(ctx));
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(participants)
    .where(eq(participants.gameId, game.id));
  return json({
    code: game.gameCode,
    name: game.name,
    hostName: game.hostName,
    state: game.currentState,
    totalRounds: game.totalRounds,
    roundDuration: game.roundDuration,
    playerCount: Number(n),
    joinable: game.currentState === "LOBBY",
  });
});
