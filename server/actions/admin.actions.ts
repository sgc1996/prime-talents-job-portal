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
  UserRole,
  ApplicationStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

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
    const directCompanyName = data.companyNameIfDirect?.trim() || "Prime Hire Direct Postings";
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
          about: "Official direct listing published by Prime Hire Administration.",
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
          ? `Your organization "${employer.companyName}" has been officially verified by Prime Hire administration. Your jobs are now live with the Verified Badge.`
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

const MAX_SUPER_ADMINS = 2;

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

// ==========================================
// 6. UPDATE USER ROLE & CREATE STAFF
// ==========================================

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const admin = await requireRoleUser(["SUPER_ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent self-demotion
  if (user.id === admin.id && newRole !== "SUPER_ADMIN") {
    throw new Error("You cannot change or demote your own Super Admin role");
  }

  // Enforce Max Super Admins Limit
  if (newRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });
    if (superAdminCount >= MAX_SUPER_ADMINS) {
      throw new Error(
        `Security Policy: Maximum of ${MAX_SUPER_ADMINS} Super Admin accounts allowed. Please demote or delete an existing Super Admin first.`,
      );
    }
  }

  // If demoting another Super Admin, ensure at least one other active Super Admin remains
  if (user.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    });
    if (superAdminCount <= 1) {
      throw new Error("Cannot demote the last remaining Super Admin");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "USER_ROLE_CHANGED",
      entityType: "User",
      entityId: userId,
      before: { role: user.role },
      after: { role: newRole },
    },
  });

  revalidatePath(`/admin/users`);
  return {
    success: true,
    message: `Role for ${user.email} updated to ${newRole}`,
    user: { id: user.id, role: newRole },
  };
}

export async function createStaffUserAction(data: {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}) {
  const admin = await requireRoleUser(["SUPER_ADMIN"]);

  const email = data.email.toLowerCase().trim();
  const name = data.name.trim();
  const password = data.password.trim();

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (data.role !== "SUPER_ADMIN" && data.role !== "MODERATOR") {
    throw new Error("Staff role must be either SUPER_ADMIN or MODERATOR");
  }

  // Enforce Max Super Admins Limit
  if (data.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });
    if (superAdminCount >= MAX_SUPER_ADMINS) {
      throw new Error(
        `Security Policy: Maximum of ${MAX_SUPER_ADMINS} Super Admin accounts allowed. Please demote or delete an existing Super Admin first.`,
      );
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("A user with this email address already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: data.role,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "STAFF_USER_CREATED",
      entityType: "User",
      entityId: newUser.id,
      after: { role: newUser.role, email: newUser.email },
    },
  });

  revalidatePath(`/admin/users`);
  return {
    success: true,
    message: `Staff user created successfully: ${newUser.email} (${newUser.role})`,
    user: { id: newUser.id, email: newUser.email, role: newUser.role },
  };
}

// ==========================================
// 7. SUPER ADMIN: EDIT & DELETE ANY USER
// ==========================================

export async function updateUserDetailsAdminAction(data: {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  newPassword?: string;
}) {
  const admin = await requireRoleUser(["SUPER_ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const name = data.name.trim();
  const email = data.email.toLowerCase().trim();
  const phone = data.phone?.trim() || null;

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address format");
  }

  // Prevent self-demotion or self-suspension
  if (user.id === admin.id) {
    if (data.role !== "SUPER_ADMIN") {
      throw new Error("You cannot change or demote your own Super Admin role");
    }
    if (data.status !== "ACTIVE") {
      throw new Error("You cannot suspend your own Super Admin account");
    }
  }

  // Enforce Domain Separation: Public accounts (Candidate / Employer) cannot become Staff (Moderator / Super Admin)
  const isCurrentPublic = user.role === "CANDIDATE" || user.role === "EMPLOYER";
  const isTargetStaff = data.role === "MODERATOR" || data.role === "SUPER_ADMIN";
  if (isCurrentPublic && isTargetStaff) {
    throw new Error(
      "Security Policy: Public accounts (Candidates & Employers) cannot be converted into Staff / Admin roles. Please use 'Add Staff / Admin' to create dedicated staff accounts.",
    );
  }

  const isCurrentStaff = user.role === "MODERATOR" || user.role === "SUPER_ADMIN";
  const isTargetPublic = data.role === "CANDIDATE" || data.role === "EMPLOYER";
  if (isCurrentStaff && isTargetPublic) {
    throw new Error(
      "Security Policy: Internal Staff accounts cannot be converted into public Candidate or Employer accounts.",
    );
  }

  // Enforce Max Super Admins Limit when promoting a user to SUPER_ADMIN
  if (data.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });
    if (superAdminCount >= MAX_SUPER_ADMINS) {
      throw new Error(
        `Security Policy: Maximum of ${MAX_SUPER_ADMINS} Super Admin accounts allowed. Please demote or delete an existing Super Admin first.`,
      );
    }
  }

  // If changing from SUPER_ADMIN to another role or suspending a SUPER_ADMIN, ensure another exists
  if (
    user.role === "SUPER_ADMIN" &&
    (data.role !== "SUPER_ADMIN" || data.status !== "ACTIVE")
  ) {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    });
    if (superAdminCount <= 1) {
      throw new Error("Cannot demote or suspend the last remaining active Super Admin");
    }
  }

  // Check email conflict
  if (email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing && existing.id !== user.id) {
      throw new Error("This email is already in use by another account");
    }
  }

  const updateData: {
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    passwordHash?: string;
  } = {
    name,
    email,
    phone,
    role: data.role,
    status: data.status,
  };

  if (data.newPassword && data.newPassword.trim().length > 0) {
    if (data.newPassword.trim().length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    updateData.passwordHash = await bcrypt.hash(data.newPassword.trim(), 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "USER_UPDATED_BY_ADMIN",
      entityType: "User",
      entityId: user.id,
      before: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      after: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        passwordChanged: !!data.newPassword,
      },
    },
  });

  revalidatePath(`/admin/users`);
  return {
    success: true,
    message: `Account for ${updatedUser.name} (${updatedUser.email}) updated successfully`,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
    },
  };
}

export async function deleteUserAdminAction(userId: string) {
  const admin = await requireRoleUser(["SUPER_ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found or already deleted");
  }

  if (user.id === admin.id) {
    throw new Error("You cannot delete your own Super Admin account");
  }

  if (user.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    });
    if (superAdminCount <= 1) {
      throw new Error("Cannot delete the last remaining active Super Admin");
    }
  }

  // Record audit log before deletion
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "USER_DELETED_BY_ADMIN",
      entityType: "User",
      entityId: userId,
      before: {
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    },
  });

  // Permanently delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath(`/admin/users`);
  revalidatePath(`/admin`);

  return {
    success: true,
    message: `User account (${user.email}) permanently deleted`,
  };
}

// ==========================================
// 10. ADMIN CANDIDATE APPLICATION STATUS
// ==========================================

export async function updateAdminApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus,
  note?: string,
) {
  const admin = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: {
        include: { user: true },
      },
      job: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      employerNote: note !== undefined ? note.trim() : application.employerNote,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "APPLICATION_STATUS_UPDATED",
      entityType: "APPLICATION",
      entityId: applicationId,
      after: {
        previousStatus: application.status,
        newStatus,
        candidateName: application.candidate.user.name,
        candidateEmail: application.candidate.user.email,
        jobTitle: application.job.title,
        note,
      },
    },
  });

  revalidatePath("/admin/candidates");
  return { success: true, message: `Application status updated to ${newStatus}` };
}



