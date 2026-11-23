import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { JobWizardForm } from "@/components/employer/job-wizard-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post a New Vacancy | Prime Hire Employer",
  description: "Create and publish a new job vacancy on Prime Hire.",
};

export default async function NewJobPage() {
  await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const [sectors, districts] = await Promise.all([
    prisma.sector.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.district.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/employer/jobs"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a New Vacancy</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Publish your opportunity to reach top Sri Lankan talent across all 9 provinces.
          </p>
        </div>
      </div>

      <JobWizardForm sectors={sectors} districts={districts} />
    </div>
  );
}

