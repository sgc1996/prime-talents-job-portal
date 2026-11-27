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
  GraduationCap,
  Send,
  Download,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Overview | Prime Hire",
};

export default async function AdminDashboardPage() {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  const [kpis, recentCandidates] = await Promise.all([
    AdminRepository.getKPIs(),
    AdminRepository.getCandidates({ limit: 5 }),
  ]);

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

        <div className="flex items-center gap-2">
          <Link href="/admin/candidates">
            <Button variant="outline" className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
              <GraduationCap className="w-4 h-4 mr-2" />
              Talent Pool &amp; CVs
            </Button>
          </Link>
          <Link href="/admin/jobs/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post Vacancy with Flyer
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.totalUsers}</p>
          <p className="text-[11px] text-slate-500 mt-1">Platform community</p>
        </div>

        {/* Candidates & CVs */}
        <Link
          href="/admin/candidates"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Candidates &amp; CVs</span>
            <GraduationCap className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.candidatesCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Talent database &rarr;</p>
        </Link>

        {/* Applications */}
        <Link
          href="/admin/candidates"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Applications</span>
            <Send className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{kpis.totalApplicationsCount || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Submissions &rarr;</p>
        </Link>

        {/* Active Jobs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.activeJobsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Live on board</p>
        </div>

        {/* Pending Jobs */}
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

        {/* Pending Companies */}
        <Link
          href="/admin/moderation/employers"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Pending Cos.</span>
            <Building2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{kpis.pendingEmployersCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verification &rarr;</p>
        </Link>

        {/* Bank Slips */}
        <Link
          href="/admin/payments"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Bank Slips</span>
            <CreditCard className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{kpis.pendingSlipsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Receipts &rarr;</p>
        </Link>
      </div>

      {/* Priority Operational Tasks */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Priority Operational Tasks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Candidates & CVs Task Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-400 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Candidate Pool &amp; Resumes
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review registered candidates, download PDF resumes, inspect skills, and track application statuses.
              </p>
            </div>
            <Link href="/admin/candidates" className="mt-4">
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                Inspect Candidates ({kpis.candidatesCount})
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
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

      {/* Recent Candidate Registrations & Resumes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Candidate Registrations &amp; CVs
            </h2>
            <p className="text-xs text-slate-500">
              Latest job seekers registered on the portal
            </p>
          </div>
          <Link
            href="/admin/candidates"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View Full Talent Pool ({kpis.candidatesCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Headline</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">CV Document</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentCandidates.length > 0 ? (
                  recentCandidates.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {c.name ? c.name[0].toUpperCase() : "C"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {c.name || "Unnamed"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{c.email}</p>
                          <p className="text-slate-400 text-[11px]">{c.phone || "No phone"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 dark:text-slate-300">
                          {c.candidateProfile?.district?.name || "Unspecified"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800 dark:text-slate-200 max-w-[160px] truncate block" title={c.candidateProfile?.headline || ""}>
                          {c.candidateProfile?.headline || "No headline"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                          {c.candidateProfile?.applications?.length || 0} applied
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {c.latestCv ? (
                          <a
                            href={`/api/files/${c.latestCv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition shadow-xs"
                          >
                            <Download className="w-3 h-3" />
                            Download CV
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No CV uploaded</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/admin/candidates">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
                            Details &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No candidate profiles registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
