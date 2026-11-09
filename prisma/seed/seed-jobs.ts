import { PrismaClient, JobStatus, JobType, ExperienceLevel, EducationLevel } from "@prisma/client";

export async function seedJobsAndApplications(prisma: PrismaClient) {
  console.log("Seeding 20 jobs with mixed statuses...");

  const employers = await prisma.employerProfile.findMany();
  if (employers.length === 0) return;

  const colombo = await prisma.district.findUnique({ where: { code: "COL" } });
  const kandy = await prisma.district.findUnique({ where: { code: "KAN" } });
  const galle = await prisma.district.findUnique({ where: { code: "GAL" } });

  const itSector = await prisma.sector.findUnique({ where: { slug: "it-software" } });
  const bankingSector = await prisma.sector.findUnique({ where: { slug: "banking-finance" } });
  const apparelSector = await prisma.sector.findUnique({ where: { slug: "apparel-garments" } });
  const logisticsSector = await prisma.sector.findUnique({ where: { slug: "logistics-supply-chain" } });

  const candidateUsers = await prisma.candidateProfile.findMany({
    include: { user: true },
  });

  const emp1 = employers[0]!;
  const emp2 = employers[1] || employers[0]!;
  const emp3 = employers[2] || employers[0]!;

  const jobsData = [
    // 1-5: IT Jobs
    {
      title: "Senior Full Stack Engineer (Next.js & Node.js)",
      slug: "senior-full-stack-engineer-nextjs-nodejs",
      employerId: emp1.id,
      sectorId: itSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 400000,
      salaryMax: 600000,
      status: JobStatus.APPROVED,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Associate DevOps Engineer",
      slug: "associate-devops-engineer",
      employerId: emp1.id,
      sectorId: itSector!.id,
      districtId: colombo?.id,
      jobType: JobType.HYBRID,
      experienceLevel: ExperienceLevel.ENTRY_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 150000,
      salaryMax: 200000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "QA Automation Lead",
      slug: "qa-automation-lead",
      employerId: emp1.id,
      sectorId: itSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.LEAD,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 450000,
      salaryMax: 650000,
      status: JobStatus.PENDING_REVIEW,
    },
    {
      title: "Junior React Native Developer",
      slug: "junior-react-native-developer",
      employerId: emp1.id,
      sectorId: itSector!.id,
      districtId: kandy?.id,
      jobType: JobType.REMOTE,
      experienceLevel: ExperienceLevel.JUNIOR,
      educationLevel: EducationLevel.DIPLOMA,
      salaryMin: 100000,
      salaryMax: 150000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Unverified Tech Lead Post",
      slug: "unverified-tech-lead-post",
      employerId: emp1.id,
      sectorId: itSector!.id,
      districtId: colombo?.id,
      jobType: JobType.CONTRACT,
      experienceLevel: ExperienceLevel.LEAD,
      educationLevel: EducationLevel.BACHELORS,
      status: JobStatus.REJECTED,
      moderationNote: "Job description does not meet platform quality guidelines.",
    },

    // 6-10: Banking Jobs
    {
      title: "Assistant Manager - Credit Risk",
      slug: "assistant-manager-credit-risk",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 220000,
      salaryMax: 320000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Banking Trainee (Island-wide)",
      slug: "banking-trainee-island-wide",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: kandy?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.ENTRY_LEVEL,
      educationLevel: EducationLevel.ADVANCED_LEVEL,
      salaryMin: 65000,
      salaryMax: 85000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Senior Treasury Dealer",
      slug: "senior-treasury-dealer",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 350000,
      salaryMax: 500000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Expired Legal Compliance Officer",
      slug: "expired-legal-compliance-officer",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      status: JobStatus.EXPIRED,
      deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Pending Internal Auditor",
      slug: "pending-internal-auditor",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      status: JobStatus.PENDING_REVIEW,
    },

    // 11-15: Apparel Jobs
    {
      title: "Senior Apparel Merchandiser",
      slug: "senior-apparel-merchandiser",
      employerId: emp3.id,
      sectorId: apparelSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      educationLevel: EducationLevel.DIPLOMA,
      salaryMin: 220000,
      salaryMax: 300000,
      status: JobStatus.APPROVED,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Fabric Technologist",
      slug: "fabric-technologist",
      employerId: emp3.id,
      sectorId: apparelSector!.id,
      districtId: galle?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 180000,
      salaryMax: 240000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Pattern Maker (Cad Gerber)",
      slug: "pattern-maker-cad-gerber",
      employerId: emp3.id,
      sectorId: apparelSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.DIPLOMA,
      salaryMin: 130000,
      salaryMax: 170000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Production Supervisor - Kandy Plant",
      slug: "production-supervisor-kandy-plant",
      employerId: emp3.id,
      sectorId: apparelSector!.id,
      districtId: kandy?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.JUNIOR,
      educationLevel: EducationLevel.ADVANCED_LEVEL,
      status: JobStatus.PENDING_REVIEW,
    },
    {
      title: "Apparel Cutting Master (Archived)",
      slug: "apparel-cutting-master-archived",
      employerId: emp3.id,
      sectorId: apparelSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      educationLevel: EducationLevel.ORDINARY_LEVEL,
      status: JobStatus.ARCHIVED,
    },

    // 16-20: Logistics & Others
    {
      title: "Supply Chain & Procurement Executive",
      slug: "supply-chain-procurement-executive",
      employerId: emp1.id,
      sectorId: logisticsSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.BACHELORS,
      salaryMin: 140000,
      salaryMax: 190000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Warehouse In-Charge (Biyagama)",
      slug: "warehouse-in-charge-biyagama",
      employerId: emp3.id,
      sectorId: logisticsSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.ADVANCED_LEVEL,
      salaryMin: 110000,
      salaryMax: 140000,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Customs Clearance Executive (ASYCUDA)",
      slug: "customs-clearance-executive-asycuda",
      employerId: emp1.id,
      sectorId: logisticsSector!.id,
      districtId: colombo?.id,
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      educationLevel: EducationLevel.DIPLOMA,
      status: JobStatus.PENDING_REVIEW,
    },
    {
      title: "Fleet Operations Coordinator",
      slug: "fleet-operations-coordinator",
      employerId: emp3.id,
      sectorId: logisticsSector!.id,
      districtId: galle?.id,
      jobType: JobType.CONTRACT,
      experienceLevel: ExperienceLevel.JUNIOR,
      educationLevel: EducationLevel.ADVANCED_LEVEL,
      status: JobStatus.APPROVED,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Rejected Duplicate Job Posting",
      slug: "rejected-duplicate-job-posting",
      employerId: emp2.id,
      sectorId: bankingSector!.id,
      districtId: colombo?.id,
      jobType: JobType.PART_TIME,
      experienceLevel: ExperienceLevel.ENTRY_LEVEL,
      educationLevel: EducationLevel.ADVANCED_LEVEL,
      status: JobStatus.REJECTED,
      moderationNote: "Duplicate posting detected by moderation filter.",
    },
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const job = await prisma.job.upsert({
      where: { slug: j.slug },
      update: {
        status: j.status,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
      },
      create: {
        title: j.title,
        slug: j.slug,
        descriptionHtml: `<p>We are seeking a talented <strong>${j.title}</strong> to join our growing team in Sri Lanka. This position offers attractive compensation and career advancement opportunities.</p>`,
        requirementsHtml: "<ul><li>Relevant academic or professional qualifications</li><li>Strong communication and problem solving skills</li><li>Proven track record of reliability</li></ul>",
        benefitsHtml: "<ul><li>Competitive industry salary</li><li>OPD / Hospitalization medical cover</li><li>Professional development allowance</li></ul>",
        employerId: j.employerId,
        sectorId: j.sectorId,
        districtId: j.districtId,
        jobType: j.jobType,
        experienceLevel: j.experienceLevel,
        educationLevel: j.educationLevel,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: "LKR",
        salaryVisible: true,
        vacancies: 1,
        status: j.status,
        moderationNote: j.moderationNote,
        isFeatured: j.isFeatured || false,
        publishedAt: j.publishedAt,
        deadline: j.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    createdJobs.push(job);
  }

  // Seed sample applications and reviews
  if (candidateUsers.length >= 2 && createdJobs.length >= 2) {
    const cand1 = candidateUsers[0]!;
    const cand2 = candidateUsers[1]!;
    const approvedJob1 = createdJobs[0]!;
    const approvedJob2 = createdJobs[1]!;

    console.log("Seeding sample job applications...");
    await prisma.application.upsert({
      where: {
        jobId_candidateId: {
          jobId: approvedJob1.id,
          candidateId: cand1.id,
        },
      },
      update: {},
      create: {
        jobId: approvedJob1.id,
        candidateId: cand1.id,
        status: "SHORTLISTED",
        employerNote: "Strong React & TypeScript experience demonstrated in profile.",
      },
    });

    await prisma.application.upsert({
      where: {
        jobId_candidateId: {
          jobId: approvedJob2.id,
          candidateId: cand2.id,
        },
      },
      update: {},
      create: {
        jobId: approvedJob2.id,
        candidateId: cand2.id,
        status: "NEW",
      },
    });

    console.log("Seeding sample employer reviews...");
    const empReview = await prisma.review.findFirst({
      where: {
        candidateId: cand1.id,
        employerId: emp1.id,
      },
    });

    if (!empReview) {
      await prisma.review.create({
        data: {
          candidateId: cand1.id,
          employerId: emp1.id,
          rating: 5,
          comment: "Excellent company culture, transparent hiring process, and great work-life balance.",
          status: "APPROVED",
        },
      });
    }
  }
}
