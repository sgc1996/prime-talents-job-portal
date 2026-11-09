"use client";

import * as React from "react";
import { useState } from "react";
import { verifyEmployerAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";

interface PendingEmployer {
  id: string;
  companyName: string;
  slug: string;
  about?: string | null;
  website?: string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    createdAt: Date | string;
  };
  sector?: { name: string } | null;
  district?: { name: string } | null;
}

interface EmployerVerificationTableProps {
  initialEmployers: PendingEmployer[];
}

export function EmployerVerificationTable({ initialEmployers }: EmployerVerificationTableProps) {
  const [employers, setEmployers] = useState<PendingEmployer[]>(initialEmployers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingEmployer, setRejectingEmployer] = useState<PendingEmployer | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const handleVerify = async (employerId: string) => {
    try {
      setLoadingId(employerId);
      await verifyEmployerAction(employerId, "VERIFY");
      setEmployers((prev) => prev.filter((e) => e.id !== employerId));
      toast.success("Organization verified and given Verified Badge!");
    } catch (err: any) {
      toast.error(err.message || "Failed to verify employer");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingEmployer) return;
    try {
      setLoadingId(rejectingEmployer.id);
      await verifyEmployerAction(rejectingEmployer.id, "REJECT", rejectionNote);
      setEmployers((prev) => prev.filter((e) => e.id !== rejectingEmployer.id));
      setRejectingEmployer(null);
      setRejectionNote("");
      toast.success("Employer verification request rejected with note.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject employer");
    } finally {
      setLoadingId(null);
    }
  };

  if (employers.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Verification Queue Clear
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          All employer registrations have been reviewed. New employer signups will appear here for verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Organization &amp; Industry</th>
                <th className="px-6 py-4">Account Owner Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {employers.map((emp) => {
                const isLoading = loadingId === emp.id;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          <Building2 className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {emp.companyName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {emp.sector?.name || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                        {emp.user.name || "Owner"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{emp.user.email}</span>
                      </div>
                      {emp.user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{emp.user.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.district?.name ? `${emp.district.name} District` : "Not specified"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(emp.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleVerify(emp.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                              Verify &amp; Approve
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => setRejectingEmployer(emp)}
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs h-8 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingEmployer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reject Verification for {rejectingEmployer.companyName}
            </h3>
            <p className="text-xs text-slate-500">
              Please enter the reason for rejecting this employer. This note will be sent directly to the account owner.
            </p>

            <Textarea
              rows={3}
              placeholder="e.g. Invalid business registration document or unresponsive contact phone number..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              className="text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingEmployer(null);
                  setRejectionNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={loadingId !== null}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
