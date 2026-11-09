"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSaveJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please sign in to save jobs" };
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });

  if (!candidate) {
    return { success: false, error: "Only job seekers can bookmark jobs" };
  }

  const existing = await prisma.savedJob.findUnique({
    where: {
      candidateId_jobId: {
        candidateId: candidate.id,
        jobId,
      },
    },
  });

  if (existing) {
    await prisma.savedJob.delete({
      where: { id: existing.id },
    });
    revalidatePath(`/jobs`);
    revalidatePath(`/candidate/saved`);
    return { success: true, saved: false };
  }

  await prisma.savedJob.create({
    data: {
      candidateId: candidate.id,
      jobId,
    },
  });

  revalidatePath(`/jobs`);
  revalidatePath(`/candidate/saved`);
  return { success: true, saved: true };
}
