/**
 * Best-effort sliding-window limiter, per server instance. It blunts bursts and scripted spam;
 * hard integrity limits (one prediction, answer caps, deadlines) are enforced in the database.
 */
type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (!b.hits.length || now - b.hits[b.hits.length - 1] > 120_000) buckets.delete(k);
    lastSweep = now;
  }
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return true;
}
