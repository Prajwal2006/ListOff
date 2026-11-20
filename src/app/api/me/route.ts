import { authEnabled } from "@/lib/auth/server";
import { json, route } from "@/server/http";
import { currentUser } from "@/server/session";
import { getProfile } from "@/server/solo.service";
import type { MeResponse } from "@/types/solo";

export const GET = route(async (_req, _ctx, db) => {
  const user = await currentUser();
  const profile = user ? await getProfile(db, user.id) : null;
  return json<MeResponse>({ user, profile, authEnabled: authEnabled() });
});
