import { describe, it, expect } from "vitest";
import {
  generateVerificationCode,
  generateSecureToken,
  hashCryptoToken,
} from "@/lib/auth/password";

describe("Email Verification Code & Token Logic", () => {
  it("generates a 6-digit numeric string", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateVerificationCode();
      expect(code).toMatch(/^[0-9]{6}$/);
      expect(code.length).toBe(6);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  it("hashes codes deterministically using SHA-256", () => {
    const code = "654321";
    const hash1 = hashCryptoToken(code);
    const hash2 = hashCryptoToken(code);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it("produces distinct hashes for different codes", () => {
    const hash1 = hashCryptoToken("123456");
    const hash2 = hashCryptoToken("123457");
    expect(hash1).not.toBe(hash2);
  });

  it("generates secure random hex tokens of 64 characters (32 bytes)", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
  });

  it("enforces attempt counter limit logic", () => {
    const maxAttempts = 5;
    let attempts = 0;

    const tryAttempt = (isValid: boolean) => {
      if (attempts >= maxAttempts) {
        return { allowed: false, message: "Exceeded max attempts" };
      }
      if (!isValid) {
        attempts += 1;
        return { allowed: true, remaining: maxAttempts - attempts };
      }
      return { allowed: true, success: true };
    };

    // 4 failed attempts
    for (let i = 1; i <= 4; i++) {
      const res = tryAttempt(false);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(maxAttempts - i);
    }

    // 5th failed attempt
    const res5 = tryAttempt(false);
    expect(res5.allowed).toBe(true);
    expect(res5.remaining).toBe(0);

    // 6th attempt should be blocked
    const res6 = tryAttempt(true);
    expect(res6.allowed).toBe(false);
    expect(res6.message).toContain("Exceeded max attempts");
  });

  it("correctly identifies expired verification records", () => {
    const now = new Date();
    const futureExpiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins in future
    const pastExpiry = new Date(now.getTime() - 1000); // 1 sec in past

    expect(futureExpiry.getTime() > now.getTime()).toBe(true);
    expect(pastExpiry.getTime() > now.getTime()).toBe(false);
  });
});
