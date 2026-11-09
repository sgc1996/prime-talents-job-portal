import { prisma } from "@/lib/db/prisma";
import { UserRole, UserStatus } from "@prisma/client";

export interface CreateCandidateUserInput {
  email: string;
  name: string;
  passwordHash?: string;
  phone?: string;
}

export interface CreateEmployerUserInput {
  email: string;
  name: string;
  passwordHash?: string;
  phone?: string;
  companyName: string;
  companySlug: string;
}

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
      include: {
        candidateProfile: true,
        employerProfile: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        candidateProfile: true,
        employerProfile: true,
      },
    });
  }

  static async createCandidate(input: CreateCandidateUserInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          name: input.name.trim(),
          passwordHash: input.passwordHash,
          phone: input.phone?.trim() || null,
          role: UserRole.CANDIDATE,
          status: UserStatus.PENDING_VERIFICATION,
        },
      });

      const profile = await tx.candidateProfile.create({
        data: {
          userId: user.id,
          phone: input.phone?.trim() || null,
          profileCompleteness: 15,
        },
      });

      return { ...user, candidateProfile: profile };
    });
  }

  static async createEmployer(input: CreateEmployerUserInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          name: input.name.trim(),
          passwordHash: input.passwordHash,
          phone: input.phone?.trim() || null,
          role: UserRole.EMPLOYER,
          status: UserStatus.PENDING_VERIFICATION,
        },
      });

      const employerProfile = await tx.employerProfile.create({
        data: {
          userId: user.id,
          companyName: input.companyName.trim(),
          slug: input.companySlug.toLowerCase().trim(),
        },
      });

      // Also create owner membership record
      await tx.employerMember.create({
        data: {
          employerId: employerProfile.id,
          userId: user.id,
          memberRole: "OWNER",
        },
      });

      return { ...user, employerProfile };
    });
  }

  static async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      },
    });
  }

  static async recordFailedLogin(userId: string, currentFailedCount: number) {
    const nextCount = currentFailedCount + 1;
    let lockedUntil: Date | null = null;

    // Incremental lockout policy:
    // 5 attempts = 15 mins
    // 8 attempts = 1 hour
    // 10+ attempts = 24 hours
    if (nextCount >= 10) {
      lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (nextCount >= 8) {
      lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    } else if (nextCount >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: nextCount,
        lockedUntil,
      },
    });
  }

  static async resetFailedLogins(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  static async updatePassword(userId: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }

  static async updateEmail(userId: string, newEmail: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase().trim(),
        emailVerifiedAt: null,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });
  }

  static async updateStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  static async updateRole(userId: string, role: UserRole) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}

