import {
  generateVerificationCode,
  generateSecureToken,
  hashCryptoToken,
} from "@/lib/auth/password";
import { VerificationRepository } from "@/server/repositories/verification.repository";
import { UserRepository } from "@/server/repositories/user.repository";
import { getEmailAdapter } from "@/server/adapters/email";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const CODE_EXPIRY_MINUTES = 15;
const MAX_CODE_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export interface VerifyCodeResult {
  success: boolean;
  message?: string;
  userId?: string;
}

export class VerificationService {
  /**
   * Generates and emails a 6-digit verification code and an optional magic-link.
   */
  static async sendVerificationEmail(userId: string, email: string, name: string): Promise<boolean> {
    const existingCode = await VerificationRepository.getLatestActiveCode(userId);
    if (existingCode) {
      const elapsedSeconds = (Date.now() - existingCode.createdAt.getTime()) / 1000;
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        logger.warn("Verification code resend cooldown active", { userId, elapsedSeconds });
        return false;
      }
    }

    const rawCode = generateVerificationCode();
    const codeHash = hashCryptoToken(rawCode);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await VerificationRepository.createVerificationCode(userId, codeHash, expiresAt);

    const emailAdapter = getEmailAdapter();
    const sent = await emailAdapter.sendVerificationCode(email, rawCode, name);

    // Also prepare magic-link URL
    const magicToken = generateSecureToken();
    const magicTokenHash = hashCryptoToken(magicToken);
    await VerificationRepository.createPasswordResetToken(
      userId,
      magicTokenHash,
      new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000),
    );
    const magicUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-token?token=${magicToken}&userId=${userId}`;
    await emailAdapter.sendMagicLink(email, magicUrl, name);

    return sent;
  }

  /**
   * Validates a 6-digit code submitted by the user.
   */
  static async verifyCode(userId: string, submittedCode: string): Promise<VerifyCodeResult> {
    const record = await VerificationRepository.getLatestActiveCode(userId);

    if (!record) {
      return {
        success: false,
        message: "No active verification code found. Please request a new one.",
      };
    }

    if (record.attempts >= MAX_CODE_ATTEMPTS) {
      await VerificationRepository.markCodeUsed(record.id);
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new code.",
      };
    }

    const hashedInput = hashCryptoToken(submittedCode.trim());

    if (hashedInput !== record.codeHash) {
      await VerificationRepository.incrementCodeAttempts(record.id);
      const remainingAttempts = MAX_CODE_ATTEMPTS - (record.attempts + 1);
      return {
        success: false,
        message: `Invalid code. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Success! Mark code used and activate user
    await VerificationRepository.markCodeUsed(record.id);
    await UserRepository.markEmailVerified(userId);

    return {
      success: true,
      userId,
    };
  }

  /**
   * Verifies magic-link token.
   */
  static async verifyMagicToken(token: string): Promise<VerifyCodeResult> {
    const tokenHash = hashCryptoToken(token);
    const record = await VerificationRepository.findActivePasswordResetToken(tokenHash);

    if (!record) {
      return {
        success: false,
        message: "This link is invalid or has expired.",
      };
    }

    await VerificationRepository.markPasswordResetTokenUsed(record.id);
    await UserRepository.markEmailVerified(record.userId);

    return {
      success: true,
      userId: record.userId,
    };
  }

  /**
   * Generates and sends a single-use expiring password reset token.
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);

    // SECURITY: Never reveal whether an email exists
    if (!user) {
      logger.info("Password reset requested for non-existent email (generic response sent)", {
        email,
      });
      return;
    }

    const token = generateSecureToken();
    const tokenHash = hashCryptoToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await VerificationRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    const emailAdapter = getEmailAdapter();
    await emailAdapter.sendPasswordReset(user.email, resetUrl, user.name);
  }

  /**
   * Validates a password reset token.
   */
  static async validateResetToken(token: string) {
    const tokenHash = hashCryptoToken(token);
    return VerificationRepository.findActivePasswordResetToken(tokenHash);
  }
}
