import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Generates a 6-digit numeric verification code (100000 - 999999).
 */
export function generateVerificationCode(): string {
  const codeNum = crypto.randomInt(100000, 1000000);
  return codeNum.toString();
}

/**
 * Creates a deterministic SHA-256 hash of a verification code or token.
 */
export function hashCryptoToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a cryptographically strong random token for magic links or password resets.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
