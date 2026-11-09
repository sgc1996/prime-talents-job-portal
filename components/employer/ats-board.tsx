"use client";

import * as React from "react";
import { useState } from "react";
import { ApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateApplicationStatusAction } from "@/server/actions/employer.actions";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  XCircle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

interface CandidateData {
  id: string;
  headline: string | null;
  summary: string | null;
  experienceYears: number | null;
  educationLevel: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  district?: { name: string } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

interface ApplicationData {
  id: string;
  status: ApplicationStatus;
  answers: any;
  employerNote: string | null;
  cvFileId: string | null;
  createdAt: Date | string;
  candidate: CandidateData;
}

interface ATSBoardProps {
  jobId: string;
  jobTitle: string;
  screeningQuestions: { id: string; question: string; type: string }[];
  initialApplications: ApplicationData[];
}

const COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "NEW", label: "New", color: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" },
  { status: "SHORTLISTED", label: "Shortlisted", color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20" },
  { status: "INTERVIEW", label: "Interview", color: "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20" },
  { status: "OFFERED", label: "Offered", color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" },
  { status: "HIRED", label: "Hired", color: "border-green-600 bg-green-50/50 dark:bg-green-950/20" },
  { status: "REJECTED", label: "Rejected", color: "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20" },
];

export function ATSBoard({
  jobId: _jobId,
  jobTitle: _jobTitle,
  screeningQuestions,
  initialApplications,
}: ATSBoardProps) {
  const [applications, setApplications] = useState<ApplicationData[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const openAppDetails = (app: ApplicationData) => {
    setSelectedApp(app);
    setNoteInput(app.employerNote || "");
  };

  const handleStatusTransition = async (appId: string, nextStatus: ApplicationStatus, note?: string) => {
    try {
      setIsUpdating(true);
      await updateApplicationStatusAction(appId, nextStatus, note);
      
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: nextStatus, employerNote: note !== undefined ? note : a.employerNote }
            : a
        )
      );

      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) =>
          prev
            ? {
                ...prev,
                status: nextStatus,
                employerNote: note !== undefined ? note : prev.employerNote,
              }
            : null
        );
      }

      toast.success(`Candidate moved to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedApp) return;
    try {
      setIsUpdating(true);
      await updateApplicationStatusAction(selectedApp.id, selectedApp.status, noteInput);
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, employerNote: noteInput } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, employerNote: noteInput } : null));
      toast.success("Recruiter note saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    switch (current) {
      case "NEW":
        return "SHORTLISTED";
      case "SHORTLISTED":
        return "INTERVIEW";
      case "INTERVIEW":
        return "OFFERED";
      case "OFFERED":
        return "HIRED";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px] overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);

          return (
            <div
              key={col.status}
              className={`flex flex-col rounded-2xl border ${col.color} p-3.5 transition`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-xs font-bold shadow-xs text-slate-700 dark:text-slate-300">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                {colApps.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 italic">
                    No candidates
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => openAppDetails(app)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs hover:shadow-md cursor-pointer transition hover:border-emerald-500/50 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                          {app.candidate.user.name || "Anonymous Candidate"}
                        </h4>
                      </div>

                      {app.candidate.headline && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                          {app.candidate.headline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                        {app.candidate.district && (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {app.candidate.district.name}
                          </span>
                        )}
                        {app.candidate.experienceYears !== null && (
                          <span>• {app.candidate.experienceYears}y exp</span>
                        )}
                      </div>

                      {/* Card Quick Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        {app.cvFileId ? (
                          <a
                            href={`/api/files/${app.cvFileId}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
                          >
                            <FileText className="w-3 h-3" />
                            CV
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No CV</span>
                        )}

                        <div className="flex items-center gap-1">
                          {getNextStatus(app.status) && (
                            <button
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusTransition(app.id, getNextStatus(app.status)!);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-medium flex items-center gap-0.5"
                              title={`Advance to ${getNextStatus(app.status)}`}
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {app.status !== "REJECTED" && app.status !== "HIRED" && (
                            <button
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusTransition(app.id, "REJECTED");
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                              title="Reject candidate"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Detail Modal / Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedApp.candidate.user.name || "Anonymous Candidate"}
                  </h3>
                  <Badge variant="outline">{selectedApp.status}</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedApp.candidate.headline || "Candidate Profile"}
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Quick Contact & Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{selectedApp.candidate.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{selectedApp.candidate.user.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  District: {selectedApp.candidate.district?.name || "Not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Applied:{" "}
                  {new Date(selectedApp.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Candidate Summary */}
            {selectedApp.candidate.summary && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Executive Summary
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {selectedApp.candidate.summary}
                </div>
              </div>
            )}

            {/* CV attachment */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Resume / Curriculum Vitae
              </h4>
              {selectedApp.cvFileId ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Candidate_CV.pdf
                      </p>
                      <p className="text-xs text-slate-500">Official Candidate Document</p>
                    </div>
                  </div>
                  <a
                    href={`/api/files/${selectedApp.cvFileId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                  >
                    <span>View / Download</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No CV document attached</p>
              )}
            </div>

            {/* Screening Answers if any */}
            {selectedApp.answers && Object.keys(selectedApp.answers).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Screening Question Responses
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {Object.entries(selectedApp.answers).map(([key, val], idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {key.startsWith("q_")
                          ? screeningQuestions.find((q) => q.id === key.replace("q_", ""))?.question || key
                          : key}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Answer: <span className="font-medium text-emerald-600 dark:text-emerald-400">{String(val)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter Internal Note */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Internal Recruiter Notes (Private)
              </h4>
              <Textarea
                rows={3}
                placeholder="Add confidential notes on interview feedback, salary discussions, etc."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="text-xs"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={isUpdating}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
                >
                  Save Note
                </Button>
              </div>
            </div>

            {/* Move Status Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Move Candidate:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    "NEW",
                    "SHORTLISTED",
                    "INTERVIEW",
                    "OFFERED",
                    "HIRED",
                    "REJECTED",
                  ] as ApplicationStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    disabled={isUpdating || selectedApp.status === status}
                    onClick={() => handleStatusTransition(selectedApp.id, status, noteInput)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedApp.status === status
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-default"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
