interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to avoid memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of Array.from(memoryStore.entries())) {
      if (record.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Checks and increments rate limit for a given identifier key (e.g., ip or email).
 *
 * @param key Unique key to rate limit
 * @param limit Maximum allowed requests
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowSeconds = 900,
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      resetAt: new Date(resetAt),
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt),
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: new Date(existing.resetAt),
  };
}

export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
}
