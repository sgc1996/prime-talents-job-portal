import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { UserManagementTable } from "@/components/admin/user-management-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Governance | WorkLanka Super Admin",
  description: "Manage and audit registered user accounts.",
};

export default async function AdminUsersPage() {
  await requireRoleUser(["SUPER_ADMIN"]);
  const users = await AdminRepository.getUsers({ limit: 100 });

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
            User Governance &amp; Security
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, inspect account privileges, and toggle activation status for platform users.
          </p>
        </div>
      </div>

      <UserManagementTable initialUsers={users} />
    </div>
  );
}

