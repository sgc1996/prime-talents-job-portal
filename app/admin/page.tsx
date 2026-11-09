import { Metadata } from "next";
import Link from "next/link";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Building2,
  CreditCard,
  PlusCircle,
  CheckSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Overview | WorkLanka",
};

export default async function AdminDashboardPage() {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  const kpis = await AdminRepository.getKPIs();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Administrative Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, {user.name || user.email} ({user.role}). Real-time platform pulse.
          </p>
        </div>

        <Link href="/admin/jobs/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post Vacancy with Flyer
          </Button>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.totalUsers}</p>
          <p className="text-[11px] text-slate-500 mt-1">Platform community</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.activeJobsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Live on board</p>
        </div>

        <Link
          href="/admin/moderation/jobs"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Jobs</span>
            <CheckSquare className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.pendingJobsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires review &rarr;</p>
        </Link>

        <Link
          href="/admin/moderation/employers"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Pending Companies</span>
            <Building2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{kpis.pendingEmployersCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting verification &rarr;</p>
        </Link>

        <Link
          href="/admin/payments"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Bank Slips</span>
            <CreditCard className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{kpis.pendingSlipsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Promotion receipts &rarr;</p>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Candidates</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.candidatesCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active talent profiles</p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Priority Operational Tasks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Post Job with Flyer
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Publish a newspaper clipping or graphic advertisement flyer directly as a verified vacancy.
              </p>
            </div>
            <Link href="/admin/jobs/new" className="mt-4">
              <Button size="sm" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs">
                Post Vacancy Now
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Employer Verifications
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review pending company registrations, inspect BR documents, and grant the official Blue Tick badge.
              </p>
            </div>
            <Link href="/admin/moderation/employers" className="mt-4">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Inspect ({kpis.pendingEmployersCount} Pending)
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Bank Slip Promotions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Validate employer bank deposit receipts and immediately feature vacancies for 30 days.
              </p>
            </div>
            <Link href="/admin/payments" className="mt-4">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Review Slips ({kpis.pendingSlipsCount} Pending)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
