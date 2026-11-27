import { prisma } from "@/lib/db/prisma";
import { UserRole, UserStatus, JobStatus, EmployerVerificationStatus, OrderStatus, FileKind } from "@prisma/client";

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
      totalApplicationsCount,
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
      prisma.application.count(),
    ]);

    return {
      totalUsers,
      candidatesCount,
      employersCount,
      activeJobsCount,
      pendingJobsCount,
      pendingEmployersCount,
      pendingSlipsCount,
      totalApplicationsCount,
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

  /**
   * Candidate Talent Pool & CVs for Admin
   */
  static async getCandidates(options?: {
    search?: string;
    districtId?: string;
    limit?: number;
  }) {
    const where: any = {
      role: UserRole.CANDIDATE,
    };

    if (options?.search) {
      const search = options.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        {
          candidateProfile: {
            OR: [
              { headline: { contains: search, mode: "insensitive" } },
              { summary: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (options?.districtId && options.districtId !== "ALL") {
      where.candidateProfile = {
        ...where.candidateProfile,
        districtId: options.districtId,
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        candidateProfile: {
          include: {
            district: {
              include: {
                province: true,
              },
            },
            applications: {
              include: {
                job: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    jobType: true,
                    city: true,
                    employer: {
                      select: {
                        companyName: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        storedFiles: {
          where: { kind: FileKind.CV },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
    });

    return users.map((u) => {
      const latestCv = u.storedFiles[0] || null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || u.candidateProfile?.phone || null,
        status: u.status,
        createdAt: u.createdAt,
        candidateProfile: u.candidateProfile,
        latestCv: latestCv
          ? {
              id: latestCv.id,
              url: latestCv.url,
              mimeType: latestCv.mimeType,
              sizeBytes: latestCv.sizeBytes,
              createdAt: latestCv.createdAt,
            }
          : null,
      };
    });
  }

  /**
   * Summary metrics specifically for Candidates & CVs
   */
  static async getCandidateStats() {
    const [totalCandidates, totalApplications, openToWorkCount, cvOwners] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      prisma.application.count(),
      prisma.candidateProfile.count({ where: { openToWork: true } }),
      prisma.storedFile.findMany({
        where: { kind: FileKind.CV },
        select: { ownerId: true },
        distinct: ["ownerId"],
      }),
    ]);

    return {
      totalCandidates,
      totalApplications,
      openToWorkCount,
      candidatesWithCvCount: cvOwners.length,
    };
  }
}

