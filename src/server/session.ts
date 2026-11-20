import "server-only";
import { authEnabled, getAuth } from "@/lib/auth/server";
import { fail } from "./errors";

export type SessionUser = { id: string; email: string; name: string };

/** The signed-in Neon Auth user for this request, or null. Identity always comes from the session cookie. */
export async function currentUser(): Promise<SessionUser | null> {
  if (!authEnabled()) return null;
  const { data } = await getAuth().getSession();
  const u = data?.user;
  return u ? { id: u.id, email: u.email, name: u.name } : null;
}

export async function requireUser(): Promise<SessionUser> {
  if (!authEnabled()) fail("FORBIDDEN", "Accounts aren't set up on this server yet.");
  const u = await currentUser();
  if (!u) fail("UNAUTHORIZED", "Sign in to play solo.");
  return u!;
}
