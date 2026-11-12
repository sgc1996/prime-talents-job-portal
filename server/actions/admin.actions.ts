"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import {
  JobStatus,
  JobType,
  ExperienceLevel,
  EducationLevel,
  ApplyMethod,
  EmployerVerificationStatus,
  UserStatus,
} from "@prisma/client";

// ==========================================
// 1. ADMIN POST VACANCY (WITH IMAGE / FLYER)
// ==========================================

interface AdminCreateJobInput {
  title: string;
  employerId?: string; // Optional: can assign to existing employer
  companyNameIfDirect?: string; // e.g. "Dialog Axiata" or "Bank of Ceylon"
  posterUrl?: string; // Flyer / Paper ad image URL
  sectorId: string;
  districtId?: string;
  city?: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryVisible?: boolean;
  descriptionHtml: string;
  requirementsHtml?: string;
  benefitsHtml?: string;
  applyMethod: ApplyMethod;
  applyUrl?: string;
  applyEmail?: string;
  isFeatured?: boolean;
}

export async function createAdminJobAction(data: AdminCreateJobInput) {
  const admin = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  let targetEmployerId = data.employerId;

  // If no employer selected, find or create direct posting company
  if (!targetEmployerId) {
    const directCompanyName = data.companyNameIfDirect?.trim() || "WorkLanka Direct Postings";
    const slug = directCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let directProfile = await prisma.employerProfile.findFirst({
      where: { companyName: directCompanyName },
    });

    if (!directProfile) {
      directProfile = await prisma.employerProfile.create({
        data: {
          userId: admin.id,
          companyName: directCompanyName,
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          verificationStatus: EmployerVerificationStatus.VERIFIED,
          about: "Official direct listing published by WorkLanka Administration.",
          districtId: data.districtId || null,
          sectorId: data.sectorId,
        },
      });
    }

    targetEmployerId = directProfile.id;
  }

  // Generate unique slug
  const baseSlug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const slug = `${baseSlug}-${randomSuffix}`;

  const featuredUntil = data.isFeatured
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : null;

  const job = await prisma.job.create({
    data: {
      employerId: targetEmployerId,
      title: data.title.trim(),
      slug,
      posterUrl: data.posterUrl?.trim() || null,
      sectorId: data.sectorId,
      districtId: data.districtId || null,
      city: data.city?.trim() || null,
      jobType: data.jobType,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryCurrency: "LKR",
      salaryVisible: data.salaryVisible ?? true,
      descriptionHtml: data.descriptionHtml,
      requirementsHtml: data.requirementsHtml || null,
      benefitsHtml: data.benefitsHtml || null,
      applyMethod: data.applyMethod,
      applyUrl: data.applyUrl?.trim() || null,
      applyEmail: data.applyEmail?.trim() || null,
      status: JobStatus.APPROVED,
      isFeatured: data.isFeatured ?? false,
      featuredUntil,
      publishedAt: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Log Audit trail
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "ADMIN_JOB_CREATED",
      entityType: "Job",
      entityId: job.id,
      after: {
        title: job.title,
        slug: job.slug,
        isFeatured: job.isFeatured,
        hasPoster: !!job.posterUrl,
      },
    },
  });

  revalidatePath(`/admin`);
  revalidatePath(`/jobs`);
  revalidatePath(`/jobs/${job.slug}`);

  return { success: true, slug: job.slug, id: job.id };
}

// ==========================================
// 2. VERIFY / REJECT EMPLOYER
// ==========================================

export async function verifyEmployerAction(
  employerId: string,
  action: "VERIFY" | "REJECT",
  note?: string,
) {
  const admin = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { id: employerId },
    include: { user: true },
  });

  if (!employer) {
    throw new Error("Employer profile not found");
  }

  const newStatus =
    action === "VERIFY"
      ? EmployerVerificationStatus.VERIFIED
      : EmployerVerificationStatus.REJECTED;

  await prisma.employerProfile.update({
    where: { id: employerId },
    data: {
      verificationStatus: newStatus,
    },
  });

  // If verified, auto-approve any jobs that were pending review for this employer
  if (action === "VERIFY") {
    await prisma.job.updateMany({
      where: {
        employerId,
        status: JobStatus.PENDING_REVIEW,
      },
      data: {
        status: JobStatus.APPROVED,
        publishedAt: new Date(),
      },
    });
  }

  // Notify employer user
  await prisma.notification.create({
    data: {
      userId: employer.userId,
      title:
        action === "VERIFY"
          ? "🎉 Company Verified Successfully!"
          : "⚠️ Company Verification Update",
      message:
        action === "VERIFY"
          ? `Your organization "${employer.companyName}" has been officially verified by WorkLanka administration. Your jobs are now live with the Verified Badge.`
          : `Verification for "${employer.companyName}" was rejected. Reason: ${note || "Credentials did not meet verification criteria."}`,
      link: `/employer/profile`,
    },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: action === "VERIFY" ? "EMPLOYER_VERIFIED" : "EMPLOYER_REJECTED",
      entityType: "EmployerProfile",
      entityId: employerId,
      before: { status: employer.verificationStatus },
      after: { status: newStatus, note: note || null },
    },
  });

  revalidatePath(`/admin/moderation/employers`);
  revalidatePath(`/companies/${employer.slug}`);
  revalidatePath(`/employer`);

  return { success: true };
}

// ==========================================
// 3. MODERATE VACANCY (APPROVE / REJECT)
// ==========================================

export async function moderateJobAction(
  jobId: string,
  action: "APPROVE" | "REJECT",
  moderationNote?: string,
) {
  const admin = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: {
        include: { user: true },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const newStatus = action === "APPROVE" ? JobStatus.APPROVED : JobStatus.REJECTED;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: newStatus,
      moderationNote: moderationNote?.trim() || null,
      publishedAt: action === "APPROVE" ? new Date() : job.publishedAt,
    },
  });

  // Notify employer
  await prisma.notification.create({
    data: {
      userId: job.employer.userId,
      title:
        action === "APPROVE"
          ? `Vacancy Approved: ${job.title}`
          : `Vacancy Needs Revision: ${job.title}`,
      message:
        action === "APPROVE"
          ? `Your job posting "${job.title}" has been approved and is now live.`
          : `Your job posting was rejected by moderation. Reason: ${moderationNote || "Violates listing policies."}`,
      link: `/employer/jobs`,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: action === "APPROVE" ? "JOB_APPROVED" : "JOB_REJECTED",
      entityType: "Job",
      entityId: jobId,
      before: { status: job.status },
      after: { status: newStatus, note: moderationNote || null },
    },
  });

  revalidatePath(`/admin/moderation/jobs`);
  revalidatePath(`/jobs`);
  revalidatePath(`/jobs/${job.slug}`);
  revalidatePath(`/employer/jobs`);

  return { success: true };
}

// ==========================================
// 4. USER GOVERNANCE (SUPER ADMIN ONLY)
// ==========================================

export async function toggleUserStatusAction(userId: string, newStatus: UserStatus) {
  const admin = await requireRoleUser(["SUPER_ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "SUPER_ADMIN" && user.id === admin.id) {
    throw new Error("Cannot alter your own Super Admin account status");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
      entityType: "User",
      entityId: userId,
      before: { status: user.status },
      after: { status: newStatus },
    },
  });

  revalidatePath(`/admin/users`);
  return { success: true };
}

