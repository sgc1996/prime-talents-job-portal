import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sliders } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System Settings | Prime Hire Super Admin",
  description: "Configure system-wide feature flags, marketplace modes, and registration policies.",
};

export default async function AdminSettingsPage() {
  await requireRoleUser(["SUPER_ADMIN"]);

  const isEmployerRegEnabled =
    await SystemSettingsRepository.isPublicEmployerRegistrationEnabled();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-primary" />
            <span>Platform Settings & Feature Flags</span>
          </h1>
          <p className="text-sm text-slate-500">
            Control platform behaviors, employer access, and registration modes in real-time.
          </p>
        </div>
      </div>

      <SettingsForm initialEmployerRegistration={isEmployerRegEnabled} />
    </div>
  );
}
