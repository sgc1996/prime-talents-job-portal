import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { EmployerVerificationTable } from "@/components/admin/employer-verification-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify Employers | WorkLanka Moderation",
  description: "Employer verification queue to inspect new organization registrations.",
};

export default async function EmployerVerificationPage() {
  await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  const pendingEmployers = await AdminRepository.getPendingEmployers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Employer Verification Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inspect newly registered companies and approve official Verified Badges to maintain platform trust.
          </p>
        </div>
      </div>

      <EmployerVerificationTable initialEmployers={pendingEmployers} />
    </div>
  );
}
