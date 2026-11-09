import { prisma } from "@/lib/db/prisma";

export class VerificationRepository {
  // ==========================================
  // EMAIL VERIFICATION CODES (6-digit)
  // ==========================================

  static async createVerificationCode(userId: string, codeHash: string, expiresAt: Date) {
    // Invalidate existing unused codes for this user
    await prisma.emailVerificationCode.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return prisma.emailVerificationCode.create({
      data: {
        userId,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });
  }

  static async getLatestActiveCode(userId: string) {
    return prisma.emailVerificationCode.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async incrementCodeAttempts(id: string) {
    return prisma.emailVerificationCode.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  static async markCodeUsed(id: string) {
    return prisma.emailVerificationCode.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  // ==========================================
  // PASSWORD RESET TOKENS
  // ==========================================

  static async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    // Invalidate existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  static async findActivePasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  static async markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
