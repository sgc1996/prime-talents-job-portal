import { Metadata } from "next";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EmployerJobsTable } from "@/components/employer/employer-jobs-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Vacancies | WorkLanka Employer",
  description: "View and manage all active, draft, and closed job postings.",
};

export default async function EmployerJobsPage() {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employer) {
    return (
      <div className="p-8 text-center text-slate-500">
        Employer profile not found.
      </div>
    );
  }

  const jobs = await prisma.job.findMany({
    where: { employerId: employer.id },
    orderBy: { createdAt: "desc" },
    include: {
      district: {
        select: { name: true },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Vacancies</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your published listings, track applications, and optimize your hiring pipeline.
        </p>
      </div>

      <EmployerJobsTable initialJobs={jobs} />
    </div>
  );
}

