import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ATSBoard } from "@/components/employer/ats-board";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface ATSPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ATSPageProps): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: job ? `ATS: ${job.title} | Prime Hire Employer` : "Applicant Tracking | Prime Hire",
  };
}

export default async function JobApplicationsPage({ params }: ATSPageProps) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer && user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      screeningQuestions: {
        select: { id: true, question: true, type: true },
      },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              district: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  // Security check: only the owning employer or SUPER_ADMIN
  if (user.role !== "SUPER_ADMIN" && job.employerId !== employer?.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/employer/jobs"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {job.title}
              </h1>
              <Badge variant="outline">{job.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Applicant Tracking & Hiring Pipeline • {job.applications.length} Total Applicants
            </p>
          </div>
        </div>

        {job.status === "APPROVED" && (
          <Link
            href={`/jobs/${job.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span>View Public Post</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* ATS Board */}
      <ATSBoard
        jobId={job.id}
        jobTitle={job.title}
        screeningQuestions={job.screeningQuestions}
        initialApplications={job.applications}
      />
    </div>
  );
}

