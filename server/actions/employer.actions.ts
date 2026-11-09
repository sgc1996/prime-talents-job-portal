"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import {
  CompanySize,
  JobType,
  ExperienceLevel,
  EducationLevel,
  ApplyMethod,
  JobStatus,
  ApplicationStatus,
} from "@prisma/client";

// ==========================================
// 1. UPDATE EMPLOYER PROFILE
// ==========================================

interface UpdateEmployerProfileInput {
  companyName: string;
  about?: string;
  mission?: string;
  vision?: string;
  values?: string;
  sectorId?: string;
  companySize?: CompanySize;
  foundedYear?: number;
  website?: string;
  address?: string;
  districtId?: string;
}

export async function updateEmployerProfileAction(data: UpdateEmployerProfileInput) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) {
    throw new Error("Employer profile not found");
  }

  await prisma.employerProfile.update({
    where: { id: employer.id },
    data: {
      companyName: data.companyName.trim(),
      about: data.about?.trim() || null,
      mission: data.mission?.trim() || null,
      vision: data.vision?.trim() || null,
      values: data.values?.trim() || null,
      sectorId: data.sectorId || null,
      companySize: data.companySize,
      foundedYear: data.foundedYear,
      website: data.website?.trim() || null,
      address: data.address?.trim() || null,
      districtId: data.districtId || null,
    },
  });

  revalidatePath(`/employer`);
  revalidatePath(`/employer/profile`);
  revalidatePath(`/companies/${employer.slug}`);

  return { success: true };
}

// ==========================================
// 2. CREATE JOB VACANCY
// ==========================================

interface CreateJobInput {
  title: string;
  sectorId: string;
  categoryId?: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryVisible?: boolean;
  districtId?: string;
  city?: string;
  vacancies?: number;
  descriptionHtml: string;
  requirementsHtml?: string;
  benefitsHtml?: string;
  applyMethod: ApplyMethod;
  applyUrl?: string;
  applyEmail?: string;
  screeningQuestions?: {
    question: string;
    type: "TEXT" | "YES_NO";
    required: boolean;
  }[];
  saveAsDraft?: boolean;
}

export async function createJobAction(data: CreateJobInput) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) {
    throw new Error("Employer profile not found");
  }

  // Generate unique slug
  const baseSlug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const slug = `${baseSlug}-${randomSuffix}`;

  // If verified employer, automatically approve; otherwise pending review
  const status = data.saveAsDraft
    ? JobStatus.DRAFT
    : employer.verificationStatus === "VERIFIED"
      ? JobStatus.APPROVED
      : JobStatus.PENDING_REVIEW;

  const job = await prisma.job.create({
    data: {
      employerId: employer.id,
      title: data.title.trim(),
      slug,
      sectorId: data.sectorId,
      categoryId: data.categoryId || null,
      jobType: data.jobType,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryCurrency: "LKR",
      salaryVisible: data.salaryVisible ?? true,
      districtId: data.districtId || null,
      city: data.city?.trim() || null,
      vacancies: data.vacancies || 1,
      descriptionHtml: data.descriptionHtml,
      requirementsHtml: data.requirementsHtml || null,
      benefitsHtml: data.benefitsHtml || null,
      applyMethod: data.applyMethod,
      applyUrl: data.applyUrl?.trim() || null,
      applyEmail: data.applyEmail?.trim() || null,
      status,
      publishedAt: status === "APPROVED" ? new Date() : null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      screeningQuestions: {
        create: data.screeningQuestions?.map((q) => ({
          question: q.question.trim(),
          type: q.type,
          required: q.required,
        })) || [],
      },
    },
  });

  revalidatePath(`/employer`);
  revalidatePath(`/employer/jobs`);
  revalidatePath(`/jobs`);

  return { success: true, slug: job.slug, jobId: job.id };
}

// ==========================================
// 3. UPDATE JOB STATUS (Archive, Mark as Filled)
// ==========================================

export async function updateJobStatusAction(jobId: string, status: JobStatus) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer && user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job || (job.employerId !== employer?.id && user.role !== "SUPER_ADMIN")) {
    throw new Error("Job not found or access denied");
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status },
  });

  revalidatePath(`/employer/jobs`);
  revalidatePath(`/jobs`);
  return { success: true };
}

// ==========================================
// 4. UPDATE APPLICATION STATUS IN ATS
// ==========================================

export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus,
  note?: string,
) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      candidate: {
        include: { user: true },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (application.job.employerId !== employer?.id && user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized to manage applications for this vacancy");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      employerNote: note?.trim() || application.employerNote,
    },
  });

  // Notify candidate of status update
  await prisma.notification.create({
    data: {
      userId: application.candidate.userId,
      title: `Application Status Updated: ${newStatus}`,
      message: `Your application status for "${application.job.title}" has been updated to ${newStatus}.`,
      link: `/candidate/applications`,
    },
  });

  revalidatePath(`/employer/jobs/${application.jobId}/applications`);
  revalidatePath(`/candidate/applications`);

  return { success: true };
}
