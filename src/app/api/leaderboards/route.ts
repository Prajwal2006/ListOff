import { clientIp, json, limit, route } from "@/server/http";
import { currentUser } from "@/server/session";
import { getLeaderboard } from "@/server/solo.service";

export const GET = route(async (req, _ctx, db) => {
  limit(`lb:${clientIp(req)}`, 120, 60_000);
  const p = new URL(req.url).searchParams;
  const user = await currentUser();
  return json(
    await getLeaderboard(
      db,
      { scope: p.get("scope"), country: p.get("country"), state: p.get("state"), university: p.get("university") },
      user?.id ?? null,
    ),
  );
});
