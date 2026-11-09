import { UserRepository } from "@/server/repositories/user.repository";
import { VerificationRepository } from "@/server/repositories/verification.repository";
import { AuditLogRepository } from "@/server/repositories/audit-log.repository";
import { VerificationService } from "./verification.service";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getEmailAdapter } from "@/server/adapters/email";

export interface RegisterCandidateDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
}

export interface RegisterEmployerDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  companyName: string;
  companySlug: string;
  ip?: string;
  userAgent?: string;
}

export interface AuthenticateCredentialsDto {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export class AuthService {
  /**
   * Registers a new candidate.
   */
  static async registerCandidate(data: RegisterCandidateDto) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserRepository.createCandidate({
      email: data.email,
      name: data.name,
      passwordHash,
      phone: data.phone,
    });

    // Send verification code & magic link
    await VerificationService.sendVerificationEmail(user.id, user.email, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  /**
   * Registers a new employer.
   */
  static async registerEmployer(data: RegisterEmployerDto) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserRepository.createEmployer({
      email: data.email,
      name: data.name,
      passwordHash,
      phone: data.phone,
      companyName: data.companyName,
      companySlug: data.companySlug,
    });

    // Send verification code & magic link
    await VerificationService.sendVerificationEmail(user.id, user.email, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  /**
   * Authenticates credentials with lockout defense and unverified email enforcement.
   */
  static async authenticateCredentials(data: AuthenticateCredentialsDto) {
    const user = await UserRepository.findByEmail(data.email);

    // SECURITY: Use generic message for non-existent users
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Check account status
    if (user.status === "SUSPENDED") {
      throw new Error("Your account has been suspended. Please contact support.");
    }

    // Check brute-force lockout
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new Error(
        `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`,
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      const updatedUser = await UserRepository.recordFailedLogin(user.id, user.failedLoginCount);

      // If newly locked, send lockout alert email
      if (updatedUser.lockedUntil && !user.lockedUntil) {
        const lockoutMinutes = Math.ceil(
          (updatedUser.lockedUntil.getTime() - Date.now()) / (60 * 1000),
        );
        const emailAdapter = getEmailAdapter();
        await emailAdapter.sendLockoutAlert(user.email, lockoutMinutes, user.name);
      }

      throw new Error("Invalid email or password");
    }

    // Check verification status
    if (user.status === "PENDING_VERIFICATION" || !user.emailVerifiedAt) {
      throw new Error(
        `EMAIL_NOT_VERIFIED:${user.id}:${encodeURIComponent(user.email)}`,
      );
    }

    // Reset failed login counter and update lastLoginAt
    await UserRepository.resetFailedLogins(user.id);

    // Audit log if admin or moderator logs in
    if (user.role === "SUPER_ADMIN" || user.role === "MODERATOR") {
      await AuditLogRepository.create({
        actorId: user.id,
        action: "ADMIN_LOGIN",
        entityType: "User",
        entityId: user.id,
        ip: data.ip,
        userAgent: data.userAgent,
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  /**
   * Resets password using single-use expiring token.
   */
  static async resetPassword(token: string, newPasswordPlain: string, ip?: string) {
    const tokenRecord = await VerificationService.validateResetToken(token);
    if (!tokenRecord) {
      throw new Error("This password reset link is invalid or has expired.");
    }

    const newHash = await hashPassword(newPasswordPlain);
    await UserRepository.updatePassword(tokenRecord.userId, newHash);
    await VerificationRepository.markPasswordResetTokenUsed(tokenRecord.id);

    // Audit log
    await AuditLogRepository.create({
      actorId: tokenRecord.userId,
      action: "PASSWORD_RESET",
      entityType: "User",
      entityId: tokenRecord.userId,
      ip,
    });

    return true;
  }

  /**
   * Changes password for an authenticated user.
   */
  static async changePassword(
    userId: string,
    currentPasswordPlain: string,
    newPasswordPlain: string,
    ip?: string,
  ) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new Error("User not found");
    }

    const isValid = await verifyPassword(currentPasswordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    const newHash = await hashPassword(newPasswordPlain);
    await UserRepository.updatePassword(userId, newHash);

    await AuditLogRepository.create({
      actorId: userId,
      action: "PASSWORD_CHANGE",
      entityType: "User",
      entityId: userId,
      ip,
    });

    return true;
  }

  /**
   * Changes email address and sets user to PENDING_VERIFICATION.
   */
  static async changeEmail(userId: string, newEmail: string) {
    const existing = await UserRepository.findByEmail(newEmail);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const updated = await UserRepository.updateEmail(userId, newEmail);
    await VerificationService.sendVerificationEmail(updated.id, updated.email, updated.name);

    return true;
  }
}
