import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Calendar, User } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Trail | WorkLanka Super Admin",
  description: "Tamper-evident log of administrative actions across the platform.",
};

export default async function AuditLogsPage() {
  await requireRoleUser(["SUPER_ADMIN"]);
  const logs = await AdminRepository.getAuditLogs(100);

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
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Audit Trail &amp; Governance Logs</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Immutable log of all administrative interventions, moderation decisions, and account status updates.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Action &amp; Target</th>
                <th className="px-6 py-4">Administrator / Actor</th>
                <th className="px-6 py-4">Context / Payload</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-sans italic">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {log.entityType} ({log.entityId || "N/A"})
                      </div>
                    </td>

                    <td className="px-6 py-4 font-sans">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.actor ? (log.actor.name || log.actor.email) : "System"}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {log.actor ? log.actor.role : "SYSTEM"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      {log.after ? (
                        <pre className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md max-w-sm overflow-x-auto text-slate-700 dark:text-slate-300">
                          {JSON.stringify(log.after, null, 1)}
                        </pre>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right font-sans text-xs text-slate-500">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
