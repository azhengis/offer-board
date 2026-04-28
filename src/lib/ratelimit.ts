const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX = 3;

interface RateRecord {
  count: number;
  resetAt: number;
}

// Module-level map — persists across requests within a single process.
// Swap this store out for a Redis client when moving to distributed infra.
const store = new Map<string, RateRecord>();

function prune(now: number) {
  for (const [key, rec] of Array.from(store)) {
    if (rec.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  prune(now);

  const rec = store.get(ip);

  if (!rec || rec.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX - 1, resetAt: now + WINDOW_MS };
  }

  if (rec.count >= MAX) {
    return { allowed: false, remaining: 0, resetAt: rec.resetAt };
  }

  rec.count += 1;
  return { allowed: true, remaining: MAX - rec.count, resetAt: rec.resetAt };
}
