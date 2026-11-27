"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Banknote,
  Send,
  Loader2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { ApplicationStatus, UserStatus } from "@prisma/client";
import { updateAdminApplicationStatusAction } from "@/server/actions/admin.actions";

export interface CandidateDetailData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: Date | string;
  candidateProfile?: {
    id: string;
    headline: string | null;
    summary: string | null;
    phone: string | null;
    experienceYears: number | null;
    educationLevel: string | null;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    openToWork: boolean;
    profileCompleteness: number;
    district?: {
      id: string;
      name: string;
      province?: {
        name: string;
      } | null;
    } | null;
    applications: {
      id: string;
      status: ApplicationStatus;
      createdAt: Date | string;
      cvFileId: string | null;
      employerNote: string | null;
      answers: any;
      job: {
        id: string;
        title: string;
        slug: string;
        jobType: string;
        city?: string | null;
        employer: {
          companyName: string;
        };
      };
    }[];
  } | null;
  latestCv?: {
    id: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date | string;
  } | null;
}

interface CandidateDetailsDialogProps {
  candidate: CandidateDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationStatusUpdated?: () => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200",
  SHORTLISTED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200",
  INTERVIEW: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200",
  OFFERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
  HIRED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200",
};

export function CandidateDetailsDialog({
  candidate,
  isOpen,
  onClose,
  onApplicationStatusUpdated,
}: CandidateDetailsDialogProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  if (!candidate) return null;

  const profile = candidate.candidateProfile;
  const applications = profile?.applications || [];
  const latestCv = candidate.latestCv;

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success("Email copied to clipboard");
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
      toast.success("Phone copied to clipboard");
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingAppId(appId);
      const note = editingNotes[appId];
      await updateAdminApplicationStatusAction(appId, newStatus, note);
      toast.success(`Application status updated to ${newStatus}`);
      if (onApplicationStatusUpdated) onApplicationStatusUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status");
    } finally {
      setUpdatingAppId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-lg flex items-center justify-center shrink-0 border border-emerald-300/40">
                {candidate.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {candidate.name || "Unnamed Candidate"}
                  {profile?.openToWork && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Open to Work
                    </span>
                  )}
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile?.headline || "No professional headline set"}
                </p>
              </div>
            </div>

            {latestCv && (
              <a
                href={`/api/files/${latestCv.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                Download CV ({formatFileSize(latestCv.sizeBytes)})
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Contact & Geography Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Email */}
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="truncate text-slate-700 dark:text-slate-300 hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(candidate.email, "email")}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                {candidate.phone ? (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="truncate text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    {candidate.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">No phone provided</span>
                )}
              </div>
              {candidate.phone && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(candidate.phone!, "phone")}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Copy Phone"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* District & Province */}
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate text-slate-700 dark:text-slate-300">
                {profile?.district
                  ? `${profile.district.name}${profile.district.province ? `, ${profile.district.province.name}` : ""}`
                  : "Sri Lanka (Unspecified)"}
              </span>
            </div>
          </div>

          {/* Professional Credentials & Resume Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Credentials Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Career Credentials
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Experience:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {profile?.experienceYears !== null && profile?.experienceYears !== undefined
                      ? `${profile.experienceYears} Years`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Education:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {profile?.educationLevel || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-slate-400" />
                    Expected Salary:
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {profile?.expectedSalaryMin || profile?.expectedSalaryMax
                      ? `LKR ${profile?.expectedSalaryMin?.toLocaleString() || "0"} - ${profile?.expectedSalaryMax?.toLocaleString() || "Open"}`
                      : "Negotiable / Open"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Registered:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume / Document Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Candidate CV / Resume
                </h4>
                {latestCv ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-xs overflow-hidden">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        Resume Document (PDF)
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Size: {formatFileSize(latestCv.sizeBytes)} • Uploaded: {new Date(latestCv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      No CV document uploaded yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Candidate has not attached a general PDF resume.
                    </p>
                  </div>
                )}
              </div>

              {latestCv && (
                <div className="pt-2">
                  <a
                    href={`/api/files/${latestCv.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open PDF in New Window
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Summary / Bio */}
          {profile?.summary && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Professional Bio &amp; Summary
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {profile.summary}
              </p>
            </div>
          )}

          {/* Job Applications Submitted */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Submitted Applications ({applications.length})
              </h4>
              <span className="text-xs text-slate-500">
                Real-time agency tracking
              </span>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.job.title}
                        </h5>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {app.job.employer.companyName}
                          </span>
                          <span>•</span>
                          <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            STATUS_COLORS[app.status] || "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {app.status}
                        </span>

                        {/* Status Change Dropdown */}
                        <select
                          value={app.status}
                          disabled={updatingAppId === app.id}
                          onChange={(e) =>
                            handleUpdateStatus(app.id, e.target.value as ApplicationStatus)
                          }
                          className="h-8 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 text-foreground focus:ring-1 focus:ring-primary"
                        >
                          <option value="NEW">NEW</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW">INTERVIEW</option>
                          <option value="OFFERED">OFFERED</option>
                          <option value="HIRED">HIRED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>

                    {/* Specific Application CV download */}
                    {app.cvFileId && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`/api/files/${app.cvFileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          View Application-Specific CV
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                        </a>
                      </div>
                    )}

                    {/* Screening Answers */}
                    {app.answers && typeof app.answers === "object" && Object.keys(app.answers).length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                          Screening Question Answers:
                        </p>
                        {Object.entries(app.answers).map(([key, val]) => (
                          <div key={key} className="text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{key}:</span>{" "}
                            {String(val)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Agency Recruiter Internal Note */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Internal recruiter note on this application..."
                        defaultValue={app.employerNote || ""}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({ ...prev, [app.id]: e.target.value }))
                        }
                        className="flex-1 h-8 rounded-lg bg-background border border-input px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingAppId === app.id}
                        onClick={() => handleUpdateStatus(app.id, app.status)}
                        className="h-8 text-xs shrink-0"
                      >
                        {updatingAppId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Save Note"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                This candidate has not applied for any platform vacancies yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
