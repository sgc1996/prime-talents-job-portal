import { Metadata } from "next";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { CandidateManagementTable } from "@/components/admin/candidate-management-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidate Talent Pool & CVs | Prime Hire Control Panel",
  description: "Search, view candidate career profiles, download CVs, and track job applications across Sri Lanka.",
};

export default async function AdminCandidatesPage() {
  await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const [candidates, stats, districts] = await Promise.all([
    AdminRepository.getCandidates(),
    AdminRepository.getCandidateStats(),
    prisma.district.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Candidate Talent Pool &amp; CV Database
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review registered Sri Lankan job seekers, download candidate resumes (CVs), and track job application pipelines.
        </p>
      </div>

      {/* Main Candidate Table */}
      <CandidateManagementTable
        initialCandidates={candidates as any}
        districts={districts}
        stats={stats}
      />
    </div>
  );
}
