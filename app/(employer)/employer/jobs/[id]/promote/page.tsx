import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { BankSlipUploadForm } from "@/components/employer/bank-slip-upload-form";

export const dynamic = "force-dynamic";

interface PromotePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PromotePageProps): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: job ? `Promote ${job.title} | Prime Hire Employer` : "Promote Vacancy",
  };
}

export default async function PromoteJobPage({ params }: PromotePageProps) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  const job = await prisma.job.findUnique({
    where: { id: params.id },
  });

  if (!job) {
    notFound();
  }

  if (job.employerId !== employer?.id && user.role !== "SUPER_ADMIN") {
    notFound();
  }

  // Check if an order is already pending for this job
  const existingPendingOrder = await prisma.order.findFirst({
    where: {
      jobId: job.id,
      status: "PENDING",
      slipFileId: { not: null },
    },
    select: {
      id: true,
      createdAt: true,
      bankReference: true,
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/employer/jobs"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Promote Job Vacancy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Boost applicant visibility across all 9 provinces with 30-day Featured placement.
          </p>
        </div>
      </div>

      <BankSlipUploadForm
        job={job}
        existingPendingOrder={existingPendingOrder}
      />
    </div>
  );
}

