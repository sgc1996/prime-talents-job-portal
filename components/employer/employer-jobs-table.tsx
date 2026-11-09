"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { JobStatus, JobType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateJobStatusAction } from "@/server/actions/employer.actions";
import { toast } from "sonner";
import {
  Users,
  Eye,
  ExternalLink,
  CheckCircle2,
  Archive,
  RefreshCw,
  Plus,
  Briefcase,
} from "lucide-react";

interface JobRow {
  id: string;
  title: string;
  slug: string;
  jobType: JobType;
  status: JobStatus;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  vacancies: number;
  viewCount: number;
  district?: { name: string } | null;
  _count: {
    applications: number;
  };
}

interface EmployerJobsTableProps {
  initialJobs: JobRow[];
}

export function EmployerJobsTable({ initialJobs }: EmployerJobsTableProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "DRAFT" | "CLOSED">("ALL");
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  const filteredJobs = initialJobs.filter((job) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return job.status === "APPROVED";
    if (filter === "PENDING") return job.status === "PENDING_REVIEW";
    if (filter === "DRAFT") return job.status === "DRAFT";
    if (filter === "CLOSED") {
      return (
        job.status === "FILLED" ||
        job.status === "ARCHIVED" ||
        job.status === "EXPIRED" ||
        job.status === "REJECTED"
      );
    }
    return true;
  });

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      setLoadingJobId(jobId);
      await updateJobStatusAction(jobId, status);
      toast.success(`Job marked as ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update job status");
    } finally {
      setLoadingJobId(null);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Active</Badge>;
      case "PENDING_REVIEW":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Under Review</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "FILLED":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Filled</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(
            [
              { id: "ALL", label: `All (${initialJobs.length})` },
              { id: "ACTIVE", label: `Active (${initialJobs.filter((j) => j.status === "APPROVED").length})` },
              { id: "PENDING", label: `Review (${initialJobs.filter((j) => j.status === "PENDING_REVIEW").length})` },
              { id: "DRAFT", label: `Drafts (${initialJobs.filter((j) => j.status === "DRAFT").length})` },
              { id: "CLOSED", label: `Closed (${initialJobs.filter((j) => ["FILLED", "ARCHIVED", "EXPIRED", "REJECTED"].includes(j.status)).length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filter === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link href="/employer/jobs/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Post New Vacancy
          </Button>
        </Link>
      </div>

      {/* Table view */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            No vacancies found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            {filter === "ALL"
              ? "You haven't posted any job vacancies yet. Get started by creating your first post."
              : `You have no vacancies currently categorized under '${filter.toLowerCase()}'.`}
          </p>
          <Link href="/employer/jobs/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Post a Vacancy
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Job Title & Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Applicants</th>
                  <th className="px-6 py-4 text-center">Views</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredJobs.map((job) => {
                  const isLoading = loadingJobId === job.id;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          <Link
                            href={`/employer/jobs/${job.id}/applications`}
                            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          >
                            {job.title}
                          </Link>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <span>{job.jobType.replace("_", " ")}</span>
                          {job.district && (
                            <>
                              <span>•</span>
                              <span>{job.district.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/employer/jobs/${job.id}/applications`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job._count.applications}</span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {job.viewCount}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/employer/jobs/${job.id}/applications`}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            Review ({job._count.applications})
                          </Link>

                          {job.status === "APPROVED" && (
                            <Link
                              href={`/jobs/${job.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                              title="View Public Post"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {job.status === "APPROVED" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(job.id, "FILLED")}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition"
                              title="Mark as Filled"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {(job.status === "APPROVED" || job.status === "FILLED") && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(job.id, "ARCHIVED")}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 transition"
                              title="Archive Vacancy"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {job.status === "ARCHIVED" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(job.id, "APPROVED")}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition"
                              title="Reactivate Vacancy"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
