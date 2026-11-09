import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminJobPostForm } from "@/components/admin/admin-job-post-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Post Vacancy (Flyer & Direct) | WorkLanka",
  description: "Publish a vacancy or newspaper advertisement flyer as an administrator.",
};

export default async function AdminNewJobPage() {
  await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const [sectors, districts, employers] = await Promise.all([
    prisma.sector.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.district.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.employerProfile.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Publish Vacancy as Administrator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload newspaper advertisements, graphic flyers, or structured vacancies directly to the live board.
          </p>
        </div>
      </div>

      <AdminJobPostForm
        sectors={sectors}
        districts={districts}
        employers={employers}
      />
    </div>
  );
}
