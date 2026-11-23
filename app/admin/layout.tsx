import { Metadata } from "next";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prime Hire Control Panel",
  description: "Administrative backend for job moderation, employer verification, and platform management.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  const kpis = await AdminRepository.getKPIs();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <AdminSidebar
        user={user}
        counts={{
          pendingJobs: kpis.pendingJobsCount,
          pendingEmployers: kpis.pendingEmployersCount,
          pendingSlips: kpis.pendingSlipsCount,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
