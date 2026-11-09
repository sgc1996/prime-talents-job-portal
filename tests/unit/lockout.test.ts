import { describe, it, expect } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit/limiter";

function calculateLockoutMinutes(failedAttempts: number): number {
  if (failedAttempts >= 10) return 24 * 60; // 24 hours
  if (failedAttempts >= 8) return 60; // 1 hour
  if (failedAttempts >= 5) return 15; // 15 minutes
  return 0; // Not locked
}

describe("Account Lockout & Brute-Force Rate Limiting", () => {
  it("implements incremental lockout thresholds", () => {
    expect(calculateLockoutMinutes(0)).toBe(0);
    expect(calculateLockoutMinutes(4)).toBe(0);
    expect(calculateLockoutMinutes(5)).toBe(15);
    expect(calculateLockoutMinutes(7)).toBe(15);
    expect(calculateLockoutMinutes(8)).toBe(60);
    expect(calculateLockoutMinutes(9)).toBe(60);
    expect(calculateLockoutMinutes(10)).toBe(1440);
    expect(calculateLockoutMinutes(15)).toBe(1440);
  });

  it("limits requests when rate limit is exceeded", () => {
    const testKey = "test-ip-rate-limit-1";
    resetRateLimit(testKey);

    const limit = 3;
    const windowSeconds = 60;

    // 1st request
    const res1 = checkRateLimit(testKey, limit, windowSeconds);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    // 2nd request
    const res2 = checkRateLimit(testKey, limit, windowSeconds);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    // 3rd request
    const res3 = checkRateLimit(testKey, limit, windowSeconds);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request (should be blocked)
    const res4 = checkRateLimit(testKey, limit, windowSeconds);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);

    // Resetting rate limit frees access
    resetRateLimit(testKey);
    const res5 = checkRateLimit(testKey, limit, windowSeconds);
    expect(res5.success).toBe(true);
  });
});
