"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { EducationLevel, ProfileVisibility } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isCommonPassword } from "@/lib/security/password-policy";

interface UpdateCandidateProfileInput {
  headline?: string;
  summary?: string;
  phone?: string;
  districtId?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  experienceYears?: number;
  educationLevel?: EducationLevel;
  visibility?: ProfileVisibility;
  openToWork?: boolean;
}

export async function updateCandidateProfileAction(data: UpdateCandidateProfileInput) {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  // Calculate completeness score based on populated fields
  let score = 20; // Base score for account
  if (data.headline?.trim()) score += 15;
  if (data.summary?.trim()) score += 15;
  if (data.phone?.trim()) score += 10;
  if (data.districtId) score += 10;
  if (data.expectedSalaryMin || data.expectedSalaryMax) score += 10;
  if (data.experienceYears !== undefined) score += 10;
  if (data.educationLevel) score += 10;

  await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: data.headline?.trim() || null,
      summary: data.summary?.trim() || null,
      phone: data.phone?.trim() || null,
      districtId: data.districtId || null,
      expectedSalaryMin: data.expectedSalaryMin || null,
      expectedSalaryMax: data.expectedSalaryMax || null,
      experienceYears: data.experienceYears,
      educationLevel: data.educationLevel,
      visibility: data.visibility || "PUBLIC",
      openToWork: data.openToWork ?? true,
      profileCompleteness: Math.min(100, score),
    },
    create: {
      userId: user.id,
      headline: data.headline?.trim() || null,
      summary: data.summary?.trim() || null,
      phone: data.phone?.trim() || null,
      districtId: data.districtId || null,
      expectedSalaryMin: data.expectedSalaryMin || null,
      expectedSalaryMax: data.expectedSalaryMax || null,
      experienceYears: data.experienceYears,
      educationLevel: data.educationLevel,
      visibility: data.visibility || "PUBLIC",
      openToWork: data.openToWork ?? true,
      profileCompleteness: Math.min(100, score),
    },
  });

  revalidatePath(`/candidate`);
  revalidatePath(`/candidate/profile`);

  return { success: true };
}

// ==========================================
// ADMIN / STAFF PROFILE & SECURITY ACTIONS
// ==========================================

export async function updateAdminProfileAction(data: { name: string; phone?: string }) {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  if (!data.name || data.name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
    },
  });

  revalidatePath(`/admin`);
  revalidatePath(`/admin/profile`);

  return { success: true, message: "Profile details updated successfully!" };
}

export async function changeAdminPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  if (data.newPassword !== data.confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  if (data.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long");
  }

  if (isCommonPassword(data.newPassword)) {
    throw new Error("Password is too common or easily guessed. Please choose a stronger password.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.passwordHash) {
    throw new Error("User account not found");
  }

  const isCurrentValid = await bcrypt.compare(data.currentPassword, dbUser.passwordHash);
  if (!isCurrentValid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
    },
  });

  revalidatePath(`/admin/profile`);
  return {
    success: true,
    message: "Password changed successfully! Please use your new password next time you log in.",
  };
}

