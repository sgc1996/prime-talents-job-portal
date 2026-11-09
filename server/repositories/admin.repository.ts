import { prisma } from "@/lib/db/prisma";
import { UserRole, UserStatus, JobStatus, EmployerVerificationStatus, OrderStatus } from "@prisma/client";

export class AdminRepository {
  /**
   * Global KPI summary metrics for Admin Dashboard
   */
  static async getKPIs() {
    const [
      totalUsers,
      candidatesCount,
      employersCount,
      activeJobsCount,
      pendingJobsCount,
      pendingEmployersCount,
      pendingSlipsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      prisma.user.count({ where: { role: UserRole.EMPLOYER } }),
      prisma.job.count({ where: { status: JobStatus.APPROVED } }),
      prisma.job.count({ where: { status: JobStatus.PENDING_REVIEW } }),
      prisma.employerProfile.count({
        where: { verificationStatus: { in: [EmployerVerificationStatus.PENDING, EmployerVerificationStatus.UNVERIFIED] } },
      }),
      prisma.order.count({
        where: {
          status: OrderStatus.PENDING,
          slipFileId: { not: null },
        },
      }),
    ]);

    return {
      totalUsers,
      candidatesCount,
      employersCount,
      activeJobsCount,
      pendingJobsCount,
      pendingEmployersCount,
      pendingSlipsCount,
    };
  }

  /**
   * Pending Employer Profiles awaiting Admin verification
   */
  static async getPendingEmployers() {
    return prisma.employerProfile.findMany({
      where: {
        verificationStatus: {
          in: [EmployerVerificationStatus.PENDING, EmployerVerificationStatus.UNVERIFIED],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        sector: {
          select: { name: true },
        },
        district: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Pending Vacancies awaiting Moderator approval
   */
  static async getPendingJobs() {
    return prisma.job.findMany({
      where: {
        status: JobStatus.PENDING_REVIEW,
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            verificationStatus: true,
          },
        },
        sector: {
          select: { name: true },
        },
        district: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Pending Bank Deposit Slips for Job Promotions
   */
  static async getPendingSlips() {
    return prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        slipFileId: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            isFeatured: true,
            employer: {
              select: { companyName: true },
            },
          },
        },
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * User Governance List (Super Admin only)
   */
  static async getUsers(options?: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    limit?: number;
  }) {
    const where: any = {};

    if (options?.role) {
      where.role = options.role;
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: "insensitive" } },
        { name: { contains: options.search, mode: "insensitive" } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        employerProfile: {
          select: {
            companyName: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });
  }

  /**
   * Audit Logs (Super Admin only)
   */
  static async getAuditLogs(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
