import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserCircle } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminProfileForm } from "@/components/admin/admin-profile-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Profile & Security | Prime Hire",
  description: "Manage your administrator account details, profile, and password.",
};

export default async function AdminProfilePage() {
  const sessionUser = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-primary" />
            <span>Profile &amp; Account Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your personal administrative credentials, name, and security password.
          </p>
        </div>
      </div>

      <AdminProfileForm user={user} />
    </div>
  );
}
