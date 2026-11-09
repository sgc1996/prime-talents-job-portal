"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

interface SubmitApplicationInput {
  jobId: string;
  cvFileId: string;
  coverLetter?: string;
  answers?: Record<string, string>;
}

export async function submitApplicationAction(data: SubmitApplicationInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please sign in as a job seeker to apply" };
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });

  if (!candidate) {
    return { success: false, error: "Only job seekers can apply for vacancies" };
  }

  // Check if job exists and is approved
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
  });

  if (!job || job.status !== "APPROVED") {
    return { success: false, error: "This job opening is no longer accepting applications." };
  }

  // Check for duplicate application
  const existingApp = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: data.jobId,
        candidateId: candidate.id,
      },
    },
  });

  if (existingApp) {
    return { success: false, error: "You have already applied for this position." };
  }

  // Create Application
  const application = await prisma.application.create({
    data: {
      jobId: data.jobId,
      candidateId: candidate.id,
      cvFileId: data.cvFileId,
      answers: data.answers || {},
      employerNote: data.coverLetter ? `Cover Letter note: ${data.coverLetter}` : null,
      status: "NEW",
    },
  });

  // Create notification for candidate
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Application Submitted",
      message: `Your application for "${job.title}" has been successfully sent to the employer.`,
      link: `/candidate/applications`,
    },
  });

  revalidatePath(`/jobs/${job.slug}`);
  revalidatePath(`/candidate/applications`);

  return { success: true, applicationId: application.id };
}

