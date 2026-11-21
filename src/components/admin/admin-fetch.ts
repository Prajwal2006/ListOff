export async function adminFetch<T>(secret: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error?.message ?? "Request failed");
  return body as T;
}
