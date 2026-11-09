"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { EducationLevel, ProfileVisibility } from "@prisma/client";

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

