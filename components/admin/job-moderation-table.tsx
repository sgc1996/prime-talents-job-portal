"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { moderateJobAction } from "@/server/actions/admin.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface PendingJob {
  id: string;
  title: string;
  slug: string;
  createdAt: Date | string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employer: {
    id: string;
    companyName: string;
    slug: string;
    verificationStatus: string;
  };
  sector?: { name: string } | null;
  district?: { name: string } | null;
}

interface JobModerationTableProps {
  initialJobs: PendingJob[];
}

export function JobModerationTable({ initialJobs }: JobModerationTableProps) {
  const [jobs, setJobs] = useState<PendingJob[]>(initialJobs);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingJob, setRejectingJob] = useState<PendingJob | null>(null);
  const [moderationNote, setModerationNote] = useState("");

  const handleApprove = async (jobId: string) => {
    try {
      setLoadingId(jobId);
      await moderateJobAction(jobId, "APPROVE");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job vacancy approved and published live!");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve job");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingJob) return;
    try {
      setLoadingId(rejectingJob.id);
      await moderateJobAction(rejectingJob.id, "REJECT", moderationNote);
      setJobs((prev) => prev.filter((j) => j.id !== rejectingJob.id));
      setRejectingJob(null);
      setModerationNote("");
      toast.success("Job vacancy rejected with moderation note.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject job");
    } finally {
      setLoadingId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Job Moderation Queue Clear
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          All submitted job vacancies have been reviewed. New employer submissions will appear here for moderation.
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
                <th className="px-6 py-4">Vacancy Title &amp; Details</th>
                <th className="px-6 py-4">Hiring Company</th>
                <th className="px-6 py-4">Sector &amp; Location</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {jobs.map((job) => {
                const isLoading = loadingId === job.id;

                return (
                  <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{job.title}</span>
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-emerald-600 transition"
                          title="Preview Listing"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.salaryMin || job.salaryMax
                          ? `LKR ${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || "Max"}`
                          : "Salary Negotiable"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.employer.companyName}</span>
                      </div>
                      <div className="mt-1">
                        {job.employer.verificationStatus === "VERIFIED" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] py-0 px-1.5 border-emerald-500/20">
                            Verified Employer
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-600 border-amber-500/30">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      <p>{job.sector?.name || "General Sector"}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{job.district?.name ? `${job.district.name} District` : "Islandwide"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString("en-US", {
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
                          onClick={() => handleApprove(job.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => setRejectingJob(job)}
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
      {rejectingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reject Vacancy: {rejectingJob.title}
            </h3>
            <p className="text-xs text-slate-500">
              Provide feedback to the employer regarding why this job vacancy requires modification before publication.
            </p>

            <Textarea
              rows={3}
              placeholder="e.g. Please provide a clear compensation range and accurate contact details..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              className="text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingJob(null);
                  setModerationNote("");
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
