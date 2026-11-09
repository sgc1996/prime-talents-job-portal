import { prisma } from "@/lib/db/prisma";
import { Prisma, JobStatus, JobType, ExperienceLevel } from "@prisma/client";

export interface JobFilterParams {
  keyword?: string;
  sectorSlug?: string;
  districtCode?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "salary_desc";
}

export class JobRepository {
  static async searchJobs(params: JobFilterParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      status: JobStatus.APPROVED,
    };

    if (params.keyword?.trim()) {
      const q = params.keyword.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { descriptionHtml: { contains: q, mode: "insensitive" } },
        { employer: { companyName: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (params.sectorSlug) {
      where.sector = { slug: params.sectorSlug };
    }

    if (params.districtCode) {
      where.district = { code: params.districtCode };
    }

    if (params.jobType) {
      where.jobType = params.jobType;
    }

    if (params.experienceLevel) {
      where.experienceLevel = params.experienceLevel;
    }

    if (params.salaryMin) {
      where.salaryMax = { gte: params.salaryMin };
    }

    if (params.salaryMax) {
      where.salaryMin = { lte: params.salaryMax };
    }

    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }

    const orderBy: Prisma.JobOrderByWithRelationInput[] = [];
    if (params.sortBy === "salary_desc") {
      orderBy.push({ salaryMax: "desc" });
    }
    orderBy.push({ publishedAt: "desc" });

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
          sector: { select: { id: true, name: true, slug: true } },
          district: { select: { id: true, name: true, code: true } },
          skills: {
            include: {
              skill: true,
            },
            take: 4,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getFeaturedJobs(limit = 6) {
    return prisma.job.findMany({
      where: {
        status: JobStatus.APPROVED,
        isFeatured: true,
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            verificationStatus: true,
          },
        },
        sector: { select: { id: true, name: true, slug: true } },
        district: { select: { id: true, name: true, code: true } },
        skills: {
          include: { skill: true },
          take: 3,
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  static async getJobBySlug(slug: string) {
    return prisma.job.findUnique({
      where: { slug },
      include: {
        employer: {
          include: {
            sector: true,
            district: true,
          },
        },
        sector: true,
        category: true,
        district: {
          include: {
            province: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        screeningQuestions: true,
      },
    });
  }

  static async getSectorsWithCounts() {
    const sectors = await prisma.sector.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            jobs: {
              where: { status: JobStatus.APPROVED },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return sectors.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      jobCount: s._count.jobs,
    }));
  }

  static async getDistricts() {
    return prisma.district.findMany({
      include: {
        province: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async getCompanyBySlug(slug: string) {
    return prisma.employerProfile.findUnique({
      where: { slug },
      include: {
        sector: true,
        district: {
          include: { province: true },
        },
        jobs: {
          where: { status: JobStatus.APPROVED },
          include: {
            sector: true,
            district: true,
          },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
  }

  static async isJobSaved(candidateId: string, jobId: string) {
    const record = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });
    return Boolean(record);
  }
}

